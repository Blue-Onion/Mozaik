import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from "#src/lib/prisma.js";
import logger from '#utils/logger.js';

const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  logger.warn('GOOGLE_AI_API_KEY or GEMINI_API_KEY environment variable is not set');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * List available models (for debugging)
 * Uncomment and call this function to see available models
 */
// export const listAvailableModels = async () => {
//   if (!genAI) {
//     throw new Error('API key not configured');
//   }
//   const models = await genAI.listModels();
//   return models;
// };

/**
 * Get the last 10 prompts from a project
 */
export const getLast10PromptsByProject = async (projectId, userId) => {
  const prompts = await db.prompt.findMany({
    where: {
      projectId: projectId,
      userId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
    select: {
      id: true,
      text: true,
      createdAt: true,
    },
  });
  return prompts.reverse(); // Reverse to get chronological order (oldest first)
};

/**
 * Analyze prompts and generate manim code
 */
export const generateManimCode = async (projectId, userId) => {
  try {
    // Get last 10 prompts from the project
    const prompts = await getLast10PromptsByProject(projectId, userId);

    if (prompts.length === 0) {
      throw new Error('No prompts found in this project');
    }

    // Build the scenario description from prompts
    const scenarioText = prompts
      .map((prompt, index) => `Prompt ${index + 1}: ${prompt.text}`)
      .join('\n');

    // Create the prompt for AI
    const aiPrompt = `
    You are a senior Manim (Mathematical Animation Engine) developer.
    
    You will receive the last 10 prompts from a project. Using ALL of them together, infer the intended animation and produce a single coherent Manim Python script.
    
    -------------------------
    PROMPTS:
    ${scenarioText}
    -------------------------
    
    REQUIREMENTS:
    1. Output ONLY valid Python code.
    2. Do NOT output markdown.
    3. Do NOT output backticks.
    4. Do NOT output comments.
    5. Do NOT output explanations.
    6. The script must be fully runnable with Manim Community v0.17+.
    7. Include all required imports.
    8. Use clean, readable, production-level structure.
    9. Use proper Manim constructs: Scene, animations, ValueTracker, updaters, VGroup, etc., as appropriate.
    10. The animation must correctly reflect the combined meaning of all given prompts.
    11. The code must be complete—no placeholders or TODOs.
    
    Your final answer must be ONLY the raw Python code, nothing else.
    `;
    
    // Validate API key
    if (!genAI || !apiKey) {
      throw new Error('Google AI API key is not configured. Please set GOOGLE_AI_API_KEY or GEMINI_API_KEY environment variable.');
    }

    // Generate code using Gemini with retry logic and fallback models
    const models = process.env.GEMINI_MODEL 
      ? [process.env.GEMINI_MODEL] 
      : ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash-latest'];
    
    let lastError = null;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds base delay
    
    for (const modelName of models) {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const result = await model.generateContent(aiPrompt);
          const response = await result.response;
          const generatedCode = response.text();
          
          // Clean up the code (remove markdown code blocks if present)
          const cleanCode = generatedCode
            .replace(/```python\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

          return {
            code: cleanCode,
            modelUsed: modelName,
            promptsUsed: prompts.length,
            prompts: prompts.map(p => ({ id: p.id, text: p.text })),
          };
        } catch (apiError) {
          lastError = apiError;
          
          // Handle service unavailable (503) - retry with delay
          if (apiError.message && (apiError.message.includes('503') || apiError.message.includes('overloaded') || apiError.message.includes('Service Unavailable'))) {
            if (attempt < maxRetries - 1) {
              const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
              logger.warn(`Model ${modelName} overloaded, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue; // Retry with same model
            } else {
              logger.warn(`Model ${modelName} still overloaded after ${maxRetries} attempts, trying next model`);
              break; // Try next model
            }
          }
          
          // Handle rate limit errors (429)
          if (apiError.message && apiError.message.includes('429')) {
            logger.error('Rate limit exceeded:', apiError.message);
            throw new Error('API rate limit exceeded. Please wait a moment and try again, or upgrade your Google AI API plan.');
          }
          
          // Handle quota errors
          if (apiError.message && (apiError.message.includes('quota') || apiError.message.includes('Quota'))) {
            logger.error('Quota exceeded:', apiError.message);
            throw new Error('API quota exceeded. Please check your Google AI API billing and quota limits.');
          }
          
          // For other errors, try next model
          if (models.indexOf(modelName) < models.length - 1) {
            logger.warn(`Error with model ${modelName}, trying next model:`, apiError.message);
            break; // Try next model
          }
          
          // If this is the last model, throw the error
          throw apiError;
        }
      }
    }
    
    // If all models failed, throw the last error
    if (lastError) {
      if (lastError.message && (lastError.message.includes('503') || lastError.message.includes('overloaded'))) {
        throw new Error('All models are currently overloaded. Please try again in a few moments.');
      }
      throw lastError;
    }

  } catch (error) {
    logger.error('Error generating manim code:', error);
    throw error;
  }
};

/**
 * Debug and fix generated Manim code
 */
export const debugManimCode = async (code) => {
  try {
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      throw new Error('Code is required and must be a non-empty string');
    }

    // Validate API key
    if (!genAI || !apiKey) {
      throw new Error('Google AI API key is not configured. Please set GOOGLE_AI_API_KEY or GEMINI_API_KEY environment variable.');
    }

    // Create debug prompt
    const debugPrompt = `You are an expert Python and Manim code reviewer and debugger.

Review the following Manim Python code for errors, issues, and improvements:

\`\`\`python
${code}
\`\`\`

Please:
1. Check for syntax errors
2. Check for Manim API compatibility (Manim Community v0.17+)
3. Verify all imports are correct
4. Check for logical errors
5. Suggest improvements for code quality
6. If there are errors, provide the corrected code

IMPORTANT:
- If the code has errors, output ONLY the corrected Python code (no markdown, no backticks, no explanations)
- If the code is correct, output ONLY the original code (no markdown, no backticks, no explanations)
- Do NOT include any comments or explanations
- Do NOT include markdown formatting
- Output ONLY raw Python code

If there are critical errors that cannot be fixed, output the code with minimal fixes to make it syntactically correct.`;

    // Use Gemini to debug the code
    const models = process.env.GEMINI_MODEL 
      ? [process.env.GEMINI_MODEL] 
      : ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash-latest'];
    
    let lastError = null;
    const maxRetries = 3;
    const retryDelay = 2000;
    
    for (const modelName of models) {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const result = await model.generateContent(debugPrompt);
          const response = await result.response;
          const debuggedCode = response.text();
          
          // Clean up the code (remove markdown code blocks if present)
          const cleanCode = debuggedCode
            .replace(/```python\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

          return {
            originalCode: code,
            debuggedCode: cleanCode,
            modelUsed: modelName,
            hasChanges: cleanCode !== code.trim(),
          };
        } catch (apiError) {
          lastError = apiError;
          
          // Handle service unavailable (503) - retry with delay
          if (apiError.message && (apiError.message.includes('503') || apiError.message.includes('overloaded') || apiError.message.includes('Service Unavailable'))) {
            if (attempt < maxRetries - 1) {
              const delay = retryDelay * Math.pow(2, attempt);
              logger.warn(`Model ${modelName} overloaded for debug, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            } else {
              logger.warn(`Model ${modelName} still overloaded after ${maxRetries} attempts, trying next model`);
              break;
            }
          }
          
          // Handle rate limit errors (429)
          if (apiError.message && apiError.message.includes('429')) {
            logger.error('Rate limit exceeded during debug:', apiError.message);
            throw new Error('API rate limit exceeded. Please wait a moment and try again.');
          }
          
          // Handle quota errors
          if (apiError.message && (apiError.message.includes('quota') || apiError.message.includes('Quota'))) {
            logger.error('Quota exceeded during debug:', apiError.message);
            throw new Error('API quota exceeded. Please check your Google AI API billing and quota limits.');
          }
          
          // For other errors, try next model
          if (models.indexOf(modelName) < models.length - 1) {
            logger.warn(`Error with model ${modelName} during debug, trying next model:`, apiError.message);
            break;
          }
          
          throw apiError;
        }
      }
    }
    
    // If all models failed, throw the last error
    if (lastError) {
      if (lastError.message && (lastError.message.includes('503') || lastError.message.includes('overloaded'))) {
        throw new Error('All models are currently overloaded. Please try again in a few moments.');
      }
      throw lastError;
    }
  } catch (error) {
    logger.error('Error debugging manim code:', error);
    throw error;
  }
};



import { generateManimCode, debugManimCode } from "#src/services/code.service.js";
import logger from '#utils/logger.js';

/**
 * Generate manim code by analyzing last 10 prompts in a project
 */
export const generateCode = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required',
      });
    }

    const result = await generateManimCode(projectId, userId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Generate code error:', error);
    
    if (error.message === 'No prompts found in this project') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    next(error);
  }
};

/**
 * Debug and fix generated manim code
 */
export const debugCode = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
      });
    }

    const result = await debugManimCode(code);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Debug code error:', error);
    next(error);
  }
};


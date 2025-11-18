import { db } from "#src/lib/prisma.js";

/**
 * Create a new prompt
 */
export const createPrompt = async (userId, text, projectId = null) => {
  const prompt = await db.prompt.create({
    data: {
      userId: userId,
      text: text,
      projectId: projectId,
      status: 'PENDING',
    },
    select: {
      id: true,
      text: true,
      generatedCode: true,
      status: true,
      projectId: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return prompt;
};

/**
 * Get all prompts for a user
 */
export const getAllPrompts = async (userId) => {
  const prompts = await db.prompt.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      text: true,
      generatedCode: true,
      status: true,
      projectId: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return prompts;
};

/**
 * Get all prompts for a project
 */
export const getPromptsByProject = async (projectId, userId) => {
  const prompts = await db.prompt.findMany({
    where: {
      projectId: projectId,
      userId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      text: true,
      generatedCode: true,
      status: true,
      projectId: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return prompts;
};

/**
 * Get a single prompt by ID
 */
export const getPrompt = async (promptId, userId) => {
  const prompt = await db.prompt.findFirst({
    where: {
      id: promptId,
      userId: userId,
    },
    select: {
      id: true,
      text: true,
      generatedCode: true,
      status: true,
      projectId: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return prompt;
};

/**
 * Update prompt status
 */
export const updatePromptStatus = async (promptId, userId, status) => {
  const prompt = await db.prompt.updateMany({
    where: {
      id: promptId,
      userId: userId,
    },
    data: {
      status: status,
    },
  });
  return prompt;
};

/**
 * Update generated code for a prompt
 */
export const updatePromptGeneratedCode = async (promptId, userId, generatedCode) => {
  const prompt = await db.prompt.updateMany({
    where: {
      id: promptId,
      userId: userId,
    },
    data: {
      generatedCode: generatedCode,
      status: 'GENERATING_CODE',
    },
  });
  return prompt;
};


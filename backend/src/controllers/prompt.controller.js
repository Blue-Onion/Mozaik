import { createPrompt, getAllPrompts, getPromptsByProject, getPrompt, updatePromptStatus, updatePromptGeneratedCode } from "#src/services/prompt.service.js";
import logger from '#utils/logger.js';

/**
 * Create a new prompt
 */
export const newPrompt = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { text, projectId } = req.body;

    const prompt = await createPrompt(userId, text, projectId || null);

    res.status(201).json({
      success: true,
      prompt,
    });
  } catch (error) {
    logger.error("Create prompt error:", error);
    next(error);
  }
};

/**
 * Get all prompts for the authenticated user
 */
export const allPrompts = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const prompts = await getAllPrompts(userId);

    res.status(200).json({
      success: true,
      prompts,
    });
  } catch (error) {
    logger.error("Get all prompts error:", error);
    next(error);
  }
};

/**
 * Get all prompts for a project
 */
export const projectPrompts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId;

    const prompts = await getPromptsByProject(projectId, userId);

    res.status(200).json({
      success: true,
      prompts,
    });
  } catch (error) {
    logger.error("Get project prompts error:", error);
    next(error);
  }
};

/**
 * Get a single prompt by ID
 */
export const onePrompt = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const promptId = req.params.id;

    const prompt = await getPrompt(promptId, userId);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: "Prompt not found",
      });
    }

    res.status(200).json({
      success: true,
      prompt,
    });
  } catch (error) {
    logger.error("Get one prompt error:", error);
    next(error);
  }
};

/**
 * Update prompt status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const promptId = req.params.id;
    const { status } = req.body;

    await updatePromptStatus(promptId, userId, status);

    res.status(200).json({
      success: true,
      message: "Prompt status updated",
    });
  } catch (error) {
    logger.error("Update prompt status error:", error);
    next(error);
  }
};

/**
 * Update generated code for a prompt
 */
export const updateGeneratedCode = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const promptId = req.params.id;
    const { generatedCode } = req.body;

    await updatePromptGeneratedCode(promptId, userId, generatedCode);

    res.status(200).json({
      success: true,
      message: "Generated code updated",
    });
  } catch (error) {
    logger.error("Update generated code error:", error);
    next(error);
  }
};


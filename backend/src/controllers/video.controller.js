import { generateVideoFromCode, getVideo } from "#src/services/video.service.js";
import logger from '#utils/logger.js';

/**
 * Generate video from Manim code
 */
export const generateVideo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { code, promptId, projectId } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
      });
    }

    logger.info(`Generating video for user ${userId}, promptId: ${promptId}, projectId: ${projectId}`);

    const result = await generateVideoFromCode(code, userId, promptId || null, projectId || null);

    res.status(201).json({
      success: true,
      video: result.video,
      videoUrl: result.videoUrl,
      fileSize: result.fileSize,
      message: 'Video generated successfully',
    });
  } catch (error) {
    logger.error('Generate video error:', error);
    
    if (error.message.includes('Manim execution failed')) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate video. Please check your Manim code for errors.',
        details: error.message,
      });
    }

    next(error);
  }
};

/**
 * Get video by ID
 */
export const getVideoById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const videoId = req.params.id;

    const video = await getVideo(videoId, userId);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    res.status(200).json({
      success: true,
      video,
    });
  } catch (error) {
    logger.error('Get video error:', error);
    next(error);
  }
};


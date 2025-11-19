import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';
import logger from '#utils/logger.js';
import { db } from '#lib/prisma.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MANIM_CONTAINER = 'mozaik-manim';
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');
const CODE_DIR = path.join(UPLOADS_DIR, 'code');

/**
 * Ensure directories exist
 */
const ensureDirectories = async () => {
  await fs.mkdir(VIDEOS_DIR, { recursive: true });
  await fs.mkdir(CODE_DIR, { recursive: true });
};

/**
 * Generate a unique filename
 */
const generateUniqueId = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Execute Manim code in Docker container
 */
export const generateVideoFromCode = async (code, userId, promptId = null, projectId = null) => {
  try {
    await ensureDirectories();

    const uniqueId = generateUniqueId();
    const codeFileName = `manim_${uniqueId}.py`;
    const codeFilePath = path.join(CODE_DIR, codeFileName);
    const outputFileName = `video_${uniqueId}`;
    
    // Write code to file
    await fs.writeFile(codeFilePath, code, 'utf8');
    logger.info(`Code written to ${codeFilePath}`);

    // Copy code file to Manim container
    const copyCommand = `docker cp ${codeFilePath} ${MANIM_CONTAINER}:/manim/${codeFileName}`;
    try {
      await execAsync(copyCommand);
      logger.info(`Code file copied to container`);
    } catch (error) {
      logger.error(`Failed to copy code to container:`, error);
      throw new Error('Failed to copy code to Manim container');
    }

    // Execute Manim in container
    // Using -ql (low quality) for faster rendering, can be changed to -qh (high quality)
    // Using --output_file to specify output location
    const manimCommand = `docker exec ${MANIM_CONTAINER} manim -ql /manim/${codeFileName} --format mp4 --output_file /manim/output/${outputFileName}.mp4`;
    
    let stdout, stderr;
    try {
      const result = await execAsync(manimCommand, { timeout: 300000 }); // 5 minute timeout
      stdout = result.stdout;
      stderr = result.stderr;
      logger.info(`Manim execution stdout: ${stdout}`);
      if (stderr) {
        logger.warn(`Manim execution stderr: ${stderr}`);
      }
    } catch (error) {
      logger.error(`Manim execution failed:`, error);
      
      // Try to find video in default Manim output location
      const defaultVideoPath = `/manim/media/videos/${codeFileName.replace('.py', '')}/480p15/${codeFileName.replace('.py', '')}.mp4`;
      const checkDefaultCommand = `docker exec ${MANIM_CONTAINER} test -f ${defaultVideoPath} && echo ${defaultVideoPath}`;
      
      try {
        const checkResult = await execAsync(checkDefaultCommand);
        const foundPath = checkResult.stdout.trim();
        if (foundPath) {
          logger.info(`Found video at default location: ${foundPath}`);
          // Copy from default location to output
          await execAsync(`docker exec ${MANIM_CONTAINER} cp ${foundPath} /manim/output/${outputFileName}.mp4`);
        } else {
          throw new Error(`Manim execution failed: ${error.message}`);
        }
      } catch {
        throw new Error(`Manim execution failed: ${error.message}`);
      }
    }

    // Check if video was generated in output directory
    const videoPathInContainer = `/manim/output/${outputFileName}.mp4`;
    const checkOutputCommand = `docker exec ${MANIM_CONTAINER} test -f ${videoPathInContainer} && echo ${videoPathInContainer}`;
    
    let finalVideoPath;
    try {
      const checkResult = await execAsync(checkOutputCommand);
      finalVideoPath = checkResult.stdout.trim();
      
      if (!finalVideoPath) {
        // Try to find in media directory (Manim default)
        const findVideoCommand = `docker exec ${MANIM_CONTAINER} find /manim/media -name "*.mp4" -type f | tail -1`;
        const findResult = await execAsync(findVideoCommand);
        const foundPath = findResult.stdout.trim();
        
        if (foundPath) {
          logger.info(`Found video in media directory: ${foundPath}`);
          // Copy to output directory
          await execAsync(`docker exec ${MANIM_CONTAINER} cp ${foundPath} ${videoPathInContainer}`);
          finalVideoPath = videoPathInContainer;
        } else {
          throw new Error('Video file not found after Manim execution');
        }
      }
      
      logger.info(`Using video at: ${finalVideoPath}`);
    } catch (error) {
      logger.error(`Failed to locate video file:`, error);
      throw new Error('Video file not found after execution');
    }

    // Copy video from container to host
    const hostVideoPath = path.join(VIDEOS_DIR, `${outputFileName}.mp4`);
    const copyVideoCommand = `docker cp ${MANIM_CONTAINER}:${finalVideoPath} ${hostVideoPath}`;
    
    try {
      await execAsync(copyVideoCommand);
      logger.info(`Video copied to ${hostVideoPath}`);
    } catch (error) {
      logger.error(`Failed to copy video from container:`, error);
      throw new Error('Failed to copy video from container');
    }

    // Clean up code file from container
    try {
      await execAsync(`docker exec ${MANIM_CONTAINER} rm -f /manim/${codeFileName}`);
      // Also clean up media files
      await execAsync(`docker exec ${MANIM_CONTAINER} rm -rf /manim/media`);
    } catch (error) {
      logger.warn(`Failed to clean up container files:`, error);
    }

    // Get video file stats
    const videoStats = await fs.stat(hostVideoPath);
    const videoUrl = `/uploads/videos/${outputFileName}.mp4`;

    // Save video record to database
    const video = await db.video.create({
      data: {
        videoUrl: videoUrl,
        userId: userId,
        promptId: promptId,
        projectId: projectId,
        durationSec: null, // Could extract from video metadata if needed
        resolution: null, // Could extract from video metadata if needed
      },
      select: {
        id: true,
        videoUrl: true,
        durationSec: true,
        resolution: true,
        createdAt: true,
      },
    });

    return {
      video,
      videoUrl: videoUrl,
      filePath: hostVideoPath,
      fileSize: videoStats.size,
    };
  } catch (error) {
    logger.error('Error generating video:', error);
    throw error;
  }
};

/**
 * Get video by ID
 */
export const getVideo = async (videoId, userId) => {
  const video = await db.video.findFirst({
    where: {
      id: videoId,
      userId: userId,
    },
    select: {
      id: true,
      videoUrl: true,
      durationSec: true,
      resolution: true,
      createdAt: true,
      prompt: {
        select: {
          id: true,
          text: true,
        },
      },
    },
  });
  return video;
};


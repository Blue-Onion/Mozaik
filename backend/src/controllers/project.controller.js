import { createProject, getAllProject, getProject } from "#src/services/project.service.js";
import logger from '#utils/logger.js';

export const newProject = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { name, description } = req.body;
  
      const project = await createProject(userId, name, description);
  
      res.status(200).json({
        success: true,
        project,
      });
    } catch (error) {
      logger.error("New project error:", error);
      next(error);
    }
  };
  
  export const allProject = async (req, res, next) => {
    try {
      const userId = req.user.id;
  
      const projects = await getAllProject(userId);
  
      res.status(200).json({
        success: true,
        projects,
      });
    } catch (error) {
      logger.error("Get all projects error:", error);
      next(error);
    }
  };
  
  export const oneProject = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const projectId = req.params.id;
  
      const project = await getProject(projectId, userId);
  
      if (!project) {
        return res.status(404).json({
          success: false,
          error: "Project not found",
        });
      }
  
      res.status(200).json({
        success: true,
        project,
      });
    } catch (error) {
      logger.error("Get one project error:", error);
      next(error);
    }
  };
  

import express from 'express';
import { requireValidMe } from '#middleware/auth.middleware.js';
import { allProject, newProject, oneProject } from '#src/controllers/project.controller.js';

const router = express.Router();
router.use(requireValidMe)

router.post('/create-project', newProject);
router.get('/get-all-project', allProject);
router.get('/get-one-project/:id', oneProject);


export default router;
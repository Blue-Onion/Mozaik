import express from 'express';
import { register, login, logout, getMe } from '#controllers/auth.controller.js';
import { validate } from '#middleware/validation.middleware.js';
import { registerSchema, loginSchema } from '#validations/auth.validation.js';
import { authenticate } from '#middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/generate-code', (req, res) => {
    const { code } = req.body;
    const generatedCode = generateCode(code);
    res.json({ code: generatedCode });
});
router.get('/get-generated-code', (req, res) => {
    const { code } = req.body;
    const generatedCode = generateCode(code);
    res.json({ code: generatedCode });
});


export default router;
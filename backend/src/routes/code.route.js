import express from 'express';
import { requireValidMe } from '#middleware/auth.middleware.js';

const router = express.Router();
router.use(requireValidMe)
// Protected routes - require valid /api/auth/me status (200)
router.post('/generate-code', (req, res) => {
    const { code } = req.body;
    const generatedCode = generateCode(code);
    res.json({ code: generatedCode });
});
router.get('/get-generated-code', (req, res) => {
    
    res.json({ message: 'Hello, world!' });
});


export default router;
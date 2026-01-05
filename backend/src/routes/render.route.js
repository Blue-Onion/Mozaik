import { requireValidMe } from "#src/middleware/auth.middleware.js";
import express from "express";
const router = express.Router();
router.use(requireValidMe);


router.get("/renderedVideos/:videoId",getRenderVideo)
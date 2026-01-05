import { db } from "#src/lib/prisma.js"
import { getVideoFromDb } from "#src/services/render.service.js"
import logger from "#src/utils/logger.js"

export const getRenderedVideo=async(req,res,next)=>{
    try {
        const userId=req.user.id
        const videoId=req.params.videoId
        const video=await getVideoFromDb(videoId,userId)
    } catch (error) {
        logger.error("Get Rendered Message:",error.message)
        next(error)
    }
}
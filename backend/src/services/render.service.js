import { db } from "#src/lib/prisma.js"

export const getVideoFromDb=async(videoId,userId)=>{
   
    const video=await db.video.findOne(
       {
        where:{
            userId:userId,
            id:videoId
        }
       }
    )



}
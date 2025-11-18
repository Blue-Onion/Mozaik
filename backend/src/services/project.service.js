import { db } from "#src/lib/prisma.js"

export const createProject=async(userId,name,desc="")=>{
    const project=await db.project.create({
        data:{
            userId:userId,
            name:name,
            description:desc
        },
        select:{
            id:true,
            name:true,
            userId:true
        }
    })
    return project

}
export const getAllProject=async(userId)=>{
    const project=await db.project.findMany({
        where:{
            userId:userId,
    
        },
     
    })
    return project
}
export const getProject=async(projectId,userId)=>{
    const project=await db.project.findFirst({
        where:{
            id:projectId,
            userId:userId
        },
     
    })
    return project
}
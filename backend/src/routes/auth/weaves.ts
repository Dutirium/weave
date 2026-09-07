import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../../db.js";
import { authenticate } from "../../middleware/authenticate.js";
import { Prisma } from "../../generated/prisma/client.js";

const router = Router();
const validRelations = [
    "REPLY",
    "SUPPORT",
    "CHALLENGE",
    "COUNTER",
    "QUESTION"
];


//fetch all weaves for a global dashboard 
router.get("/", authenticate, async (req: Request, res: Response) =>{
    try{
        const weaves = await prisma.weave.findMany({
            orderBy: {
                createdAt:"desc",
            },
            include:{
                user:{
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        })

        if(!weaves){
            res.status(204).json({
                message: "No weaves yet"
            });
            return;
        }

        res.status(200).json({
            weaves,
        });


    }catch(e){
        console.error("Error fetching weaves: ", e);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

//To fetch a particular weave
router.get("/:id", authenticate, async (req: Request<{id: string}>, res: Response) =>{

    try{

        const { id } = req.params;

        if(!id){
            res.status(400).json({
                error: "Id not found"
            });
            return;
        }

        const weave = await prisma.weave.findUnique({
            where: {
                id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        if(!weave){
            res.status(404).json({
                error: "Weave not found",
            });
            return;
        }

        res.status(200).json({
            weave,
        });

    }catch(e){
        console.error("Error fetching weave: ", e);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

//get messages for a particular weave 50 by default at max 100
router.get("/:id/messages", authenticate, async (req: Request<{ id: string}>, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                error: "Authentication required",
            });
            return;
        }

        const { id: weaveId } = req.params;

        const weave = await prisma.weave.findUnique({
            where: {
                id: weaveId,
            },
        });

        if (!weave) {
            res.status(404).json({
                error: "Weave not found",
            });
            return;
        }

        const limitParam = req.query.limit;
        const beforeParam = req.query.before;

        const limit = Math.min(
            Math.max(Number(limitParam) || 50, 1),100
        );

        const before = beforeParam ? Number(beforeParam): undefined;

        const messages = await prisma.messages.findMany({
            where: {
                weave_id: weaveId,

                ...(before !== undefined && {
                    sequence: {
                        lt: before,
                    },
                }),
            },
            orderBy: {
                sequence: "desc",
            },
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    }
                }
            }
        });

        res.status(200).json({
            messages: messages.reverse(),
        });

    } catch (error) {
        console.error("Error fetching messages:", error);

        res.status(500).json({
            error: "Internal server error",
        });
    }
});

//push the messages related to a particular weave 
router.post("/:id/messages", authenticate, async (req: Request<{ id: string}>, res: Response )=>{
    try{

        if(!req.user){
            res.status(401).json({
                error: "Authentication Required"
            });
            return;
        }

        const { id: weaveId } = req.params;
        const { content, targetMessageId, relation, clientMessageId } = req.body;

        //check relation
        if(relation !== undefined && !validRelations.includes(relation)){
            res.status(400).json({
                error: "Invalid Relation"
            });
            return;
        }

        //validate content
        if(!content || typeof content !== "string" || content.trim() ===""){
            res.status(400).json({
                error: "Message Content is required",
            });
            return;
        }

        //validate clientMessageId
        if(!clientMessageId || typeof clientMessageId !== "string" || clientMessageId.trim() ===" "){
            res.status(400).json({
                error: "Client id is required",
            });
            return;
        }

        //get and validate received weave
        const weave = await prisma.weave.findUnique({
            where: {
                id: weaveId,
            },
        });

        if(!weave){
            res.status(404).json({
                error: "Weave not found"
            });
            return;
        }

        //validate if the target message belongs to the same weave
        if(targetMessageId !== undefined){
            const targetMessage = await prisma.messages.findFirst({
                where: {
                    id: targetMessageId,
                    weave_id: weaveId,
                }
            });

            if(!targetMessage){
                res.status(404).json({
                    error: "Target Message does not belong to this weave",
                });
                return;
            }

        }
        //serializing transaction for unique messages
        let attempts = 0;

        while (attempts<3){
            try{
                const message = await prisma.$transaction(
                    async (tx)=>{

                        //checking whether the message was already created
                        const existingMessage = await tx.messages.findUnique({
                            where: {
                                weave_id_clientMessage_id: {
                                    weave_id: weaveId,
                                    clientMessage_id: clientMessageId.trim(),
                                }
                            }
                        });

                        if(existingMessage){
                            return existingMessage;
                        }

                        //if it doesn't exist find the sequence of the last one 
                        const lastMessage = await tx.messages.findFirst({
                            where: {
                                weave_id: weaveId,
                            },
                            orderBy:{
                                sequence: "desc",
                            }
                        });

                    const nextSequence = lastMessage ? lastMessage.sequence +1: 1;

                    //creting the message essentially pushing it into the particular weave
                    return await tx.messages.create({
                        data: {
                            content: content.trim(),
                            weave_id: weaveId,
                            user_id: req.user!.id,
                            clientMessage_id: clientMessageId.trim(),
                            target_message_id: targetMessageId ?? null,
                            relation: relation ?? null,
                            sequence: nextSequence,
                        },
                        include:{
                            user:{
                                select:{
                                    id: true,
                                    username: true,
                                }
                            }
                        }
                    });
                },
                {
                   isolationLevel: Prisma.TransactionIsolationLevel.Serializable, 
                }             
            );

            res.status(201).json({
                message,
            });
            return;
            
            }catch(e){
                if(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2034")
                {
                    attempts++;
                    continue;
                }

                console.error("Error Creating Messages: ", e);

                res.status(500).json({
                    error: "Internal Server Error",
                });

                return;
            }
        }

        res.status(500).json({
            error:"Could not create message after multiple attempts",
        });
    
    }catch(e){
        console.error("Error creating message: ", e);

        res.status(500).json({
            error: "internal server error"
        });
    }
});

//to push a new weave into the database
router.post("/", authenticate, async (req: Request, res: Response) =>{

    try{

        //dismiss the user if null 
        if(!req.user){
            res.status(401).json({
                error: "Authentication required"
            });
            return;
        }

        const { title } = req.body;
        
        //to check if the title is empty 
        if(!title || typeof title !== "string" || title.trim() == ""){
            res.status(400).json({
                error: "Title is required"
            });
            return;
        }

        const weave = await prisma.weave.create({
            data: {
                title: title.trim(),
                creator: req.user.id,
            },  
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        res.status(201).json({
            weave,
        });
        return;

    }catch(e){
        console.error("Error in creating a weave: " , e);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});


//delete a weave
router.delete(
    "/:id",
    authenticate,
    async (req: Request<{ id: string }>, res: Response) => {
        try {
            if (!req.user?.id) {
                res.status(401).json({
                    error: "Unauthorized User",
                });
                return;
            }

            const weaveId = req.params.id;

            const weave = await prisma.weave.findUnique({
                where: {
                    id: weaveId,
                },
            });

            if (!weave) {
                res.status(404).json({
                    error: "Weave not found",
                });
                return;
            }

            if (weave.creator !== req.user.id) {
                res.status(403).json({
                    error: "You can only delete your own weave",
                });
                return;
            }

            await prisma.weave.delete({
                where: {
                    id: weaveId,
                },
            });

            res.status(204).send();
            return;

        } catch (e) {
            console.error("Error deleting weave:", e);

            res.status(500).json({
                error: "Internal Server Error",
            });
        }
    }
);

export default router;
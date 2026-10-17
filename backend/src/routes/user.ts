import { Router } from "express";
import type { Response, Request } from "express";
import { prisma } from "../db.js";
import { authenticate } from "../middleware/authenticate.js";
// import { Prisma } from "../generated/prisma/client.js";
import { Stance } from "../generated/prisma/client.js"; 

const router  = Router();


// push the changed stance of the user and also give credit ot the other users
router.post("/:id/stanceNcredibility",authenticate, async (req: Request<{id: string }>, res: Response)=>{
        try{

        // verify user id through auth session
        if(!req.user){
            res.status(401).json({
                error: "Authentication Required"
            });
            return;
        }

        const { id: weaveId } = req.params;
        const {stance, messageIds} = req.body;
        
        if(messageIds.length === 0){
            res.status(400).json({
                error: "Selected messages can not be empty"
            })
            return;
        }
                                                          
        
        // check whether the weaveid exists or not 
        const weave = await prisma.weave.findUnique({
            where:{
                id: weaveId,

            }
        });

        if(!weave){
            res.status(404).json({
                error: "Weave not found",
            });
            return;
        }

        // checking  whether the messages belong to the same weave or not 
        const messages = await prisma.messages.findMany(
            {
                where: {
                id: {
                    in: messageIds, 
                },
                weave_id: weaveId,
            },
            select:{
                id: true,
                user_id: true,
            }
        });


        if(messages.length !== messageIds.length){
            res.status(400).json({
                error: "Message Ids not found",
            });
            return;
        }

        //Now verify the userIds belong to the message ids
        const messageMap = new Map(
            messages.map(message =>[
                message.id,
                message.user_id,
            ])
        );

        let userIds: string[] =[];
        let k=0;

        // remove requesting users id if it already exists
        for(const [messageId, userId] of messageMap){

            if(userId === req.user.id){
                messageMap.delete(messageId);
                continue;
            }
            userIds[k++] = userId;
        }

        //check again if the map is 0 now then return 
        if(messageMap.size === 0){
            res.status(418).json({
                error: "Nice try pal but you cannot choose your own arguments to give credit to"
            });
            return;
        }

        // now using a transactin to update stance, switch count and aloocating credits to the user
        await prisma.$transaction(async (tx)=>{
            
            //to update the nimber of switches 
            await tx.weave.update(
                {
                    where:{
                        id: weaveId,
                    },
                    data:{
                        totalSwitches:{
                            increment: 1,
                        }
                    }
                }
            );


            //update stance and switch count
            await tx.weaveStance.update(
                {
                    where:{
                        user_id_weave_id:{
                            user_id: req.user!.id,
                            weave_id: weaveId,
                        }
                    },
                    data:{
                        stance: stance,
                        switch: {
                            decrement: 1,
                        }
                    }
                }
            );

            //update the credit score score of the user
            await tx.user.updateMany(
                {
                    where:{
                        id:{
                            in: userIds,
                        },
                    },
                    data:{
                        credibility:{
                            increment: 1,
                        }
                    }
            });
        });

        res.status(200).json({
            message: "Stance updates successfully"
        });
        return;

    }catch(e){
        res.status(500).json({
            error: e instanceof Error? e.message: "Internal Server Error"
        });
    }
        
});

export default router;
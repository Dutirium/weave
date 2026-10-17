import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void>{

    const sessionId = req.cookies.sessionId;

    if(!sessionId){
        res.status(401).json({
            error: 'Autheticate required',
        });
        return;
    }

    try{
        //find the session id if the user 
        const session = await prisma.session.findUnique({
            where:{
                session_id: sessionId,
            },
            include: {
                user: true,
            },
        });

        //if session id does not exist
        if(!session){
            res.status(401).json({
                error: 'Invalid Session',
            });
            return;
        }

        //if the session id exist but has already expired
        if(session.expires_at <= new Date()){
            await prisma.session.delete({
                where:{
                    session_id: sessionId,
                },
            });

            res.status(401).json({
                error: 'Session Expired'
            });
            return;
        }

        //if session id is there and not expired
        req.user = {
            id: session.user.id,
            username: session.user.username,
            email: session.user.email,
            sessionId: session.session_id,
            credibility: session.user.credibility,
        };

        next();
    }
    catch(e)
    {
        console.error("Authentication error:", e);

        res.status(500).json({
            error: "Internal server error"
        });
    }

    

}

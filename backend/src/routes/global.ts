import { Router } from 'express';
import type { Request, Response } from "express";
import { prisma } from "../db.js";


const router = Router();

//global route to fetch all the weaves unprotected ofcourse
router.get("/", async (req: Request, res: Response) => {
    try {
        const limit = Math.min(
            Number(req.query.limit) || 50,
            50
        );

        const cursor =
            typeof req.query.cursor === "string"
                ? req.query.cursor
                : undefined;

        const weaves = await prisma.weave.findMany({
            take: limit + 1,

            ...(cursor && {
                skip: 1,
                cursor: {
                    id: cursor,
                },
            }),
            orderBy: {
                createdAt: "desc",
            },
            include:{
                user: {
                    select:{
                        id: true,
                        username: true,
                    }
                }
            }
        });

        const hasMore = weaves.length > limit;

        const result = hasMore
            ? weaves.slice(0, limit)
            : weaves;

        const nextCursor = hasMore
            ? result[result.length - 1].id
            : null;

        res.json({
            weaves: result,
            nextCursor,
            hasMore,
        });

    } catch (error) {
        console.error("Error fetching global weaves:", error);

        res.status(500).json({
            error: "Failed to fetch global weaves",
        });
    }
});

export default router;
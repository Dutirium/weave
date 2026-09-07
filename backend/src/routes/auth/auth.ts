import { Router } from 'express'
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../db.js';
import type { LoginRequestBody, RegisterRequestBody } from '../../types.js';
import { Prisma } from '../../generated/prisma/client.js';
import crypto from "crypto";
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

//registration route
router.post('/register', async (req: Request<{}, {}, RegisterRequestBody>, res: Response): Promise<void> => {

    const { username, email, password } = req.body;

    // basic validation
    if (!username || !email || !password) {
        res.status(400).json({ error: 'All fields (username, email, password) are required.' });
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email address format.' });
        return;
    }

    if (password.length < 6) {
        res.status(400).json({ error: 'Password must be atleast 6 characters long.' });
        return;
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();


    try {
        //checking for existing users
        const existingUser = await withTimeout(prisma.user.findFirst({
            where: {
                OR: [

                    { email: normalizedEmail },
                    { username: normalizedUsername },

                ],
            },
        }), 5000);

        if (existingUser) {
            res.status(409).json({ error: 'Username or email already in use' });
            return;
        }

        // hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        //create and store 
        const newUser = await prisma.user.create({
            data: {
                username: normalizedUsername,
                email: normalizedEmail,
                passwordHash,
            }
        });

        res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                createdAt: newUser.createdAt,
            },
        });

    } catch (error) {

        if (error instanceof Error && error.message === 'Operation timed out') {
            res.status(503).json({
                error: "Authentication Services Temorarily unavailable"
            });
            return;
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            res.status(409).json({
                error: 'Username or email already in use',
            });
            return;
        }

        res.status(500).json({
            error: 'Internal server error while registering user.',
        });
    }
});

//login route
router.post('/login', async (req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void> => {
    const { uniqueId, password } = req.body;

    if (!password || !uniqueId) {
        res.status(400).json({ error: 'All fields are mandatory' });
        return;
    }

    //normalize the unique id
    const uniqueIdN = uniqueId.trim().toLowerCase();



    try {
        const existingUser = await withTimeout(prisma.user.findFirst({
            where: {
                OR: [

                    { email: uniqueIdN },
                    { username: uniqueIdN },

                ],
            },
        }), 5000);

        //don't reveal what is wrong hackers can use this 
        if (!existingUser) {
            res.status(401).json({ error: 'Invalid Username/Email or password' });
            return;
        }



        //check for passwordhash
        if (await bcrypt.compare(
            password,
            existingUser.passwordHash
        )) {

            //create session for the user and store it in the database  
            const sessionId = crypto.randomBytes(32).toString("hex");

            const expiresAt = new Date(
                Date.now() + 1000 * 60 * 60 * 24 * 7
            );

            await prisma.session.create({
                data: {
                    session_id: sessionId,
                    user_id: existingUser.id,
                    expires_at: expiresAt
                }
            });

            res.cookie("sessionId", sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                expires: expiresAt,
            });

            res.status(200).json({ message: 'Login Successfull' });

            return;
        }
        else {
            res.status(401).json({ error: 'Invalid Username/Email or password' });
            return;
        }
    }
    catch (e) {
        if (e instanceof Error && e.message === 'Operation timed out') {
            res.status(503).json({
                error: 'Authentication Service Temorarily unvailable'
            });
            return;
        }
        res.status(500).json({ error: 'Something went Wrong' });
        return;
    }


});

//profile or dashboard route 
router.get("/me", authenticate, (req, res) =>{
    res.json({
        user: req.user,
    });
});

router.delete("/logout", authenticate, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                error: "Authentication required",
            });
            return;
        }

        await prisma.session.delete({
            where: {
                session_id: req.user.sessionId,
            },
        });

        res.clearCookie("session_id");

        res.status(200).json({
            message: "Logged out successfully",
        });
        return;

    } catch (e) {
        console.error("Logout error:", e);

        res.status(500).json({
            error: "Internal Server Error",
        });
    }     
});

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {

    return Promise.race([
        promise,
        new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error('Operation timed out'))
            }, ms);
        })
    ]);
}

export default router;
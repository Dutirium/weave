import { Router } from 'express'
import type { Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import type { RegisterRequestBody } from '../types.js';
import { Prisma } from '../generated/prisma/client.js';


const router = Router();

router.post('/register', async (req: Request<{},{}, RegisterRequestBody>, res: Response): Promise<void> =>{
    
    const {username, email, password} = req.body;

    // basic validation
    if(!username || !email || !password){
        res.status(400).json({ error: 'All fields (username, email, password) are required.' });
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        res.status(400).json({ error: 'Invalid email address format.'});
        return;
    }

    if(password.length < 6){
        res.status(400).json({ error: 'Password must be atleast 6 characters long.'});
        return;
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    
    try{
        //checking for existing users
        const existingUser = await prisma.user.findFirst({
            where: {
                OR:[
                    
                    {email: normalizedEmail},
                    {username: normalizedUsername},
                    
                ],
            },
        });
    
        if(existingUser){
            res.status(409).json({ error: 'Username or email already in use'});
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


export default router;
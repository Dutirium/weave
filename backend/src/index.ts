import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth/auth.js';
import { prisma } from './db.js';
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
//app.use(cors());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
//Routes
app.use('/api/auth', authRouter);

//endpoints 
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Server is running smoothly' });
});

app.get('/api/health/db', async (req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ message: 'Database is reachable' });
    } catch (error) {
        res.status(503).json({ error: 'Database is unavailable' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
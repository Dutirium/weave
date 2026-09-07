export interface User{
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
}

export interface RegisterRequestBody{
    username?: string;
    email?: string;
    password?: string;
}

export interface LoginRequestBody{
    uniqueId: string,
    password: string
}

export type AuthenticatedUser = {
    id: string,
    username: string,
    email: string,
    sessionId: string,
};

declare global {
    namespace Express{
        interface Request{
            user?: AuthenticatedUser,
        }
    }
}

export {};
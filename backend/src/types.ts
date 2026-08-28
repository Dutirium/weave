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
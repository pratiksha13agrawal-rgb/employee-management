export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'user' ;
    employee: boolean;
    active: boolean;
}

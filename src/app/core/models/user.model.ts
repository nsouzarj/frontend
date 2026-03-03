export interface User {
    id: number | string;
    email: string;
    full_name: string;
    is_active: boolean;
    role: 'admin' | 'doctor' | 'staff';
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

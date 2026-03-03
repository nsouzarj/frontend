import { Pet } from './pet.model';
export interface Owner {
    id: number;
    full_name: string;
    email?: string;
    phone?: string;
    address?: string;
    pets?: Pet[];
}

export interface OwnerCreate {
    full_name: string;
    email?: string;
    phone?: string;
    address?: string;
}

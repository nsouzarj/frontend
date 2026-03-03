export enum SpeciesType {
    DOG = 'dog',
    CAT = 'cat',
    BIRD = 'bird',
    OTHER = 'other'
}

export interface PetBase {
    name: string;
    species: SpeciesType;
    breed?: string;
    age_years?: number;
    weight_kg?: number;
    size?: 'SMALL' | 'MEDIUM' | 'LARGE';
    owner_id: number;
}

export interface PetCreate extends PetBase { }

export interface OwnerSummary {
    full_name: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface Pet extends PetBase {
    id: number;
    owner?: OwnerSummary;
}

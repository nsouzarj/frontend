export enum SpeciesType {
    DOG = 'dog',
    CAT = 'cat',
    BIRD = 'bird',
    OTHER = 'other'
}

export interface Breed {
    id: number;
    name: string;
    species: SpeciesType;
}

export interface PaginatedBreeds {
    items: Breed[];
    total: number;
}

export interface BreedCreate {
    name: string;
    species: SpeciesType;
}

export interface BreedUpdate {
    name?: string;
    species?: SpeciesType;
}

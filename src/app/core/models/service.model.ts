export interface Service {
    id: number;
    name: string;
    description?: string;
    duration_minutes: number;
    is_active: boolean;
}

export interface ServicePrice {
    id: number;
    service_id: number;
    species: 'dog' | 'cat' | 'bird' | 'other';
    size?: 'SMALL' | 'MEDIUM' | 'LARGE';
    price: number;

    // Relation
    service?: Service;
}

// Helper structure for Service selection
export interface ServiceWithPrice extends Service {
    calculated_price: number;
}

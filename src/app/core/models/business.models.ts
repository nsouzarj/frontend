export interface Doctor {
    id: number;
    full_name: string;
    crmv: string;
    specialty?: string;
    phone?: string;
    email?: string;
    is_active: boolean;
}

export enum AppointmentStatus {
    SCHEDULED = 'scheduled',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export interface Pet {
    id: number;
    name: string;
    species: string;
    breed?: string;
    age_years: number;
    weight_kg: number;
    owner_id: number;
    // owner relation could be here too if needed
}

export interface Appointment {
    id: number;
    doctor_id: number;
    pet_id: number;
    date_time: string; // ISO string
    status: AppointmentStatus;
    reason?: string;
    notes?: string;

    // Grooming / Service fields
    service_id?: number;
    price?: number;

    // Relations
    pet?: Pet;
    service?: { name: string }; // simple relation for display

    // Computed/Expanded properties for display
    doctor_name?: string;
    pet_name?: string; // Fallback if pet object not fully populated
    owner_name?: string;
}

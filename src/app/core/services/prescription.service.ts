import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

export interface Prescription {
    id: number;
    appointment_id: number;
    medications: string;
    instructions?: string;
    created_at: string;
}

export interface PrescriptionCreate {
    appointment_id: number;
    medications: string;
    instructions?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PrescriptionService {
    private supabase = inject(SupabaseService);

    createPrescription(data: PrescriptionCreate): Observable<Prescription> {
        return from(
            this.supabase.from('prescriptions')
                .insert(data)
                .select()
                .single()
        ).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Prescription;
            })
        );
    }

    getPrescription(id: number): Observable<Prescription> {
        return from(
            this.supabase.from('prescriptions')
                .select('*')
                .eq('id', id)
                .single()
        ).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Prescription;
            })
        );
    }

    downloadPdf(id: number): Observable<Blob> {
        throw new Error('Use PdfService.generatePrescription() instead of downloading from backend.');
    }

    getPrescriptions(appointmentId?: number, petId?: number): Observable<Prescription[]> {
        let query = this.supabase.from('prescriptions').select('*');

        if (appointmentId) {
            query = query.eq('appointment_id', appointmentId);
        }

        if (petId) {
            // Supabase filter on foreign table relation
            // prescriptions -> appointments -> pet_id
            query = query.select('*, appointments!inner(pet_id)').eq('appointments.pet_id', petId);
        }

        return from(query).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Prescription[];
            })
        );
    }

    deletePrescription(id: number): Observable<void> {
        return from(
            this.supabase.from('prescriptions')
                .delete()
                .eq('id', id)
        ).pipe(
            map((response: any) => {
                const { error } = response;
                if (error) throw error;
                return;
            })
        );
    }
}

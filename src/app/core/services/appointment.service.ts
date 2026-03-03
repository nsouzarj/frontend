import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { Appointment } from '../models/business.models';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    private supabase = inject(SupabaseService);

    getAppointments(): Observable<Appointment[]> {
        return from(
            this.supabase.from('appointments')
                // Use aliases to map 'doctors' -> 'doctor' and 'pets' -> 'pet'
                // Also map 'owners' inside pet to 'owner'
                .select('*, doctor:doctors(*), pet:pets(*, owner:owners(*)), service:services(*)')
        ).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                // Map nested joins to match Frontend Interface if needed
                // Supabase returns doctor: {} and pet: { owner: {} } automatically
                // which often matches standard JSON structure.
                // We might need to manually map if interfaces are very specific flat structures.
                return (data as any[]).map(this.mapAppointment);
            })
        );
    }

    getAppointment(id: number): Observable<Appointment> {
        return from(
            this.supabase.from('appointments')
                .select('*, doctor:doctors(*), pet:pets(*, owner:owners(*)), service:services(*)')
                .eq('id', id)
                .single()
        ).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return this.mapAppointment(data);
            })
        );
    }

    createAppointment(appointment: Omit<Appointment, 'id'>): Observable<Appointment> {
        // IMPORTANT: Supabase expects Foreign Keys (doctor_id) NOT nested objects (doctor)
        // Ensure the 'appointment' object passed here only has raw IDs, not full objects.
        const { doctor, pet, ...cleanAppointment } = appointment as any;

        return from(this.supabase.from('appointments').insert(cleanAppointment).select().single()).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Appointment;
            })
        );
    }

    updateAppointment(id: number, appointment: Partial<Appointment>): Observable<Appointment> {
        const { doctor, pet, ...cleanAppointment } = appointment as any;

        return from(this.supabase.from('appointments').update(cleanAppointment).eq('id', id).select().single()).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Appointment;
            })
        );
    }

    deleteAppointment(id: number): Observable<void> {
        return from(this.supabase.from('appointments').delete().eq('id', id)).pipe(
            map((response: any) => {
                const { error } = response;
                if (error) throw error;
                return;
            })
        );
    }

    checkAvailability(doctorId: number, dateTime: string, excludeId?: number): Observable<boolean> {
        // dateTime is ISO string. We check for exact match for now.
        // A more robust check would verify time ranges (e.g. +/- 30 mins) depending on appointment duration logic.
        let query = this.supabase.from('appointments')
            .select('id', { count: 'exact', head: true })
            .eq('doctor_id', doctorId)
            .eq('date_time', dateTime)
            .neq('status', 'cancelled'); // Ignore cancelled appointments

        if (excludeId) {
            query = query.neq('id', excludeId);
        }

        return from(query).pipe(
            map((response: any) => {
                const { count, error } = response;
                if (error) throw error;
                // If count > 0, there is a conflict (return false for availability)
                return count === 0;
            })
        );
    }

    private mapAppointment(data: any): Appointment {
        return {
            ...data,
            // Assuming the frontend interface expects 'doctor_name' or similar flattened props?
            // If the frontend interface uses 'doctor: Doctor', it should work out of the box.
            // Let's assume standard object structure reuse.
            doctor: data.doctor,
            pet: data.pet
        };
    }
}

import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { Doctor } from '../models/business.models';

@Injectable({
    providedIn: 'root'
})
export class DoctorService {
    private supabase = inject(SupabaseService);

    getDoctors(): Observable<Doctor[]> {
        return from(this.supabase.from('doctors').select('*')).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Doctor[];
            })
        );
    }

    getDoctor(id: number): Observable<Doctor> {
        return from(this.supabase.from('doctors').select('*').eq('id', id).single()).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Doctor;
            })
        );
    }

    createDoctor(doctor: Omit<Doctor, 'id'>): Observable<Doctor> {
        return from(this.supabase.from('doctors').insert(doctor).select().single()).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Doctor;
            })
        );
    }

    updateDoctor(id: number, doctor: Partial<Doctor>): Observable<Doctor> {
        return from(this.supabase.from('doctors').update(doctor).eq('id', id).select().single()).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Doctor;
            })
        );
    }

    deleteDoctor(id: number): Observable<void> {
        return from(this.supabase.from('doctors').delete().eq('id', id)).pipe(
            map((response: any) => {
                const { error } = response;
                if (error) throw error;
                return;
            })
        );
    }
}

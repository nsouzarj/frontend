import { Injectable, inject } from '@angular/core';
import { Observable, from, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

export interface DashboardStats {
    total_owners: number;
    total_pets: number;
    total_doctors: number;
    total_appointments: number;
    appointments_scheduled: number;
    appointments_completed: number;
    appointments_cancelled: number;

    total_grooming: number;
    grooming_scheduled: number;
    grooming_completed: number;
    grooming_cancelled: number;

    total_dogs: number;
    total_cats: number;
    total_birds: number;
    total_others: number;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private supabase = inject(SupabaseService);

    getStats(): Observable<DashboardStats> {
        const ownersCount$ = from(this.supabase.from('owners').select('*', { count: 'exact', head: true }));
        const petsCount$ = from(this.supabase.from('pets').select('*', { count: 'exact', head: true }));
        const doctorsCount$ = from(this.supabase.from('doctors').select('*', { count: 'exact', head: true }));

        // Species Counts
        const dogsCount$ = from(this.supabase.from('pets').select('*', { count: 'exact', head: true }).eq('species', 'dog'));
        const catsCount$ = from(this.supabase.from('pets').select('*', { count: 'exact', head: true }).eq('species', 'cat'));
        const birdsCount$ = from(this.supabase.from('pets').select('*', { count: 'exact', head: true }).eq('species', 'bird'));
        const othersCount$ = from(this.supabase.from('pets').select('*', { count: 'exact', head: true }).eq('species', 'other'));

        // Medical Appointments (service_id IS NULL)
        const medTotal$ = from(this.supabase.from('appointments').select('*', { count: 'exact', head: true }).is('service_id', null));
        const medScheduled$ = from(this.supabase.from('appointments').select('*', { count: 'exact', head: true }).is('service_id', null).eq('status', 'scheduled'));
        const medCompleted$ = from(this.supabase.from('appointments').select('*', { count: 'exact', head: true }).is('service_id', null).eq('status', 'completed'));
        const medCancelled$ = from(this.supabase.from('appointments').select('*', { count: 'exact', head: true }).is('service_id', null).eq('status', 'cancelled'));

        // Grooming Appointments (service_id IS NOT NULL)
        const groomTotal$ = from(this.supabase.from('appointments').select('*', { count: 'exact', head: true }).not('service_id', 'is', null));
        const groomScheduled$ = from(this.supabase.from('appointments').select('*', { count: 'exact', head: true }).not('service_id', 'is', null).eq('status', 'scheduled'));
        const groomCompleted$ = from(this.supabase.from('appointments').select('*', { count: 'exact', head: true }).not('service_id', 'is', null).eq('status', 'completed'));
        const groomCancelled$ = from(this.supabase.from('appointments').select('*', { count: 'exact', head: true }).not('service_id', 'is', null).eq('status', 'cancelled'));

        return forkJoin([
            ownersCount$, petsCount$, doctorsCount$,
            medTotal$, medScheduled$, medCompleted$, medCancelled$,
            groomTotal$, groomScheduled$, groomCompleted$, groomCancelled$,
            dogsCount$, catsCount$, birdsCount$, othersCount$
        ]).pipe(
            map(([owners, pets, doctors, medTotal, medSched, medComp, medCanc, groomTotal, groomSched, groomComp, groomCanc, dogs, cats, birds, others]) => {
                return {
                    total_owners: owners.count || 0,
                    total_pets: pets.count || 0,
                    total_doctors: doctors.count || 0,

                    total_appointments: medTotal.count || 0,
                    appointments_scheduled: medSched.count || 0,
                    appointments_completed: medComp.count || 0,
                    appointments_cancelled: medCanc.count || 0,

                    total_grooming: groomTotal.count || 0,
                    grooming_scheduled: groomSched.count || 0,
                    grooming_completed: groomComp.count || 0,
                    grooming_cancelled: groomCanc.count || 0,

                    total_dogs: dogs.count || 0,
                    total_cats: cats.count || 0,
                    total_birds: birds.count || 0,
                    total_others: others.count || 0
                };
            })
        );
    }
}

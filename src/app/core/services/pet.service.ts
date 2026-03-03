import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { Pet, PetCreate } from '../models/pet.model';

@Injectable({
    providedIn: 'root'
})
export class PetService {
    private supabase = inject(SupabaseService);

    getPets(skip: number = 0, limit: number = 100): Observable<Pet[]> {
        // '*, owner:owners(*)' ensures the property is named 'owner' not 'owners'
        return from(
            this.supabase.from('pets')
                .select('*, owner:owners(*)')
                .range(skip, skip + limit - 1)
        ).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return (data as any[]).map(this.mapPetFromSupabase);
            })
        );
    }

    getPet(id: number): Observable<Pet> {
        return from(
            this.supabase.from('pets')
                .select('*, owner:owners(*)')
                .eq('id', id)
                .single()
        ).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return this.mapPetFromSupabase(data);
            })
        );
    }

    createPet(pet: PetCreate): Observable<Pet> {
        return from(
            this.supabase.from('pets')
                .insert(pet)
                .select()
                .single()
        ).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Pet;
            })
        );
    }

    updatePet(id: number, pet: PetCreate): Observable<Pet> {
        return from(
            this.supabase.from('pets')
                .update(pet)
                .eq('id', id)
                .select()
                .single()
        ).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Pet;
            })
        );
    }

    deletePet(id: number): Observable<void> {
        return from(
            this.supabase.from('pets')
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

    // Helper to map DB structure to Frontend Model if needed
    // Supabase returns owner as an object inside valid JSON, matches our Interface usually
    private mapPetFromSupabase(data: any): Pet {
        return {
            ...data,
            owner_name: data.owner?.full_name // Flatten if needed for display
        };
    }
}

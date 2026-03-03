import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { Breed, BreedCreate, BreedUpdate, SpeciesType, PaginatedBreeds } from '../models/breed.model';

@Injectable({
    providedIn: 'root'
})
export class BreedService {
    private supabase = inject(SupabaseService);

    getBreeds(skip: number = 0, limit: number = 100, species?: SpeciesType, search?: string): Observable<PaginatedBreeds> {
        let query = this.supabase.from('breeds').select('*', { count: 'exact' });

        if (species) {
            query = query.eq('species', species);
        }

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        query = query.range(skip, skip + limit - 1);

        return from(query).pipe(
            map((response: any) => {
                const { data, count, error } = response;
                if (error) throw error;
                return {
                    items: data as Breed[],
                    total: count || 0,
                    page: Math.floor(skip / limit) + 1,
                    size: limit,
                    pages: Math.ceil((count || 0) / limit)
                };
            })
        );
    }

    createBreed(breed: BreedCreate): Observable<Breed> {
        return from(this.supabase.from('breeds').insert(breed).select().single()).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Breed;
            })
        );
    }

    updateBreed(id: number, breed: BreedUpdate): Observable<Breed> {
        return from(this.supabase.from('breeds').update(breed).eq('id', id).select().single()).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Breed;
            })
        );
    }

    deleteBreed(id: number): Observable<void> {
        return from(this.supabase.from('breeds').delete().eq('id', id)).pipe(
            map((response: any) => {
                const { error } = response;
                if (error) throw error;
                return;
            })
        );
    }
}

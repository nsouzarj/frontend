import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { Owner, OwnerCreate } from '../models/owner.model';

@Injectable({
    providedIn: 'root'
})
export class OwnerService {
    private supabase = inject(SupabaseService);

    getOwners(skip: number = 0, limit: number = 100): Observable<Owner[]> {
        return from(this.supabase.from('owners').select('*').range(skip, skip + limit - 1)).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Owner[];
            })
        );
    }

    getOwner(id: number): Observable<Owner> {
        return from(this.supabase.from('owners').select('*, pets(*)').eq('id', id).single()).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Owner;
            })
        );
    }

    createOwner(owner: OwnerCreate): Observable<Owner> {
        return from(this.supabase.from('owners').insert(owner).select().single()).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Owner;
            })
        );
    }

    updateOwner(id: number, owner: OwnerCreate): Observable<Owner> {
        return from(this.supabase.from('owners').update(owner).eq('id', id).select().single()).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Owner;
            })
        );
    }

    deleteOwner(id: number): Observable<void> {
        return from(this.supabase.from('owners').delete().eq('id', id)).pipe(
            map((response: any) => {
                const { error } = response;
                if (error) throw error;
                return;
            })
        );
    }
}

import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Service, ServicePrice, ServiceWithPrice } from '../models/service.model';
import { Pet } from '../models/pet.model';

@Injectable({
    providedIn: 'root'
})
export class GroomingService {
    private supabase = inject(SupabaseService);

    getServices(): Observable<Service[]> {
        return from(
            this.supabase.from('services')
                .select('*')
                .eq('is_active', true)
                .neq('name', 'Consulta') // Exclude medical consultation
                .order('name')
        ).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as Service[];
            })
        );
    }

    calculatePrice(serviceId: number, pet: Pet): Observable<number | null> {
        // Build query based on species and size
        let query = this.supabase.from('service_prices')
            .select('price')
            .eq('service_id', serviceId)
            .eq('species', pet.species.toLowerCase());

        // If Dog, check size
        if (pet.species.toLowerCase() === 'dog' && pet.size) {
            query = query.eq('size', pet.size);
        } else {
            // For others or if size is missing (fallback), user might need to ensure size is set or we take a default?
            // Our SQL has NULL size for cats/others, so we query size is null
            if (pet.species.toLowerCase() !== 'dog') {
                query = query.is('size', null);
            }
        }

        return from(query.maybeSingle()).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) {
                    console.error('Error fetching price:', error);
                    return null;
                }
                if (!data) return null;
                return data.price;
            })
        );
    }

    // Helper to get all prices for a service to display options if needed
    getServicePrices(serviceId: number): Observable<ServicePrice[]> {
        return from(
            this.supabase.from('service_prices')
                .select('*')
                .eq('service_id', serviceId)
        ).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                return data as ServicePrice[];
            })
        );
    }
}

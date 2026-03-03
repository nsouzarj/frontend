import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(
            environment.supabase.url,
            environment.supabase.key
        );
    }

    // Expose the client for direct access
    get client(): SupabaseClient {
        return this.supabase;
    }

    // Shortcut for auth
    get auth() {
        return this.supabase.auth;
    }

    // Wrapper for table selection
    from(table: string) {
        return this.supabase.from(table);
    }
}

import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of, map, switchMap, tap, catchError, filter, take } from 'rxjs';
import { SupabaseService } from '../services/supabase.service';
import { User, LoginResponse } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private supabase = inject(SupabaseService);
    private router = inject(Router);

    private userSubject = new BehaviorSubject<User | null | undefined>(undefined);
    public user$ = this.userSubject.asObservable();
    public currentUser = signal<User | null | undefined>(undefined);

    constructor() {
        this.checkAuth();
    }

    checkAuth(): void {
        console.log('AuthService: checkAuth started');
        this.supabase.auth.getSession().then(({ data }: any) => {
            console.log('AuthService: getSession result', data);
            if (data.session?.user) {
                console.log('AuthService: User found via getSession', data.session.user.id);
                this.loadUserProfile(data.session.user.id);
            } else {
                console.log('AuthService: No session in getSession');
                this.userSubject.next(null);
                this.currentUser.set(null);
            }
        }).catch((err) => {
            this.userSubject.next(null);
            this.currentUser.set(null);
        });

        // Listen to auth state changes
        this.supabase.auth.onAuthStateChange((event: any, session: any) => {
            if (event === 'SIGNED_IN' && session?.user) {
                this.loadUserProfile(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                this.userSubject.next(null);
                this.currentUser.set(null);
                this.router.navigate(['/login']);
            }
        });
    }

    login(email: string, password: string): Observable<any> {
        return from(this.supabase.auth.signInWithPassword({ email, password })).pipe(
            map((response: any) => {
                const { data, error } = response;
                if (error) throw error;
                if (data.user) this.loadUserProfile(data.user.id);
                return data;
            })
        );
    }

    logout(): void {
        from(this.supabase.auth.signOut()).subscribe(() => {
            this.userSubject.next(null);
            this.currentUser.set(null);
            this.router.navigate(['/login']);
        });
    }

    private loadUserProfile(userId: string) {
        // Fetch profile from 'profiles' table
        from(this.supabase.from('profiles').select('*').eq('id', userId).single())
            .subscribe(({ data, error }) => {
                if (data) {
                    const user: User = {
                        id: data.id,
                        email: data.email,
                        full_name: data.full_name || 'Usuário',
                        role: data.role as any,
                        is_active: data.is_active
                    };
                    this.userSubject.next(user);
                    this.currentUser.set(user);
                } else {
                    console.error('Profile load error', error);
                    // Fallback if no profile yet
                    const user: User = {
                        id: userId,
                        email: '',
                        full_name: 'Usuário',
                        role: 'staff',
                        is_active: true
                    };
                    this.userSubject.next(user);
                    this.currentUser.set(user);
                }
            });
    }

    isAuthenticated(): Observable<boolean> {
        return this.userSubject.asObservable().pipe(
            // Filter out 'undefined', which means we are still loading
            filter(u => u !== undefined),
            // Take the first valid value (null or User)
            take(1),
            map(u => !!u)
        );
    }

    hasRole(allowedRoles: string[]): boolean {
        const user = this.userSubject.value;
        if (!user) return false;
        return allowedRoles.includes(user.role);
    }

    // Legacy support if specific token access is needed, though Supabase handles it internally
    getToken(): string | null {
        return localStorage.getItem('sb-access-token'); // Supabase default key varies, usually best to trust sdk
    }
}

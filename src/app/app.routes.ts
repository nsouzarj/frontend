import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
            },
            {
                path: 'owners',
                loadChildren: () => import('./features/owners/owners.routes').then(m => m.OWNER_ROUTES)
            },
            {
                path: 'pets',
                loadComponent: () => import('./features/pets/pet-list/pet-list.component').then(m => m.PetListComponent)
            },
            {
                path: 'breeds',
                loadComponent: () => import('./features/breeds/breed-list/breed-list.component').then(m => m.BreedListComponent)
            },
            {
                path: 'doctors',
                loadComponent: () => import('./features/doctors/doctor-list/doctor-list.component').then(m => m.DoctorListComponent)
            },
            {
                path: 'doctors/new',
                loadComponent: () => import('./features/doctors/doctor-form/doctor-form.component').then(m => m.DoctorFormComponent)
            },
            {
                path: 'doctors/:id',
                loadComponent: () => import('./features/doctors/doctor-form/doctor-form.component').then(m => m.DoctorFormComponent)
            },
            {
                path: 'appointments',
                loadComponent: () => import('./features/appointments/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent),
                data: { isGrooming: false }
            },
            {
                path: 'grooming',
                loadComponent: () => import('./features/appointments/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent),
                data: { isGrooming: true }
            },
            {
                path: 'appointments/new',
                loadComponent: () => import('./features/appointments/appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent),
                data: { isGrooming: false }
            },
            {
                path: 'appointments/:id',
                loadComponent: () => import('./features/appointments/appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent),
                data: { isGrooming: false }
            },
            {
                path: 'grooming/new',
                loadComponent: () => import('./features/appointments/appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent),
                data: { isGrooming: true }
            },
            {
                path: 'grooming/:id',
                loadComponent: () => import('./features/appointments/appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent),
                data: { isGrooming: true }
            }
        ]
    },
    // Fallback route
    { path: '**', redirectTo: 'login' }
];

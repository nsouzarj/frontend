import { Routes } from '@angular/router';
import { OwnerListComponent } from './owner-list/owner-list.component';
import { OwnerFormComponent } from './owner-form/owner-form.component';

export const OWNER_ROUTES: Routes = [
    { path: '', component: OwnerListComponent },
    { path: 'new', component: OwnerFormComponent },
    { path: ':id', component: OwnerFormComponent }
];

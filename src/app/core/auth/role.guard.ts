import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const requiredRoles = route.data['roles'] as Array<string>;

    if (authService.hasRole(requiredRoles)) {
        return true;
    }

    // Redirect to unauthorized page or dashboard if role is insufficient
    // For now, redirect to login
    return router.createUrlTree(['/login']);
};

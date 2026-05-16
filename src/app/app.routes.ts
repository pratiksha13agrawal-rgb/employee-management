import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    { path:'', redirectTo: 'auth/login', pathMatch: 'full' },
    { 
        path: 'auth',
        loadChildren: () => 
            import('./features/auth/auth.routes')
                .then(r => r.AUTH_ROUTES)
    },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadChildren: () => 
            import('./features/dashboard/dashboard.routes')
                .then(r => r.DASHBOARD_ROUTES)
    }
];

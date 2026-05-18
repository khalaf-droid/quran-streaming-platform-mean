import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Auth routes (separate layout)
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
    ]
  },
  // Main app routes
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      // Public
      { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
      { path: 'surahs', loadComponent: () => import('./features/surah-list/surah-list.component').then(m => m.SurahListComponent) },
      { path: 'surahs/:id', loadComponent: () => import('./features/surah-detail/surah-detail.component').then(m => m.SurahDetailComponent) },
      { path: 'reciters', loadComponent: () => import('./features/reciter-list/reciter-list.component').then(m => m.ReciterListComponent) },
      { path: 'reciters/:id', loadComponent: () => import('./features/reciter-profile/reciter-profile.component').then(m => m.ReciterProfileComponent) },
      { path: 'collections', loadComponent: () => import('./features/collection-list/collection-list.component').then(m => m.CollectionListComponent) },
      { path: 'collections/:id', loadComponent: () => import('./features/collection-detail/collection-detail.component').then(m => m.CollectionDetailComponent) },
      // Protected (requires login)
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
      // Admin (requires admin role)
      { path: 'admin', loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [authGuard, adminGuard] },
    ]
  },
  { path: '**', redirectTo: '' }
];

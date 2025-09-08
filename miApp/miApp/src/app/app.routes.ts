import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'principal', pathMatch: 'full' }, // ¡pathMatch: 'full' es CLAVE!

  // Pantallas que YA existen
  { path: 'principal',  loadComponent: () => import('./pages/principal/principal.page').then(m => m.PrincipalPage) },
  { path: 'pantalla1',  loadComponent: () => import('./pages/pantalla1/pantalla1.page').then(m => m.Pantalla1Page) },
  { path: 'pantalla2',  loadComponent: () => import('./pages/pantalla2/pantalla2.page').then(m => m.Pantalla2Page) },
  { path: 'pantalla3',  loadComponent: () => import('./pages/pantalla3/pantalla3.page').then(m => m.Pantalla3Page) },
  { path: 'pantalla4',  loadComponent: () => import('./pages/pantalla4/pantalla4.page').then(m => m.Pantalla4Page) },
  { path: 'pantalla5',  loadComponent: () => import('./pages/pantalla5/pantalla5.page').then(m => m.Pantalla5Page) },
  // Pantallas que AÚN NO existen → mandamos a Placeholder (para que NO te reenvíe a principal)
  { path: 'pantalla6',  loadComponent: () => import('./pages/placeholder/placeholder.page').then(m => m.PlaceholderPage) },
  { path: 'pantalla7',  loadComponent: () => import('./pages/placeholder/placeholder.page').then(m => m.PlaceholderPage) },
  { path: 'pantalla8',  loadComponent: () => import('./pages/placeholder/placeholder.page').then(m => m.PlaceholderPage) },
  { path: 'pantalla9',  loadComponent: () => import('./pages/placeholder/placeholder.page').then(m => m.PlaceholderPage) },
  { path: 'pantalla10', loadComponent: () => import('./pages/placeholder/placeholder.page').then(m => m.PlaceholderPage) },
  { path: 'pantalla11', loadComponent: () => import('./pages/placeholder/placeholder.page').then(m => m.PlaceholderPage) },
  { path: 'pantalla12', loadComponent: () => import('./pages/placeholder/placeholder.page').then(m => m.PlaceholderPage) },

  // Cualquier otra cosa
  { path: '**', redirectTo: 'principal' },
];

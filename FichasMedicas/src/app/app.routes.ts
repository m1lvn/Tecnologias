import { Routes } from '@angular/router';
export const routes: Routes = [
  { path:'', redirectTo:'principal', pathMatch:'full' },
  { path:'principal', loadComponent:()=>import('./pages/principal/principal.page').then(m=>m.PrincipalPage) },
];

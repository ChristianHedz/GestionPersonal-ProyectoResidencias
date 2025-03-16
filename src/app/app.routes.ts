import { Routes } from '@angular/router';

import { LoginComponent } from './auth/pages/login/login.component';
import { RegisterComponent } from './auth/pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { isAuthGuard } from './auth/guards/is-auth.guard';
import { isNotAuthGuard } from './auth/guards/is-not-auth.guard';
import { InfoComponent } from './pages/info/info.component';
import { PruebaComponent } from './pages/prueba/prueba.component';

export const routes: Routes = [
  // { path: 'inicio', redirectTo: 'admin/inicio', pathMatch: 'full' },
  { path: '', redirectTo:'login', pathMatch:'full' },

  { path: 'registro', component: RegisterComponent, canActivate: [isNotAuthGuard] },
  { path: 'admin/inicio',component: DashboardComponent, canMatch: [isAuthGuard] },
  { path: 'admin/info',component: InfoComponent, canMatch: [isAuthGuard] },
  { path: 'admin/prueba',component: PruebaComponent},
  { path: 'login',component: LoginComponent, canMatch: [isNotAuthGuard] },

  // {
  //   path:"admin",
  //   canActivate: [isAuthGuard],
  //   children: [
  //     {
  //       path: 'inicio', // Quita la barra inicial
  //       loadComponent: () => import('./pages/dashboard/dashboard.component')
  //         .then(m => m.DashboardComponent),
  //     },
  //     {
  //       path: 'info',
  //       loadComponent: () => import('./pages/info/info.component')
  //         .then(m => m.InfoComponent),
  //     },
  //     {
  //       path: '',
  //       redirectTo: 'inicio',
  //       pathMatch: 'full',
  //     }
  //   ],
  // },

//   {
//     path: 'login',
//     loadComponent: () => import(`./features/general/login/login.component`)
//       .then(mod => mod.LoginComponent)
//   },
];
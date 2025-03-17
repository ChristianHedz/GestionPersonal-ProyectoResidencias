import { Routes } from '@angular/router';

import { LoginComponent } from './auth/pages/login/login.component';
import { RegisterComponent } from './auth/pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { isAuthGuard } from './auth/guards/is-auth.guard';
import { isNotAuthGuard } from './auth/guards/is-not-auth.guard';
import { InfoComponent } from './pages/info/info.component';
import { isAdminGuard } from './auth/guards/is-admin.guard';

export const routes: Routes = [
  // { path: 'inicio', redirectTo: 'admin/inicio', pathMatch: 'full' },
  { path: '', redirectTo:'login', pathMatch:'full' },

  { path: 'registro', component: RegisterComponent },

  { path: 'login',component: LoginComponent, canMatch: [isNotAuthGuard] },

  {
    path:"admin",
    children: [
      {
        path: 'inicio',
        component: DashboardComponent,
        canMatch: [isAdminGuard]
      },
      {
        path: 'info',
        component: InfoComponent,
        canMatch: [isAuthGuard],
      },
      // {
      //   path: 'prueba',
      //   loadComponent: () => import('./pages/prueba/prueba.component')
      //     .then(m => m.PruebaComponent),
      // },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      }
    ],
  },

//   {
//     path: 'login',
//     loadComponent: () => import(`./features/general/login/login.component`)
//       .then(mod => mod.LoginComponent)
//   },
];
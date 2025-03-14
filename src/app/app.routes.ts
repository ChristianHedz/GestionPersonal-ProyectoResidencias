import { Routes } from '@angular/router';

import { LoginComponent } from './auth/pages/login/login.component';
import { RegisterComponent } from './auth/pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { isAuthGuard } from './auth/guards/is-auth.guard';
import { isNotAuthGuard } from './auth/guards/is-not-auth.guard';
import { InfoComponent } from './pages/info/info.component';


export const routes: Routes = [
  { path: '', redirectTo:'login', pathMatch:'full' },

  { path: 'registro', component: RegisterComponent },
  { path: 'inicio',component: DashboardComponent},
  { path: 'info',component: InfoComponent},
  { path: 'login',component: LoginComponent, canActivate: [isNotAuthGuard] },

//   {
//     path: 'login',
//     loadComponent: () => import(`./features/general/login/login.component`)
//       .then(mod => mod.LoginComponent)
//   },
];
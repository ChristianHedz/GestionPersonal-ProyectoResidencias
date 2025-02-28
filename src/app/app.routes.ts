import { Routes } from '@angular/router';

import { LoginComponent } from './auth/pages/login/login.component';
import { RegisterComponent } from './auth/pages/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo:'login', pathMatch:'full' },

  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },

//   {
//     path: 'login',
//     loadComponent: () => import(`./features/general/login/login.component`)
//       .then(mod => mod.LoginComponent)
//   },
];
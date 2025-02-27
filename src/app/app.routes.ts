import { Routes } from '@angular/router';

import { LoginComponent } from './auth/pages/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo:'login', pathMatch:'full' },

  { path: 'login', component: LoginComponent },

//   {
//     path: 'login',
//     loadComponent: () => import(`./features/general/login/login.component`)
//       .then(mod => mod.LoginComponent)
//   },

];
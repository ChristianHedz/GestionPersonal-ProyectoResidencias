import { Routes } from '@angular/router';
import { LoginComponent } from './auth/pages/login/login.component';
import { RegisterComponent } from './auth/pages/register/register.component';
import { isNotAuthGuard } from './auth/guards/is-not-auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { CalendarComponent } from './pages/calendar/calendar.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'registro', component: RegisterComponent },
  { path: 'login', component: LoginComponent, canMatch: [isNotAuthGuard] },
  { path: 'home', component: HomeComponent, data: { mode: 'user' } },
  { path: 'admin/home', component: HomeComponent, data: { mode: 'admin' } },
  { path: 'calendar', component: CalendarComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module')
      .then(m => m.AdminModule)
  }
];
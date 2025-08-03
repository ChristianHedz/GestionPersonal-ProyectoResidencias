import { Routes } from '@angular/router';
import { HomeComponent } from './shared/components/home/home.component';
import { isAdminGuard } from './core/guards/is-admin.guard';
import { isEmployeeGuard } from './core/guards/is-employee.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  { path: 'admin/home', component: HomeComponent, data: { mode: 'admin' }, canMatch: [isAdminGuard]},
  { path: 'employee/home', component: HomeComponent, canMatch: [isEmployeeGuard]},
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'employee',
    loadChildren: () => import('./features/employee/employee.module').then(m => m.EmployeeModule)
  },
  {
    path: 'calendar',
    loadChildren: () => import('./features/calendar/calendar.module').then(m => m.CalendarModule)
  }
];
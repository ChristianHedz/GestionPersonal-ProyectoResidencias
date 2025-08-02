import { isAuthGuard } from './auth/guards/is-auth.guard';
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/pages/login/login.component';
import { RegisterComponent } from './auth/pages/register/register.component';
import { isNotAuthGuard } from './auth/guards/is-not-auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { EmployeeProfileComponent } from './pages/employee-profile/employee-profile.component';
import { EmployeeCalendarComponent } from './pages/calendar/employee-calendar/employee-calendar.component';
import { isAdminGuard } from './auth/guards/is-admin.guard';
import { isEmployeeGuard } from './auth/guards/is-employee.guard';
import { EmployeeDataComponent } from './pages/employee-data/employee-data.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'registro', component: RegisterComponent, canMatch: [isNotAuthGuard] },
  { path: 'login', component: LoginComponent, canMatch: [isNotAuthGuard] },
  { path: 'admin/home', component: HomeComponent, data: { mode: 'admin' }, canMatch: [isAdminGuard]},
  { path: 'employee/home', component: HomeComponent, canMatch: [isEmployeeGuard]},
  { path: 'employee/calendar', component: EmployeeCalendarComponent,canMatch: [isEmployeeGuard]},
  { path: 'employee/profile', component: EmployeeProfileComponent, canMatch: [isEmployeeGuard]},
  { path: 'employee/dashboard', component: DashboardComponent, canMatch: [isEmployeeGuard]},
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module')
      .then(m => m.AdminModule)
  }
];
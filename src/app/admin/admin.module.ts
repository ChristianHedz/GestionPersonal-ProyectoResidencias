import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { InfoComponent } from '../pages/info/info.component';
import { EmployeesComponent } from '../pages/employees/employees.component';
import { AttendanceComponent } from '../pages/attendance/attendance.component';
import { EmployeesResolver } from '../core/resolvers/employees.resolver';


const routes: Routes = [
  {
    path: 'inicio',
    component: DashboardComponent,
    // canMatch: [isAuthGuard]
  },
  {
    path: 'info',
    component: InfoComponent,
    // canMatch: [isAuthGuard]
  },
  {
    path: 'empleados',
    component: EmployeesComponent,
    // canMatch: [isAdminGuard]
    resolve: {
      employees: EmployeesResolver
    }
  },
  {
    path: 'asistencias',
    component: AttendanceComponent,
    // canMatch: [isAuthGuard]
  },
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }
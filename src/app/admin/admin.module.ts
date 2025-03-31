import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { InfoComponent } from '../pages/info/info.component';
import { EmployeesComponent } from '../pages/employees/employees.component';
import { isAuthGuard } from '../auth/guards/is-auth.guard';
import { isAdminGuard } from '../auth/guards/is-admin.guard';

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
    // canMatch: [isAuthGuard, isAdminGuard]
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
    RouterModule.forChild(routes),
    DashboardComponent,
    InfoComponent,
    EmployeesComponent
  ]
})
export class AdminModule { } 
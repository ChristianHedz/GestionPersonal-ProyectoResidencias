import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { InfoComponent } from '../pages/info/info.component';
import { EmployeesComponent } from '../pages/employees/employees.component';
import { AttendanceComponent } from '../pages/attendance/attendance.component';
import { EmployeesResolver } from '../core/resolvers/employees.resolver';
import { ChatbotConfigComponent } from '../pages/chatbot-config/chatbot-config.component';
import { ChartsComponent } from '../pages/charts/charts.component';
import { EmployeeProfileComponent } from '../pages/employee-profile/employee-profile.component';


const routes: Routes = [
  {
    path: 'registro',
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
    path: 'chatbot-config',
    component: ChatbotConfigComponent,
    // canMatch: [isAdminGuard]
  },
  {
    path: 'graficas',
    component: ChartsComponent,
    // canMatch: [isAuthGuard]
  },
  {
    path: 'perfil',
    component: EmployeeProfileComponent,
    // canMatch: [isAuthGuard]
  },
  {
    path: '',
    redirectTo: 'home',
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
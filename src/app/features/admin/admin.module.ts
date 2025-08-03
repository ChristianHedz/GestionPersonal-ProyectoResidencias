import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { ChartsComponent } from './components/charts/charts.component';
import { ChatbotConfigComponent } from './components/chatbot-config/chatbot-config.component';
import { EmployeeCardComponent } from './components/employees/employee-card/employee-card.component';
import { EmployeeEditDialogComponent } from './components/employees/employee-edit-dialog/employee-edit-dialog.component';

// Importar componentes de charts
import { GeneralIncidencesComponent } from './components/charts/components/general-incidences/general-incidences.component';
import { HoursByEmployeeComponent } from './components/charts/components/hours-by-employee/hours-by-employee.component';
import { IncidencesByEmployeeComponent } from './components/charts/components/incidences-by-employee/incidences-by-employee.component';
import { VacationsComponent } from './components/charts/components/vacations/vacations.component';

import { isAdminGuard } from '../../core/guards/is-admin.guard';
import { isAuthGuard } from '../../core/guards/is-auth.guard';
import { EmployeesResolver } from '../../core/resolvers/employees.resolver';
import { CalendarComponent } from '../calendar/components/calendar/calendar.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canMatch: [isAuthGuard]
  },
  {
    path: 'calendar',
    component: CalendarComponent,
    canMatch: [isAuthGuard]
  },
  {
    path: 'employees',
    component: EmployeesComponent,
    canMatch: [isAdminGuard],
    resolve: {
      employees: EmployeesResolver
    }
  },
  {
    path: 'attendance',
    component: AttendanceComponent,
    canMatch: [isAdminGuard]
  },
  {
    path: 'chatbot-config',
    component: ChatbotConfigComponent,
    canMatch: [isAdminGuard]
  },
  {
    path: 'charts',
    component: ChartsComponent,
    canMatch: [isAdminGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatTabsModule
  ]
})
export class AdminModule { }
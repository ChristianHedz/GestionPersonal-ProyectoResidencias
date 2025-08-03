import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

import { EmployeeProfileComponent } from './components/employee-profile/employee-profile.component';
import { EmployeeDataComponent } from './components/employee-data/employee-data.component';

import { isEmployeeGuard } from '../../core/guards/is-employee.guard';
import { DashboardComponent } from '../admin/components/dashboard/dashboard.component';
import { EmployeeCalendarComponent } from '../calendar/components/calendar/employee-calendar/employee-calendar.component';

const routes: Routes = [
  {
    path: 'profile',
    component: EmployeeProfileComponent,
    canMatch: [isEmployeeGuard]
  },
  {
    path: 'data',
    component: EmployeeDataComponent,
    canMatch: [isEmployeeGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canMatch: [isEmployeeGuard]
  },
  {
    path: 'calendar',
    component: EmployeeCalendarComponent,
    canMatch: [isEmployeeGuard]
  },

  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule
  ]
})
export class EmployeeModule { }
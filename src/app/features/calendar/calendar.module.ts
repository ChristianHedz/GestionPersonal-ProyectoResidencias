import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FullCalendarModule } from '@fullcalendar/angular';

import { CalendarComponent } from './components/calendar/calendar.component';
import { EmployeeCalendarComponent } from './components/calendar/employee-calendar/employee-calendar.component';
import { EventDialogComponent } from './components/calendar/event-dialog/event-dialog.component';

import { isAuthGuard } from '../../core/guards/is-auth.guard';
import { isEmployeeGuard } from '../../core/guards/is-employee.guard';

const routes: Routes = [
  {
    path: 'admin',
    component: CalendarComponent,
    canMatch: [isAuthGuard]
  },
  {
    path: 'employee',
    component: EmployeeCalendarComponent,
    canMatch: [isEmployeeGuard]
  },
  {
    path: '',
    redirectTo: 'admin',
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
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FullCalendarModule
  ]
})
export class CalendarModule { }
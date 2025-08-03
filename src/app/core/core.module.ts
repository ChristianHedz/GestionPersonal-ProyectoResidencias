import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { NavigationService } from './services/navigation.service';
import { EmployeesService } from './services/employees.service';
import { CalendarService } from './services/calendar.service';
import { EventService } from './services/event.service';
import { ChartDataService } from './services/chart-data.service';
import { ChatbotService } from './services/chatbot.service';
import { ValidatorsService } from './services/validators.service';
import { EmployeeAttendanceService } from './services/attendance.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    AuthService,
    ErrorHandlerService,
    NavigationService,
    EmployeeAttendanceService,
    EmployeesService,
    CalendarService,
    EventService,
    ChartDataService,
    ChatbotService,
    ValidatorsService,
    // El interceptor ahora se configura funcionalmente en app.config.ts
  ],
  exports: [
    CommonModule,
  ]
})
export class CoreModule { } 
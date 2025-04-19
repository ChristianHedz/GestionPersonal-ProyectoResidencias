import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { 
  EmployeeIncidenceData, 
  GeneralIncidenceData, 
  EmployeeHoursData, 
  EmployeeVacationData 
} from '../interfaces/chart-data.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Mock data for development - will be replaced with API calls
  private mockEmployeeIncidenceData: EmployeeIncidenceData[] = [
    { employeeId: 1, employeeName: 'Juan Pérez', absences: 1, delays: 2, week: 1 },
    { employeeId: 2, employeeName: 'María López', absences: 0, delays: 1, week: 1 },
    { employeeId: 3, employeeName: 'Carlos Ruiz', absences: 2, delays: 0, week: 1 },
    { employeeId: 4, employeeName: 'Ana García', absences: 0, delays: 3, week: 1 },
    { employeeId: 5, employeeName: 'Roberto Sánchez', absences: 1, delays: 1, week: 1 },
    { employeeId: 1, employeeName: 'Juan Pérez', absences: 0, delays: 1, week: 2 },
    { employeeId: 2, employeeName: 'María López', absences: 1, delays: 0, week: 2 },
    { employeeId: 3, employeeName: 'Carlos Ruiz', absences: 0, delays: 2, week: 2 },
    { employeeId: 4, employeeName: 'Ana García', absences: 2, delays: 1, week: 2 },
    { employeeId: 5, employeeName: 'Roberto Sánchez', absences: 0, delays: 0, week: 2 },
    { employeeId: 1, employeeName: 'Juan Pérez', absences: 1, delays: 0, week: 3 },
    { employeeId: 2, employeeName: 'María López', absences: 0, delays: 2, week: 3 },
    { employeeId: 3, employeeName: 'Carlos Ruiz', absences: 1, delays: 1, week: 3 },
    { employeeId: 4, employeeName: 'Ana García', absences: 0, delays: 0, week: 3 },
    { employeeId: 5, employeeName: 'Roberto Sánchez', absences: 2, delays: 1, week: 3 },
    { employeeId: 1, employeeName: 'Juan Pérez', absences: 0, delays: 0, week: 4 },
    { employeeId: 2, employeeName: 'María López', absences: 2, delays: 1, week: 4 },
    { employeeId: 3, employeeName: 'Carlos Ruiz', absences: 0, delays: 0, week: 4 },
    { employeeId: 4, employeeName: 'Ana García', absences: 1, delays: 2, week: 4 },
    { employeeId: 5, employeeName: 'Roberto Sánchez', absences: 0, delays: 1, week: 4 },
  ];

  private mockGeneralIncidenceData: GeneralIncidenceData[] = [
    { week: 1, totalAbsences: 4, totalDelays: 7, employeeCount: 5 },
    { week: 2, totalAbsences: 3, totalDelays: 4, employeeCount: 5 },
    { week: 3, totalAbsences: 4, totalDelays: 4, employeeCount: 5 },
    { week: 4, totalAbsences: 3, totalDelays: 4, employeeCount: 5 },
  ];

  private mockEmployeeHoursData: EmployeeHoursData[] = [
    { employeeId: 1, employeeName: 'Juan Pérez', hoursWorked: 38, week: 1 },
    { employeeId: 2, employeeName: 'María López', hoursWorked: 40, week: 1 },
    { employeeId: 3, employeeName: 'Carlos Ruiz', hoursWorked: 32, week: 1 },
    { employeeId: 4, employeeName: 'Ana García', hoursWorked: 39, week: 1 },
    { employeeId: 5, employeeName: 'Roberto Sánchez', hoursWorked: 37, week: 1 },
    { employeeId: 1, employeeName: 'Juan Pérez', hoursWorked: 40, week: 2 },
    { employeeId: 2, employeeName: 'María López', hoursWorked: 36, week: 2 },
    { employeeId: 3, employeeName: 'Carlos Ruiz', hoursWorked: 40, week: 2 },
    { employeeId: 4, employeeName: 'Ana García', hoursWorked: 30, week: 2 },
    { employeeId: 5, employeeName: 'Roberto Sánchez', hoursWorked: 40, week: 2 },
    { employeeId: 1, employeeName: 'Juan Pérez', hoursWorked: 36, week: 3 },
    { employeeId: 2, employeeName: 'María López', hoursWorked: 40, week: 3 },
    { employeeId: 3, employeeName: 'Carlos Ruiz', hoursWorked: 35, week: 3 },
    { employeeId: 4, employeeName: 'Ana García', hoursWorked: 40, week: 3 },
    { employeeId: 5, employeeName: 'Roberto Sánchez', hoursWorked: 34, week: 3 },
    { employeeId: 1, employeeName: 'Juan Pérez', hoursWorked: 40, week: 4 },
    { employeeId: 2, employeeName: 'María López', hoursWorked: 32, week: 4 },
    { employeeId: 3, employeeName: 'Carlos Ruiz', hoursWorked: 40, week: 4 },
    { employeeId: 4, employeeName: 'Ana García', hoursWorked: 35, week: 4 },
    { employeeId: 5, employeeName: 'Roberto Sánchez', hoursWorked: 38, week: 4 },
  ];

  private mockEmployeeVacationData: EmployeeVacationData[] = [
    { employeeId: 1, employeeName: 'Juan Pérez', vacationDaysAvailable: 10, vacationDaysTaken: 5, vacationDaysTotal: 15 },
    { employeeId: 2, employeeName: 'María López', vacationDaysAvailable: 8, vacationDaysTaken: 7, vacationDaysTotal: 15 },
    { employeeId: 3, employeeName: 'Carlos Ruiz', vacationDaysAvailable: 12, vacationDaysTaken: 3, vacationDaysTotal: 15 },
    { employeeId: 4, employeeName: 'Ana García', vacationDaysAvailable: 5, vacationDaysTaken: 10, vacationDaysTotal: 15 },
    { employeeId: 5, employeeName: 'Roberto Sánchez', vacationDaysAvailable: 15, vacationDaysTaken: 0, vacationDaysTotal: 15 },
  ];

  // Real API methods (currently returning mock data)
  getEmployeeIncidences(week: number): Observable<EmployeeIncidenceData[]> {
    // In production: return this.http.get<EmployeeIncidenceData[]>(`${this.baseUrl}/employees/incidences?week=${week}`);
    return of(this.mockEmployeeIncidenceData.filter(data => data.week === week));
  }

  getGeneralIncidences(week: number): Observable<GeneralIncidenceData> {
    // In production: return this.http.get<GeneralIncidenceData>(`${this.baseUrl}/incidences/general?week=${week}`);
    return of(this.mockGeneralIncidenceData.find(data => data.week === week) || this.mockGeneralIncidenceData[0]);
  }

  getEmployeeHours(week: number): Observable<EmployeeHoursData[]> {
    // In production: return this.http.get<EmployeeHoursData[]>(`${this.baseUrl}/employees/hours?week=${week}`);
    return of(this.mockEmployeeHoursData.filter(data => data.week === week));
  }

  getEmployeeVacations(): Observable<EmployeeVacationData[]> {
    // In production: return this.http.get<EmployeeVacationData[]>(`${this.baseUrl}/employees/vacations`);
    return of(this.mockEmployeeVacationData);
  }

  // Methods to get all weeks data for reports
  getAllEmployeeIncidences(): Observable<EmployeeIncidenceData[]> {
    // In production: return this.http.get<EmployeeIncidenceData[]>(`${this.baseUrl}/employees/incidences/all`);
    return of(this.mockEmployeeIncidenceData);
  }

  getAllGeneralIncidences(): Observable<GeneralIncidenceData[]> {
    // In production: return this.http.get<GeneralIncidenceData[]>(`${this.baseUrl}/incidences/general/all`);
    return of(this.mockGeneralIncidenceData);
  }

  getAllEmployeeHours(): Observable<EmployeeHoursData[]> {
    // In production: return this.http.get<EmployeeHoursData[]>(`${this.baseUrl}/employees/hours/all`);
    return of(this.mockEmployeeHoursData);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  DateRange,
  EmployeeIncidenceData, 
  GeneralIncidenceData, 
  EmployeeHoursData, 
  EmployeeVacationData,
  AvailableVacationsResponse,
  AttendanceStats,
  GeneralAttendanceStats,
  WorkedHoursResponse
} from '../models/common/chart-data.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Helper function to get default date range (first day of month to current date)
  private getDefaultDateRange(): DateRange {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { startDate: firstDayOfMonth, endDate: today };
  }

  // Helper function to check if a date is within a range
  private isDateInRange(date: Date, range: DateRange): boolean {
    const dateToCheck = new Date(date);
    return dateToCheck >= new Date(range.startDate) && 
           dateToCheck <= new Date(range.endDate);
  }

  // Mock data for development - will be replaced with API calls
  private mockEmployeeIncidenceData: EmployeeIncidenceData[] = [
    { employeeId: 1, employeeName: 'Juan Pérez', absences: 1, delays: 2, date: new Date(2025, 3, 5) },
    { employeeId: 2, employeeName: 'María López', absences: 2, delays: 1, date: new Date(2025, 3, 5) },
    { employeeId: 3, employeeName: 'Carlos Ruiz', absences: 0, delays: 1, date: new Date(2025, 3, 5) },
    { employeeId: 4, employeeName: 'Ana García', absences: 1, delays: 0, date: new Date(2025, 3, 5) },
    { employeeId: 5, employeeName: 'Roberto Sánchez', absences: 0, delays: 0, date: new Date(2025, 3, 5) },
  ];

  private mockGeneralIncidenceData: GeneralIncidenceData[] = [
    { date: new Date(2025, 3, 5), totalAbsences: 4, totalDelays: 7, employeeCount: 5 },
    { date: new Date(2025, 3, 12), totalAbsences: 3, totalDelays: 4, employeeCount: 5 },
    { date: new Date(2025, 3, 19), totalAbsences: 4, totalDelays: 4, employeeCount: 5 },
    { date: new Date(2025, 3, 26), totalAbsences: 3, totalDelays: 4, employeeCount: 5 },
  ];

  private mockEmployeeHoursData: EmployeeHoursData[] = [
    { employeeId: 1, employeeName: 'Juan Pérez', hoursWorked: 38, date: new Date(2025, 3, 5) },
    { employeeId: 2, employeeName: 'María López', hoursWorked: 42, date: new Date(2025, 3, 5) },
    { employeeId: 3, employeeName: 'Carlos Ruiz', hoursWorked: 36, date: new Date(2025, 3, 5) },
    { employeeId: 4, employeeName: 'Ana García', hoursWorked: 40, date: new Date(2025, 3, 5) },
    { employeeId: 5, employeeName: 'Roberto Sánchez', hoursWorked: 34, date: new Date(2025, 3, 5) },
  ];

  // Default total vacation days - can be configured as needed
  private readonly DEFAULT_TOTAL_VACATION_DAYS = 5;

  // Real API methods (currently returning mock data)
  getEmployeeIncidences(dateRange?: DateRange): Observable<EmployeeIncidenceData[]> {
    const range = dateRange || this.getDefaultDateRange();
    // In production: return this.http.get<EmployeeIncidenceData[]>(
    //   `${this.baseUrl}/employees/incidences?startDate=${range.startDate.toISOString()}&endDate=${range.endDate.toISOString()}`
    // );
    return of(this.mockEmployeeIncidenceData.filter(data => this.isDateInRange(data.date, range)));
  }

  /**
   * Obtains general incidence data for a given date range
   * @param dateRange Optional date range to filter data
   * @returns Observable with general incidence data
   */
  getGeneralIncidences(dateRange?: DateRange): Observable<GeneralIncidenceData> {
    // Get attendance stats from the new endpoint and transform it to match the GeneralIncidenceData interface
    return this.getGeneralAttendanceStats(dateRange).pipe(
      map(stats => ({
        date: (dateRange?.endDate || new Date()),
        totalAbsences: stats.totalAbsences,
        totalDelays: stats.totalTardiness,
        employeeCount: 0 // This information is not available in the new API
      }))
    );
  }

  /**
   * Gets employee worked hours from the backend API
   * @param dateRange Optional date range to filter the data
   * @returns Observable with employee hours data
   */
  getEmployeeHours(dateRange?: DateRange): Observable<EmployeeHoursData[]> {
    const range = dateRange || this.getDefaultDateRange();
    const startDateFormatted = this.formatDate(range.startDate);
    const endDateFormatted = this.formatDate(range.endDate);
    
    return this.http.get<WorkedHoursResponse[]>(
      `http://localhost:8081/api/v1/charts/worked-hours?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
    )
    .pipe(
      map(response => response.map(item => ({
        employeeId: 0, // Not available in the backend response
        employeeName: item.fullName,
        hoursWorked: item.workedHours,
        date: range.endDate // We use the end date of the range as default
      })))
    );
  }

  /**
   * Obtains vacation data from the backend and calculates days taken
   * @returns Observable with processed vacation data for each employee
   */
  getEmployeeVacations(): Observable<EmployeeVacationData[]> {
    return this.http.get<AvailableVacationsResponse[]>('http://localhost:8081/api/v1/available-vacations')
      .pipe(
        map(response => response.map(item => ({
          employeeName: item.fullName,
          vacationDaysAvailable: item.availableVacationDays,
          vacationDaysTaken: this.DEFAULT_TOTAL_VACATION_DAYS - item.availableVacationDays,
          vacationDaysTotal: this.DEFAULT_TOTAL_VACATION_DAYS
        })))
      );
  }

  // Methods to get all data for reports, regardless of date range
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

  /**
   * Format date in YYYY-MM-DD format for the Java backend
   * @param date Date to format
   * @returns Formatted date string
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Obtiene las estadísticas de asistencia de los empleados desde el endpoint real
   * @param dateRange Rango de fechas opcional para filtrar los datos
   * @returns Observable con array de estadísticas de asistencia por empleado
   */
  getEmployeeAttendanceStats(dateRange?: DateRange): Observable<AttendanceStats[]> {
    const range = dateRange || this.getDefaultDateRange();
    
    const startDateFormatted = this.formatDate(range.startDate);
    const endDateFormatted = this.formatDate(range.endDate);
    
    return this.http.get<AttendanceStats[]>(
      `http://localhost:8081/api/v1/charts?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
    );
  }

  /**
   * Gets general attendance statistics from the backend API
   * @param dateRange Optional date range to filter the data
   * @returns Observable with general attendance statistics
   */
  getGeneralAttendanceStats(dateRange?: DateRange): Observable<GeneralAttendanceStats> {
    const range = dateRange || this.getDefaultDateRange();
    
    const startDateFormatted = this.formatDate(range.startDate);
    const endDateFormatted = this.formatDate(range.endDate);
    
    return this.http.get<GeneralAttendanceStats>(
      `http://localhost:8081/api/v1/charts/attendance-stats?startDate=${startDateFormatted}&endDate=${endDateFormatted}`
    );
  }
}

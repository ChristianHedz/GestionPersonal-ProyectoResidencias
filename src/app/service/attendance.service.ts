import { HttpClient, HttpParams } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

import { AssistDetailsDTO } from '../interfaces/assist-details.interface';
import { PageResponse } from '../interfaces/pagination.interface';
import { ErrorHandlerService } from './error-handler.service';
import { environment } from '../../env/enviroments';
import { API_ENDPOINTS } from '../config/api.endpoints';
import { AttendanceFilterParams, SortOrder } from '../interfaces/attendance-filter.interface';
import { Attendance } from '../interfaces/Attendance.interface';


@Injectable({
  providedIn: 'root'
})
export class EmployeeAttendanceService {
  private readonly apiUrl = environment.urlApi;
  private readonly http = inject(HttpClient);
  private readonly handleError = inject(ErrorHandlerService);
  private readonly errorHandler = this.handleError.handleError;

  private readonly _loading = signal<boolean>(false);
  private readonly _totalElements = signal<number>(0);

  public readonly loading = this._loading.asReadonly();
  public readonly totalElements = this._totalElements.asReadonly();

  private static readonly DEFAULT_PAGE = 0;
  private static readonly DEFAULT_SIZE = 20;
  private static readonly DEFAULT_SORT_BY = 'date';
  private static readonly DEFAULT_SORT_ORDER: SortOrder = 'desc';

  /**
   * Método unificado para obtener registros de asistencia con diversos filtros
   * @param filters Objeto con los parámetros de filtrado
   * @returns Observable con array de AssistDetailsDTO
   */
  getAttendance(filters: AttendanceFilterParams = {}): Observable<AssistDetailsDTO[]> {
    this._loading.set(true);

    const params = this.buildHttpParams(filters);
    const endpoint = API_ENDPOINTS.ATTENDANCE.FILTERED;

    return this.http.get<PageResponse<Attendance>>(`${this.apiUrl}${endpoint}`, { params })
      .pipe(
        map(response => {
          this._totalElements.set(response.totalElements);
          return this.formatDates(response.content || []);
        }),
        tap(() => this._loading.set(false)),
        catchError(error => {
          this._loading.set(false);
          return throwError(() => this.errorHandler(error));
        })
      );
  }

  /**
   * Construye los parámetros de consulta HTTP basados en los filtros proporcionados
   * @param filters Objeto con los parámetros de filtrado
   * @returns HttpParams con los filtros aplicados
   */
  private buildHttpParams(filters: AttendanceFilterParams): HttpParams {
    const {
      page = EmployeeAttendanceService.DEFAULT_PAGE,
      size = EmployeeAttendanceService.DEFAULT_SIZE,
      employeeId,
      attendanceType,
      startDate,
      endDate,
      sortBy = EmployeeAttendanceService.DEFAULT_SORT_BY,
      sortOrder = EmployeeAttendanceService.DEFAULT_SORT_ORDER
    } = filters;

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    if (employeeId) {
      params = params.set('employeeId', employeeId.toString());
    }

    if (attendanceType && attendanceType !== 'all') {
      params = params.set('type', attendanceType);
    }

    if (startDate && endDate) {
      params = params.set('startDate', startDate).set('endDate', endDate);
    }

    console.log('Parámetros de consulta:', params.toString());

    return params;
  }

  /**
   * Método auxiliar para formatear fechas consistentemente
   * @param data Array de registros de asistencia
   * @returns Registros de asistencia formateados
   */
  private formatDates(data: AssistDetailsDTO[]): AssistDetailsDTO[] {
    if (!Array.isArray(data)) {
      console.error('Se esperaba un array pero se recibió:', data);
      return [];
    }

    return data.map(record => ({
      ...record,
      date: record.date
    }));
  }
}
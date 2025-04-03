import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

import { AssistDetailsDTO } from '../interfaces/assist-details.interface';
import { PageResponse } from '../interfaces/pagination.interface';
import { ErrorHandlerService } from './error-handler.service';
import { environment } from '../../env/enviroments';
import { API_ENDPOINTS } from '../config/api.endpoints';

/**
 * Servicio para gestionar los datos de asistencia de empleados
 */
@Injectable({
  providedIn: 'root'
})
export class EmployeeAttendanceService {
  private readonly apiUrl = environment.urlApi;
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly handleError = inject(ErrorHandlerService);
  private readonly errorHandler = this.handleError.handleError;

  /**
   * Signal para seguimiento del estado de carga 
   */
  private readonly _loading = signal<boolean>(false);

  // Signal para el total de elementos disponibles
  private readonly _totalElements = signal<number>(0);

  /**
   * Acceso público al estado de carga
   */
  public readonly loading = this._loading.asReadonly();
  
  /**
   * Acceso público al total de elementos
   */
  public readonly totalElements = this._totalElements.asReadonly();

  /**
   * Obtiene todos los registros de asistencia paginados
   * @param page Número de página (por defecto 0)
   * @param size Tamaño de página (por defecto 20)
   * @returns Observable con array de AssistDetailsDTO
   */
  getAllAttendance(page: number = 0, size: number = 20): Observable<AssistDetailsDTO[]> {
    this._loading.set(true);
    return this.http.get<PageResponse<AssistDetailsDTO>>(
      `${this.apiUrl}${API_ENDPOINTS.ATTENDANCE.GET_ALL}?page=${page}&size=${size}`
    ).pipe(
      map(response => {
        // Actualizar el total de elementos
        this._totalElements.set(response.totalElements);
        // Formatear las fechas de los elementos de la página
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
   * Obtiene los registros de asistencia más recientes
   * @param limit Límite opcional para el número de registros a devolver
   * @returns Observable con array de AssistDetailsDTO
   */
  getRecentAttendance(limit: number = 20): Observable<AssistDetailsDTO[]> {
    this._loading.set(true);
    return this.http.get<PageResponse<AssistDetailsDTO>>(
      `${this.apiUrl}${API_ENDPOINTS.ATTENDANCE.GET_RECENT}?size=${limit}`
    ).pipe(
      map(response => {
        // Actualizar el total de elementos
        this._totalElements.set(response.totalElements);
        // Formatear las fechas de los elementos de la página
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
   * Obtiene los registros de asistencia para un empleado específico
   * @param employeeId ID del empleado
   * @param page Número de página (por defecto 0)
   * @param size Tamaño de página (por defecto 20)
   * @returns Observable con array de AssistDetailsDTO
   */
  getAttendanceByEmployee(employeeId: number, page: number = 0, size: number = 20): Observable<AssistDetailsDTO[]> {
    this._loading.set(true);
    return this.http.get<PageResponse<AssistDetailsDTO>>(
      `${this.apiUrl}${API_ENDPOINTS.ATTENDANCE.GET_BY_EMPLOYEE}/${employeeId}?page=${page}&size=${size}`
    ).pipe(
      map(response => {
        // Actualizar el total de elementos
        this._totalElements.set(response.totalElements);
        // Formatear las fechas de los elementos de la página
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
   * Obtiene los registros de asistencia para una fecha específica
   * @param date Fecha en formato YYYY-MM-DD
   * @param page Número de página (por defecto 0)
   * @param size Tamaño de página (por defecto 20)
   * @returns Observable con array de AssistDetailsDTO
   */
  getAttendanceByDate(date: string, page: number = 0, size: number = 20): Observable<AssistDetailsDTO[]> {
    this._loading.set(true);
    return this.http.get<PageResponse<AssistDetailsDTO>>(
      `${this.apiUrl}${API_ENDPOINTS.ATTENDANCE.GET_BY_DATE}/${date}?page=${page}&size=${size}`
    ).pipe(
      map(response => {
        // Actualizar el total de elementos
        this._totalElements.set(response.totalElements);
        // Formatear las fechas de los elementos de la página
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
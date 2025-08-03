import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CalendarEventDTO } from '../models/calendar/calendar-event.dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private baseUrl = `${environment.apiUrl}/v1/calendar-events`;

  constructor(private http: HttpClient) {
    console.log('CalendarService baseUrl:', this.baseUrl);
  }

  /**
   * Crea un nuevo evento en el calendario.
   * @param eventData Los datos del evento a crear, conforme a CalendarEventDTO.
   * @returns Un Observable con el evento creado.
   */
  createEvent(eventData: CalendarEventDTO): Observable<CalendarEventDTO> {
    console.log('Creando evento:', eventData);
    console.log('Creando evento:', {eventData});
    return this.http.post<CalendarEventDTO>(this.baseUrl, eventData)
    .pipe(
      map((response) => {
        console.log('Evento creado exitosamente:', response);
        return response;
      }),
    )
  }

  /**
   * Obtiene todos los eventos del calendario.
   * @returns Un Observable con un array de eventos.
   */
  getEvents(): Observable<CalendarEventDTO[]> {
    return this.http.get<CalendarEventDTO[]>(this.baseUrl);
  }

  /**
   * Obtiene un evento específico por su ID.
   * @param id El ID del evento a obtener.
   * @returns Un Observable con el evento encontrado.
   */
  getEventById(id: number): Observable<CalendarEventDTO> {
    return this.http.get<CalendarEventDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Actualiza un evento existente en el calendario.
   * @param id El ID del evento a actualizar.
   * @param eventData Los nuevos datos del evento.
   * @returns Un Observable con el evento actualizado.
   */
  updateEvent(id: number, eventData: CalendarEventDTO): Observable<CalendarEventDTO> {
    return this.http.put<CalendarEventDTO>(`${this.baseUrl}/${id}`, eventData);
  }

  /**
   * Elimina un evento del calendario.
   * @param id El ID del evento a eliminar.
   * @returns Un Observable vacío.
   */
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene todos los eventos de un empleado específico.
   * @param employeeId El ID del empleado.
   * @returns Un Observable con un array de eventos del empleado.
   */
  getEventsByEmployeeId(employeeId: number): Observable<CalendarEventDTO[]> {
    return this.http.get<CalendarEventDTO[]>(`${this.baseUrl}/employee/${employeeId}`);
  }

  /**
   * Obtiene eventos por rango de fechas.
   * @param startDate Fecha de inicio en formato ISO.
   * @param endDate Fecha de fin en formato ISO.
   * @returns Un Observable con un array de eventos en el rango especificado.
   */
  getEventsByDateRange(startDate: string, endDate: string): Observable<CalendarEventDTO[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<CalendarEventDTO[]>(`${this.baseUrl}/date-range`, { params });
  }

  /**
   * Obtiene eventos de un empleado específico por rango de fechas.
   * @param employeeId El ID del empleado.
   * @param startDate Fecha de inicio en formato ISO.
   * @param endDate Fecha de fin en formato ISO.
   * @returns Un Observable con un array de eventos del empleado en el rango especificado.
   */
  getEventsByEmployeeIdAndDateRange(employeeId: number, startDate: string, endDate: string): Observable<CalendarEventDTO[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<CalendarEventDTO[]>(`${this.baseUrl}/employee/${employeeId}/date-range`, { params });
  }
}

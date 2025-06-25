import { environment } from './../../env/enviroments';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { ApiResponse, Event, EventRequest } from '../interfaces/event.interfaces';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  
  // Signal to store events
  private _events = signal<Event[]>([]);
  
  // Public readonly accessor for events
  public readonly events = this._events.asReadonly();

  // Local event array for mock data
  private mockEvents: Event[] = [];

  /**
   * Gets all events
   * @returns Observable of events array
   */
  getAllEvents(): Observable<Event[]> {
    // Mock implementation using local array
    if (this.mockEvents.length > 0) {
      return of(this.mockEvents).pipe(
        tap(events => this._events.set(events))
      );
    }
    
    // Actual API implementation
    return this.http.get<ApiResponse<Event[]>>(`${this.apiUrl}/events`).pipe(
      map(response => response.data),
      tap(events => this._events.set(events)),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Gets event by ID
   * @param id Event ID
   * @returns Observable of event
   */
  getEventById(id: number): Observable<Event> {
    // Mock implementation
    const mockEvent = this.mockEvents.find(event => event.id === id);
    if (mockEvent) {
      return of(mockEvent);
    }
    
    // Actual API implementation
    return this.http.get<ApiResponse<Event>>(`${this.apiUrl}/events/${id}`).pipe(
      map(response => response.data),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Creates a new event
   * @param eventRequest Event data
   * @returns Observable of created event
   */
  createEvent(eventRequest: EventRequest): Observable<Event> {
    // Mock implementation
    if (this.useMockData()) {
      const newEvent: Event = {
        ...eventRequest,
        id: this.getNextId(),
        participants: [] // Would be populated in real implementation
      };
      
      this.mockEvents.push(newEvent);
      this._events.set([...this.mockEvents]);
      return of(newEvent);
    }
    
    // Actual API implementation
    return this.http.post<ApiResponse<Event>>(`${this.apiUrl}/events`, eventRequest).pipe(
      map(response => response.data),
      tap(event => {
        const currentEvents = this._events();
        this._events.set([...currentEvents, event]);
      }),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Updates an existing event
   * @param id Event ID
   * @param eventRequest Updated event data
   * @returns Observable of updated event
   */
  updateEvent(id: number, eventRequest: EventRequest): Observable<Event> {
    // Mock implementation
    if (this.useMockData()) {
      const index = this.mockEvents.findIndex(event => event.id === id);
      if (index !== -1) {
        const updatedEvent: Event = {
          ...eventRequest,
          id,
          participants: this.mockEvents[index].participants
        };
        
        this.mockEvents[index] = updatedEvent;
        this._events.set([...this.mockEvents]);
        return of(updatedEvent);
      }
      return throwError(() => new Error('Event not found'));
    }
    
    // Actual API implementation
    return this.http.put<ApiResponse<Event>>(`${this.apiUrl}/events/${id}`, eventRequest).pipe(
      map(response => response.data),
      tap(updatedEvent => {
        const currentEvents = this._events();
        const index = currentEvents.findIndex(e => e.id === id);
        if (index !== -1) {
          const updatedEvents = [...currentEvents];
          updatedEvents[index] = updatedEvent;
          this._events.set(updatedEvents);
        }
      }),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Deletes an event
   * @param id Event ID
   * @returns Observable of boolean indicating success
   */
  deleteEvent(id: number): Observable<boolean> {
    // Mock implementation
    if (this.useMockData()) {
      const index = this.mockEvents.findIndex(event => event.id === id);
      if (index !== -1) {
        this.mockEvents.splice(index, 1);
        this._events.set([...this.mockEvents]);
        return of(true);
      }
      return of(false);
    }
    
    // Actual API implementation
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/events/${id}`).pipe(
      map(response => response.data),
      tap(success => {
        if (success) {
          const currentEvents = this._events();
          this._events.set(currentEvents.filter(event => event.id !== id));
        }
      }),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Checks if mock data should be used
   * Set to true for now, switch to false when backend is ready
   */
  private useMockData(): boolean {
    return true;
  }

  /**
   * Generates next ID for mock implementation
   */
  private getNextId(): number {
    const maxId = this.mockEvents.reduce(
      (max, event) => (event.id && event.id > max ? event.id : max),
      0
    );
    return maxId + 1;
  }
}

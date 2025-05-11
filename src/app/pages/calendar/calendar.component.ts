import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EmployeesService } from '../../service/employees.service';
import { EventDialogComponent } from './event-dialog/event-dialog.component';
import { CalendarService } from '../../core/services/calendar.service';
import { CalendarEventDTO } from '../../core/models/calendar-event.dto';
import { EventType, CalendarEvent } from '../../interfaces/event.interfaces';
import { EmployeeDTO } from '../../auth/interfaces/EmployeeDTO';
import { ToolbarComponent } from '../../shared/toolbar/toolbar.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    ToolbarComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  // Services
  private readonly calendarService = inject(CalendarService);
  private readonly employeeService = inject(EmployeesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // Calendar API reference
  @ViewChild('calendar') calendarComponent: any;

  // Signals for reactive state management
  isLoading = signal(true);
  calendarEvents = signal<CalendarEvent[]>([]);
  employees = signal<EmployeeDTO[]>([]);

  // Calendar configuration
  calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    themeSystem: 'standard',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events: [] as CalendarEvent[],
    // Calendar callbacks
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this)
  };

  ngOnInit(): void {
    this.loadEvents();
    this.loadEmployees();
  }

  /**
   * Loads all events from the service
   */
  loadEvents(): void {
    this.isLoading.set(true);
    this.calendarService.getEvents().subscribe({
      next: (events: CalendarEventDTO[]) => {
        const calendarEvents = this.mapToCalendarEvents(events);
        this.calendarEvents.set(calendarEvents);
        this.updateCalendarEvents(calendarEvents);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.showNotification('Error loading events', 'error');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Loads all employees from the service
   */
  loadEmployees(): void {
    this.employeeService.listAllEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees);
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.showNotification('Error loading employees', 'error');
      }
    });
  }

  /**
   * Maps backend events (CalendarEventDTO) to FullCalendar event format (CalendarEvent)
   */
  mapToCalendarEvents(events: CalendarEventDTO[]): CalendarEvent[] {
    return events.map(event => {
      const participants: EmployeeDTO[] = event.employeeIds
        ? event.employeeIds
            .map(id => this.employees().find(emp => emp.id === id))
            .filter((emp): emp is EmployeeDTO => emp !== undefined)
        : [];
      
      // Intentar inferir allDay si las fechas son a medianoche y abarcan un día completo.
      // FullCalendar también tiene su propia lógica para esto si solo se proporcionan fechas.
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      const isMidnightStart = start.getHours() === 0 && start.getMinutes() === 0 && start.getSeconds() === 0;
      const isMidnightEnd = end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0;
      let inferredAllDay = false;
      if (isMidnightStart && isMidnightEnd && (end.getTime() - start.getTime()) % (24 * 60 * 60 * 1000) === 0 && (end.getTime() - start.getTime()) >= (24 * 60 * 60 * 1000)) {
        inferredAllDay = true;
      } else if (isMidnightStart && event.endDate === event.startDate) { // Evento de un solo día sin hora específica
        inferredAllDay = true;
      }

      return {
        id: event.id!.toString(),
        title: event.title,
        start: event.startDate,
        end: event.endDate,
        allDay: inferredAllDay, // Usar el allDay inferido o el que FullCalendar determine
        backgroundColor: '#3788d8', // Color por defecto para eventos del backend
        borderColor: '#3788d8',   // Color por defecto
        description: event.description || '',
        eventType: event.eventType,
        participants: participants
      };
    });
  }

  /**
   * Updates the calendar with new events
   */
  updateCalendarEvents(events: CalendarEvent[]): void {
    const calendarApi = this.calendarComponent?.getApi();
    if (calendarApi) {
      calendarApi.removeAllEvents();
      events.forEach(event => calendarApi.addEvent(event));
    } else {
      this.calendarOptions = {
        ...this.calendarOptions,
        events
      };
    }
  }

  /**
   * Creates a new event with current date
   */
  createNewEvent(): void {
    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
    
    this.handleDateSelect({
      startStr: now.toISOString(),
      endStr: later.toISOString(),
      allDay: false,
      view: { 
        calendar: this.calendarComponent?.getApi() 
      }
    });
  }

  /**
   * Handles date selection to create a new event
   */
  handleDateSelect(selectInfo: any): void {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '600px',
      data: {
        mode: 'create',
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay, // El diálogo aún puede usarlo para la UI inicial
        employees: this.employees()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Resultado del diálogo:', result);
      if (result) {
        // Construir el DTO explícitamente para asegurar que todos los campos necesarios,
        // incluyendo employeeIds, se tomen del resultado del diálogo.
        // Se asume que 'result' contiene: title, description, startDate, endDate, eventType, y employeeIds.
        const dtoToSend: CalendarEventDTO = {
          title: result.title,
          description: result.description,
          startDate: result.startDate,
          endDate: result.endDate,
          eventType: result.eventType,
          employeeIds: result.participantIds || [] // Tomar employeeIds del resultado; si no existe, usar un array vacío.
        };

        this.calendarService.createEvent(dtoToSend).subscribe({
          next: () => {
            this.loadEvents();
            this.showNotification('Event created successfully', 'success');
          },
          error: (error) => {
            console.error('Error creating event:', error);
            this.showNotification('Error creating event', 'error');
          }
        });
      }
      const calendarApi = selectInfo.view.calendar;
      if (calendarApi) {
        calendarApi.unselect();
      }
    });
  }

  /**
   * Handles event click to edit or delete an event
   */
  handleEventClick(clickInfo: any): void {
    const eventId = parseInt(clickInfo.event.id, 10);
    
    this.calendarService.getEventById(eventId).subscribe({
      next: (event: CalendarEventDTO) => { // event (DTO) no tendrá allDay ni color
        const dialogRef = this.dialog.open(EventDialogComponent, {
          width: '600px',
          data: {
            mode: 'edit',
            event: {
              ...event, // DTO del backend
              // El diálogo puede necesitar valores por defecto para allDay/color para el formulario si los usa
              // Aquí podrías pasar el allDay/color del evento de FullCalendar si fuera necesario para la UI del diálogo
              allDay: clickInfo.event.allDay, // Pasar el allDay del evento de FullCalendar
              color: clickInfo.event.backgroundColor // Pasar el color del evento de FullCalendar
            },
            employees: this.employees()
          }
        });

        dialogRef.afterClosed().subscribe(dialogResult => {
          if (!dialogResult) return;
          
          if (dialogResult === 'delete') {
            this.deleteEvent(eventId);
          } else {
            // Construir el DTO explícitamente.
            // Se asume que 'dialogResult' contiene: title, description, startDate, endDate, eventType, y employeeIds.
            const dtoToSend: CalendarEventDTO = {
              title: dialogResult.title,
              description: dialogResult.description,
              startDate: dialogResult.startDate,
              endDate: dialogResult.endDate,
              eventType: dialogResult.eventType,
              employeeIds: dialogResult.employeeIds || [] // Tomar employeeIds del resultado; si no existe, usar un array vacío.
            };
            this.updateEvent(eventId, dtoToSend);
          }
        });
      },
      error: (error) => {
        console.error('Error loading event details:', error);
        this.showNotification('Error loading event details', 'error');
      }
    });
  }

  /**
   * Updates an event
   */
  updateEvent(eventId: number, eventData: CalendarEventDTO): void { // eventData ya no debería tener allDay/color
    this.calendarService.updateEvent(eventId, eventData).subscribe({
      next: () => {
        this.loadEvents();
        this.showNotification('Event updated successfully', 'success');
      },
      error: (error) => {
        console.error('Error updating event:', error);
        this.showNotification('Error updating event', 'error');
      }
    });
  }

  /**
   * Deletes an event
   */
  deleteEvent(eventId: number): void {
    this.calendarService.deleteEvent(eventId).subscribe({
      next: () => {
        this.loadEvents();
        this.showNotification('Event deleted successfully', 'success');
      },
      error: (error) => {
        console.error('Error deleting event:', error);
        this.showNotification('Error deleting event', 'error');
      }
    });
  }

  /**
   * Handles event drag & drop
   */
  handleEventDrop(dropInfo: any): void {
    const eventId = parseInt(dropInfo.event.id, 10);
    
    this.calendarService.getEventById(eventId).subscribe({
      next: (originalEvent: CalendarEventDTO) => { // originalEvent (DTO) no tiene allDay ni color
        const updatedEventData: Partial<CalendarEventDTO> = {
          // Copiar solo las propiedades que existen en CalendarEventDTO
          title: originalEvent.title,
          description: originalEvent.description,
          startDate: dropInfo.event.start.toISOString(),
          endDate: dropInfo.event.end?.toISOString() || 
                   new Date(dropInfo.event.start.getTime() + 
                            (new Date(originalEvent.endDate).getTime() - new Date(originalEvent.startDate).getTime())
                           ).toISOString(),
          eventType: originalEvent.eventType,
          employeeIds: originalEvent.employeeIds,
          // NO incluir allDay ni color aquí
        };
        
        this.calendarService.updateEvent(eventId, updatedEventData as CalendarEventDTO).subscribe({
          next: () => {
            this.loadEvents();
            this.showNotification('Event updated successfully', 'success');
          },
          error: (error) => {
            dropInfo.revert();
            console.error('Error updating event:', error);
            this.showNotification('Error updating event', 'error');
          }
        });
      },
      error: (error) => {
        dropInfo.revert();
        console.error('Error loading event details:', error);
        this.showNotification('Error loading event details', 'error');
      }
    });
  }

  /**
   * Handles event resize
   */
  handleEventResize(resizeInfo: any): void {
    const eventId = parseInt(resizeInfo.event.id, 10);
    
    this.calendarService.getEventById(eventId).subscribe({
      next: (originalEvent: CalendarEventDTO) => { // originalEvent (DTO) no tiene allDay ni color
        const updatedEventData: Partial<CalendarEventDTO> = {
          title: originalEvent.title,
          description: originalEvent.description,
          startDate: resizeInfo.event.start.toISOString(),
          endDate: resizeInfo.event.end.toISOString(),
          eventType: originalEvent.eventType,
          employeeIds: originalEvent.employeeIds,
          // NO incluir allDay ni color aquí
        };
        
        this.calendarService.updateEvent(eventId, updatedEventData as CalendarEventDTO).subscribe({
          next: () => {
            this.loadEvents();
            this.showNotification('Event updated successfully', 'success');
          },
          error: (error) => {
            resizeInfo.revert();
            console.error('Error updating event:', error);
            this.showNotification('Error updating event', 'error');
          }
        });
      },
      error: (error) => {
        resizeInfo.revert();
        console.error('Error loading event details:', error);
        this.showNotification('Error loading event details', 'error');
      }
    });
  }

  /**
   * Shows a notification snackbar
   */
  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['error-snackbar'] : ['success-snackbar']
    });
  }
}

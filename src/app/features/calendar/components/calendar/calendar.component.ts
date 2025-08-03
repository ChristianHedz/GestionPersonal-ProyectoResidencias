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
import { EmployeesService } from '../../../../core/services/employees.service';
import { EventDialogComponent } from './event-dialog/event-dialog.component';
import { CalendarService } from '../../../../core/services/calendar.service';
import { CalendarEventDTO } from '../../../../core/models/calendar/calendar-event.dto';
import { EventType, CalendarEvent } from '../../../../core/models/common/event.interfaces';
import { EmployeeDTO } from '../../../../core/models/auth/EmployeeDTO';
import { ToolbarComponent } from '../../../../shared/components/toolbar/toolbar.component';

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

  // Color estándar para todos los eventos
  defaultEventColor = '#3788d8';

  // Calendar configuration
  calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    timeZone: 'local',
    themeSystem: 'standard',
    height: 'auto',
    contentHeight: 'auto',
    aspectRatio: 1.8,
    // Configuración responsiva de headerToolbar
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'today dayGridMonth,timeGridWeek'
    },
    // Configuración responsiva para pantallas pequeñas
    views: {
      dayGridMonth: {
        dayMaxEvents: 2,
        moreLinkClick: 'popover'
      },
      timeGridWeek: {
        dayHeaderFormat: { weekday: 'short' as const }
      },
      timeGridDay: {
        dayHeaderFormat: { weekday: 'long' as const, month: 'short' as const, day: 'numeric' as const }
      },
      listWeek: {
        dayHeaderFormat: { weekday: 'long' as const }
      }
    },
    // Configuración responsiva automática
    windowResizeDelay: 100,
    events: [] as CalendarEvent[],
    displayEventTime: false,
    eventContent: function(arg: any) {
      return { html: `<div class="fc-event-title">${arg.event.title}</div>` };
    },
    eventClassNames: 'solid-event', // Clase para eventos sólidos
    // Calendar callbacks
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this)
  };

  ngOnInit(): void {
    this.loadEvents();
    this.loadEmployees();
    
    // Añadir estilos para asegurar que los eventos tengan fondo sólido
    this.addCalendarStyles();
  }

  /**
   * Añade estilos CSS para asegurar eventos con fondo sólido
   */
  addCalendarStyles(): void {
    const style = document.createElement('style');
    style.innerHTML = `
      .solid-event {
        opacity: 1 !important;
        background-color: ${this.defaultEventColor} !important;
        border-color: ${this.defaultEventColor} !important;
      }
      .fc-event, .fc-event-draggable, .fc-event-resizable {
        background-color: ${this.defaultEventColor} !important;
        border-color: ${this.defaultEventColor} !important;
        opacity: 1 !important;
      }
      .fc-daygrid-event {
        background-color: ${this.defaultEventColor} !important;
        border-color: ${this.defaultEventColor} !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Ajusta las fechas de inicio y fin para eventos consecutivos
   * Si las fechas son consecutivas (ej: 1 al 2 de mayo), ajusta para mostrar en un solo cuadro
   */
  adjustConsecutiveDates(startDate: string, endDate: string): { startDate: string, endDate: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Verificar si las fechas son consecutivas (1 día de diferencia)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Si son fechas consecutivas, usar la misma fecha para mantener en un solo cuadro
      return {
        startDate,
        endDate: startDate
      };
    }
    
    return { startDate, endDate };
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
        this.showNotification('Error cargando eventos', 'error');
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
        this.showNotification('Error cargando empleados', 'error');
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
      
      // Ajustar fechas consecutivas para mostrar en un solo cuadro
      const adjustedDates = this.adjustConsecutiveDates(event.startDate, event.endDate);
      
      return {
        id: event.id!.toString(),
        title: event.title,
        start: adjustedDates.startDate,
        end: adjustedDates.endDate,
        backgroundColor: this.defaultEventColor,
        borderColor: this.defaultEventColor,
        description: event.description || '',
        eventType: event.eventType,
        participants: participants,
        className: 'solid-event' // Añadir clase para estilo sólido
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
      events.forEach(event => {
        calendarApi.addEvent({
          ...event,
          display: 'block' // Forzar visualización como bloque
        });
      });
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
        employees: this.employees()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Ajustar fechas para eventos consecutivos
        const adjustedDates = this.adjustConsecutiveDates(result.startDate, result.endDate);
        
        const dtoToSend: CalendarEventDTO = {
          title: result.title,
          description: result.description,
          startDate: result.startDate,
          endDate: result.endDate,
          eventType: result.eventType,
          employeeIds: result.participantIds || []
        };

        this.calendarService.createEvent(dtoToSend).subscribe({
          next: (response) => {
            // Refrescar todos los eventos para asegurar consistencia visual
            this.loadEvents();
            this.showNotification('Evento creado exitosamente', 'success');
          },
          error: (error) => {
            console.error('Error creating event:', error);
            this.showNotification('Error creando evento', 'error');
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
      next: (event: CalendarEventDTO) => {
        const dialogRef = this.dialog.open(EventDialogComponent, {
          width: '600px',
          data: {
            mode: 'edit',
            event: {
              ...event,
              color: this.defaultEventColor
            },
            employees: this.employees()
          }
        });

        dialogRef.afterClosed().subscribe(dialogResult => {
          if (!dialogResult) return;
          
          if (dialogResult === 'delete') {
            this.deleteEvent(eventId);
          } else {
            // Ajustar fechas para eventos consecutivos
            const adjustedDates = this.adjustConsecutiveDates(dialogResult.startDate, dialogResult.endDate);
            
            const dtoToSend: CalendarEventDTO = {
              title: dialogResult.title,
              description: dialogResult.description,
              startDate: dialogResult.startDate,
              endDate: dialogResult.endDate,
              eventType: dialogResult.eventType,
              employeeIds: dialogResult.participantIds || []
            };
            this.updateEvent(eventId, dtoToSend);
          }
        });
      },
      error: (error) => {
        console.error('Error loading event details:', error);
        this.showNotification('Error cargando detalles del evento', 'error');
      }
    });
  }

  /**
   * Updates an event
   */
  updateEvent(eventId: number, eventData: CalendarEventDTO): void {
    this.calendarService.updateEvent(eventId, eventData).subscribe({
      next: () => {
        this.loadEvents();
        this.showNotification('Evento actualizado exitosamente', 'success');
      },
      error: (error) => {
        console.error('Error updating event:', error);
        this.showNotification('Error actualizando evento', 'error');
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
        this.showNotification('Evento eliminado exitosamente', 'success');
      },
      error: (error) => {
        console.error('Error deleting event:', error);
        this.showNotification('Error eliminando evento', 'error');
      }
    });
  }

  /**
   * Handles event drag & drop
   */
  handleEventDrop(dropInfo: any): void {
    const eventId = parseInt(dropInfo.event.id, 10);
    
    this.calendarService.getEventById(eventId).subscribe({
      next: (originalEvent: CalendarEventDTO) => {
        // Calcular la duración original del evento
        const originalStart = new Date(originalEvent.startDate);
        const originalEnd = new Date(originalEvent.endDate);
        const duration = originalEnd.getTime() - originalStart.getTime();
        
        // Aplicar la misma duración al nuevo evento con la fecha de inicio actualizada
        const newStartDate = dropInfo.event.start.toISOString();
        const newEndDate = dropInfo.event.end ? 
          dropInfo.event.end.toISOString() : 
          new Date(dropInfo.event.start.getTime() + duration).toISOString();
        
        // Ajustar fechas para eventos consecutivos
        const adjustedDates = this.adjustConsecutiveDates(newStartDate, newEndDate);
        
        const updatedEventData: Partial<CalendarEventDTO> = {
          title: originalEvent.title,
          description: originalEvent.description,
          startDate: newStartDate,
          endDate: newEndDate,
          eventType: originalEvent.eventType,
          employeeIds: originalEvent.employeeIds,
        };
        
        this.calendarService.updateEvent(eventId, updatedEventData as CalendarEventDTO).subscribe({
          next: () => {
            this.loadEvents();
            this.showNotification('Evento actualizado exitosamente', 'success');
          },
          error: (error) => {
            dropInfo.revert();
            console.error('Error updating event:', error);
            this.showNotification('Error actualizando evento', 'error');
          }
        });
      },
      error: (error) => {
        dropInfo.revert();
        console.error('Error loading event details:', error);
        this.showNotification('Error cargando detalles del evento', 'error');
      }
    });
  }

  /**
   * Handles event resize
   */
  handleEventResize(resizeInfo: any): void {
    const eventId = parseInt(resizeInfo.event.id, 10);
    
    this.calendarService.getEventById(eventId).subscribe({
      next: (originalEvent: CalendarEventDTO) => {
        const newStartDate = resizeInfo.event.start.toISOString();
        const newEndDate = resizeInfo.event.end.toISOString();
        
        // Ajustar fechas para eventos consecutivos
        const adjustedDates = this.adjustConsecutiveDates(newStartDate, newEndDate);
        
        const updatedEventData: Partial<CalendarEventDTO> = {
          title: originalEvent.title,
          description: originalEvent.description,
          startDate: newStartDate,
          endDate: newEndDate,
          eventType: originalEvent.eventType,
          employeeIds: originalEvent.employeeIds,
        };
        
        this.calendarService.updateEvent(eventId, updatedEventData as CalendarEventDTO).subscribe({
          next: () => {
            this.loadEvents();
            this.showNotification('Evento actualizado exitosamente', 'success');
          },
          error: (error) => {
            resizeInfo.revert();
            console.error('Error updating event:', error);
            this.showNotification('Error actualizando evento', 'error');
          }
        });
      },
      error: (error) => {
        resizeInfo.revert();
        console.error('Error loading event details:', error);
        this.showNotification('Error cargando detalles del evento', 'error');
      }
    });
  }

  /**
   * Shows a notification snackbar
   */
  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['error-snackbar'] : ['success-snackbar']
    });
  }
}

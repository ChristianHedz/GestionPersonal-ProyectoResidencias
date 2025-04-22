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
import { EventService } from '../../service/event.service';
import { EmployeesService } from '../../service/employees.service';
import { Event, EventType, CalendarEvent } from '../../interfaces/event.interfaces';
import { EventDialogComponent } from './event-dialog/event-dialog.component';
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
    EventDialogComponent,
    ToolbarComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  // Services
  private readonly eventService = inject(EventService);
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
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
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
   * Maps backend events to FullCalendar event format
   */
  mapToCalendarEvents(events: Event[]): CalendarEvent[] {
    return events.map(event => ({
      id: event.id?.toString() || '',
      title: event.title,
      start: new Date(event.startDate).toISOString(),
      end: new Date(event.endDate).toISOString(),
      allDay: event.allDay,
      backgroundColor: event.color,
      borderColor: event.color,
      description: event.description,
      eventType: event.eventType,
      participants: event.participants
    }));
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
        allDay: selectInfo.allDay,
        employees: this.employees()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventService.createEvent(result).subscribe({
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
      // Clear date selection
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
    
    this.eventService.getEventById(eventId).subscribe({
      next: (event) => {
        const dialogRef = this.dialog.open(EventDialogComponent, {
          width: '600px',
          data: {
            mode: 'edit',
            event,
            employees: this.employees()
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (!result) return;
          
          if (result === 'delete') {
            this.deleteEvent(eventId);
          } else {
            this.updateEvent(eventId, result);
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
  updateEvent(eventId: number, eventData: any): void {
    // Ensure eventData matches EventRequest interface
    if (!eventData.participantIds && eventData.participants) {
      eventData = {
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        eventType: eventData.eventType,
        color: eventData.color,
        allDay: eventData.allDay,
        participantIds: eventData.participants.map((p: any) => p.id)
      };
    }
    
    this.eventService.updateEvent(eventId, eventData).subscribe({
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
    this.eventService.deleteEvent(eventId).subscribe({
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
    const startDate = dropInfo.event.start.toISOString();
    const endDate = dropInfo.event.end?.toISOString() || 
                   new Date(dropInfo.event.start.getTime() + 60 * 60 * 1000).toISOString();
    
    this.eventService.getEventById(eventId).subscribe({
      next: (event) => {
        // Transform to EventRequest format
        const eventRequest = {
          title: event.title,
          description: event.description,
          startDate,
          endDate,
          eventType: event.eventType,
          color: event.color,
          allDay: event.allDay,
          participantIds: event.participants.map(p => p.id)
        };
        
        this.eventService.updateEvent(eventId, eventRequest).subscribe({
          next: () => {
            this.loadEvents(); // Reload events to ensure UI is consistent
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
    const startDate = resizeInfo.event.start.toISOString();
    const endDate = resizeInfo.event.end.toISOString();
    
    this.eventService.getEventById(eventId).subscribe({
      next: (event) => {
        // Transform to EventRequest format
        const eventRequest = {
          title: event.title,
          description: event.description,
          startDate,
          endDate,
          eventType: event.eventType,
          color: event.color,
          allDay: event.allDay,
          participantIds: event.participants.map(p => p.id)
        };
        
        this.eventService.updateEvent(eventId, eventRequest).subscribe({
          next: () => {
            this.loadEvents(); // Reload events to ensure UI is consistent
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

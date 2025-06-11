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
import { CalendarService } from '../../../core/services/calendar.service';
import { AuthService } from '../../../auth/service/auth.service';
import { EmployeesService } from '../../../service/employees.service';
import { CalendarEventDTO } from '../../../core/models/calendar-event.dto';
import { EventType, CalendarEvent } from '../../../interfaces/event.interfaces';
import { EmployeeDTO } from '../../../auth/interfaces/EmployeeDTO';
import { EmployeeToolbarComponent } from '../../../shared/toolbar/employee-toolbar/employee-toolbar.component';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    EmployeeToolbarComponent
  ],
  templateUrl: './employee-calendar.component.html',
  styleUrl: './employee-calendar.component.css'
})
export class EmployeeCalendarComponent implements OnInit {
  // Services
  private readonly calendarService = inject(CalendarService);
  private readonly authService = inject(AuthService);
  private readonly employeesService = inject(EmployeesService);
  private readonly snackBar = inject(MatSnackBar);

  // Calendar API reference
  @ViewChild('calendar') calendarComponent: any;

  // Signals for reactive state management
  isLoading = signal(true);
  calendarEvents = signal<CalendarEvent[]>([]);
  currentEmployee = signal<EmployeeDTO | null>(null);
  employeeId = signal<number | null>(null);

  // Color específico para eventos del empleado
  defaultEventColor = '#2e7d32';

  // Calendar configuration
  calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    editable: false,
    selectable: false,
    selectMirror: false,
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
    eventClassNames: 'employee-event',
    eventClick: this.handleEventClick.bind(this)
  };

  ngOnInit(): void {
    this.initializeEmployeeData();
    this.addCalendarStyles();
  }

  /**
   * Inicializa los datos del empleado autenticado
   */
  initializeEmployeeData(): void {
    console.log('Iniciando obtención de datos del empleado...');
    console.log('Estado de autenticación:', this.authService.authStatus());
    
    // Verificamos el estado de autenticación y obtenemos el usuario
    this.authService.isLogged().subscribe({
      next: (isAuthenticated) => {
        console.log('¿Usuario autenticado?:', isAuthenticated);
        
        if (!isAuthenticated) {
          console.error('Usuario no autenticado');
          this.showNotification('Usuario no autenticado', 'error');
          this.isLoading.set(false);
          return;
        }

        // Ahora que sabemos que está autenticado, obtenemos el usuario
        const authUser = this.authService.currentUser();
        console.log('Usuario autenticado obtenido:', authUser);
        
        if (!authUser) {
          console.error('No se pudo obtener el usuario autenticado');
          this.showNotification('Error obteniendo datos del usuario', 'error');
          this.isLoading.set(false);
          return;
        }

        if (!authUser.id) {
          console.error('El usuario autenticado no tiene ID:', authUser);
          this.showNotification('El usuario no tiene un ID válido', 'error');
          this.isLoading.set(false);
          return;
        }

        console.log('ID del usuario autenticado:', authUser.id);
        this.employeeId.set(authUser.id);

        // Ahora obtenemos la lista completa de empleados para encontrar el empleado actual
        this.employeesService.listAllEmployees().subscribe({
          next: (employees: EmployeeDTO[]) => {
            console.log('Lista de empleados obtenida:', employees);
            
            // Buscar el empleado que coincida con el ID del usuario autenticado
            const currentEmployee = employees.find(emp => emp.id === authUser.id);
            
            if (currentEmployee) {
              console.log('Empleado encontrado:', currentEmployee);
              this.currentEmployee.set(currentEmployee);
              this.loadEmployeeEvents();
            } else {
              console.error('No se encontró el empleado con ID:', authUser.id);
              // Si no encontramos el empleado en la lista, creamos uno básico con los datos del auth
              const basicEmployee: EmployeeDTO = {
                id: authUser.id,
                fullName: authUser.fullName,
                email: authUser.email,
                phone: '',
                photo: '',
                status: 'ACTIVE'
              };
              console.log('Usando datos básicos del usuario:', basicEmployee);
              this.currentEmployee.set(basicEmployee);
              this.loadEmployeeEvents();
            }
          },
          error: (error) => {
            console.error('Error obteniendo lista de empleados:', error);
            
            // Si falla la obtención de empleados, creamos uno básico con los datos del auth
            const basicEmployee: EmployeeDTO = {
              id: authUser.id,
              fullName: authUser.fullName,
              email: authUser.email,
              phone: '',
              photo: '',
              status: 'ACTIVE'
            };
            console.log('Error en empleados, usando datos básicos:', basicEmployee);
            this.currentEmployee.set(basicEmployee);
            this.showNotification('Usando información básica del usuario', 'info');
            this.loadEmployeeEvents();
          }
        });
      },
      error: (error) => {
        console.error('Error verificando autenticación:', error);
        this.showNotification('Error verificando autenticación', 'error');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Añade estilos CSS específicos para los eventos del empleado
   */
  addCalendarStyles(): void {
    const style = document.createElement('style');
    style.innerHTML = `
      .employee-event {
        opacity: 1 !important;
        background-color: ${this.defaultEventColor} !important;
        border-color: ${this.defaultEventColor} !important;
        border: none !important;
        border-radius: 4px !important;
        padding: 2px 4px !important;
      }
      .fc-event.employee-event, .fc-event-draggable.employee-event, .fc-event-resizable.employee-event {
        background-color: ${this.defaultEventColor} !important;
        border-color: ${this.defaultEventColor} !important;
        opacity: 1 !important;
        cursor: pointer !important;
        border: none !important;
        border-radius: 4px !important;
        padding: 2px 4px !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Carga los eventos específicos del empleado autenticado
   */
  loadEmployeeEvents(): void {
    const empId = this.employeeId();
    console.log('Cargando eventos para empleado ID:', empId);
    
    if (!empId) {
      console.error('No hay ID de empleado disponible');
      this.showNotification('ID de empleado no disponible', 'error');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    console.log('Llamando al servicio para obtener eventos del empleado...');
    
    this.calendarService.getEventsByEmployeeId(empId).subscribe({
      next: (events: CalendarEventDTO[]) => {
        console.log('Eventos obtenidos del backend:', events);
        const calendarEvents = this.mapToCalendarEvents(events);
        console.log('Eventos mapeados para el calendario:', calendarEvents);
        this.calendarEvents.set(calendarEvents);
        this.updateCalendarEvents(calendarEvents);
        this.isLoading.set(false);
        
        if (events.length === 0) {
          console.log('No se encontraron eventos para este empleado');
          this.showNotification('No tienes eventos asignados actualmente', 'info');
        } else {
          console.log(`Se cargaron ${events.length} eventos`);
          this.showNotification(`Se cargaron ${events.length} eventos`, 'success');
        }
      },
      error: (error) => {
        console.error('Error loading employee events:', error);
        this.showNotification('Error cargando eventos del empleado', 'error');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Mapea los eventos del backend al formato de FullCalendar
   */
  mapToCalendarEvents(events: CalendarEventDTO[]): CalendarEvent[] {
    const currentEmp = this.currentEmployee();
    
    return events.map(event => {
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
        participants: currentEmp ? [currentEmp] : [],
        className: 'employee-event'
      };
    });
  }

  /**
   * Ajusta las fechas de inicio y fin para eventos consecutivos
   */
  adjustConsecutiveDates(startDate: string, endDate: string): { startDate: string, endDate: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return {
        startDate,
        endDate: startDate
      };
    }
    
    return { startDate, endDate };
  }

  /**
   * Actualiza el calendario con los nuevos eventos
   */
  updateCalendarEvents(events: CalendarEvent[]): void {
    const calendarApi = this.calendarComponent?.getApi();
    if (calendarApi) {
      calendarApi.removeAllEvents();
      events.forEach(event => {
        calendarApi.addEvent({
          ...event,
          display: 'block'
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
   * Maneja el clic en un evento
   */
  handleEventClick(clickInfo: any): void {
    const event = clickInfo.event;
    const eventData = this.calendarEvents().find(e => e.id === event.id);
    
    if (eventData) {
      this.showEventDetails(eventData);
    }
  }

  /**
   * Muestra los detalles del evento
   */
  showEventDetails(event: CalendarEvent): void {
    const startDate = new Date(event.start).toLocaleDateString('es-ES');
    const endDate = new Date(event.end).toLocaleDateString('es-ES');
    const dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
    
    const message = `
      ${event.title}
      Fecha: ${dateRange}
      Tipo: ${this.getEventTypeLabel(event.eventType)}
      ${event.description ? `Descripción: ${event.description}` : ''}
    `;
    
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }

  /**
   * Obtiene la etiqueta legible del tipo de evento
   */
  getEventTypeLabel(eventType: EventType): string {
    const labels: Record<string, string> = {
      'OTHER': 'Reunión',
      'VACATION': 'Vacaciones',
      'REMINDER': 'Capacitación',
      'MEETING': 'Otro'
    };
    return labels[eventType.toString()] || eventType.toString();
  }

  /**
   * Recarga los eventos del empleado
   */
  refreshEvents(): void {
    console.log('Refrescando eventos...');
    this.loadEmployeeEvents();
  }

  /**
   * Muestra una notificación
   */
  showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['error-snackbar'] : 
                  type === 'success' ? ['success-snackbar'] : ['info-snackbar']
    });
  }
}

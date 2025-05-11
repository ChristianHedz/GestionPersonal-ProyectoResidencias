import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { EmployeeAttendanceService } from '../../service/attendance.service';
import { EmployeesService } from '../../service/employees.service';
import { AssistDetailsDTO } from '../../interfaces/assist-details.interface';
import { EmployeeDTO } from '../../auth/interfaces/EmployeeDTO';
import { ToolbarComponent } from '../../shared/toolbar/toolbar.component';
import { AttendanceFilterParams, AttendanceIncidents } from '../../interfaces/attendance-filter.interface';
import { ApiError } from '../../auth/interfaces/apiError';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { ChatbotBubbleComponent } from '../../components/chatbot-bubble/chatbot-bubble.component';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    ToolbarComponent,
    ChatbotBubbleComponent
  ],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  
  private readonly attendanceService = inject(EmployeeAttendanceService);
  private readonly employeesService = inject(EmployeesService);
  private readonly fb = inject(FormBuilder);

  // Señales para el estado del componente
  private readonly _attendanceData = signal<AssistDetailsDTO[]>([]);
  private readonly _employees = signal<EmployeeDTO[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<ApiError | null>(null);
  private readonly _currentPage = signal<number>(0);
  private readonly _pageSize = signal<number>(10);

  // Señales computadas públicas
  readonly attendanceData = this._attendanceData.asReadonly();
  readonly employees = this._employees.asReadonly();
  readonly loading = computed(() => this._loading() || this.attendanceService.loading());
  readonly error = this._error.asReadonly();
  
  // Señales computadas para paginación
  readonly currentPage = this._currentPage.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly totalItems = computed(() => this.attendanceService.totalElements());

  // Configuración de columnas para la tabla
  readonly displayedColumns: string[] = [
    'id', 'date', 'employeeName', 'entryTime', 'exitTime', 'workedHours', 'incidents', 'reason'
  ];

  // Opciones para tipos de asistencia
  readonly attendanceIncidents = [
    { value: 'all', label: 'Todos' },
    { value: 'ASISTENCIA', label: 'Asistencias' },
    { value: 'FALTA', label: 'Faltas' },
    { value: 'RETARDO', label: 'Retardos' }
  ];

  
  filterForm = this.fb.group({
    attendanceIncidents: this.fb.nonNullable.control<AttendanceIncidents>('all'),
    employeeFilter: this.fb.nonNullable.control<string>('all'),
    startDate: this.fb.control<Date | null>(null),
    endDate: this.fb.control<Date | null>(null)
  });

  /**
   * Hook del ciclo de vida - inicialización del componente
   */
  ngOnInit(): void {
    this.loadEmployees();
    this.loadAttendance();
  }

  /**
   * Maneja eventos de cambio de página del paginador
   * @param event Evento de página con índice y tamaño
   */
  onPageChange(event: PageEvent): void {
    this._currentPage.set(event.pageIndex);
    this._pageSize.set(event.pageSize);
    // Recargar datos con los nuevos parámetros de paginación
    this.applyFilters(event.pageIndex, event.pageSize);
  }

  applyFilters(page: number = 0, size: number = this._pageSize()): void {
    const filters = this.buildFilterParams(page, size);
    console.log('Applying filters:', filters);
    this.loadAttendance(filters);
  }

  private buildFilterParams(page: number, size: number): AttendanceFilterParams {
    const { employeeFilter, startDate, endDate, attendanceIncidents } = this.filterForm.value;

    return {
      page,
      size,
      attendanceIncidents: attendanceIncidents!,
      employeeId: employeeFilter !== 'all' ? Number(employeeFilter) : undefined,
      startDate: startDate ? this.formatDate(startDate) : undefined,
      endDate: endDate ? this.formatDate(endDate) : undefined,
      sortBy: 'date',
      sortOrder: 'desc'
    };
  }

  /**
   * Reinicia todos los filtros y carga asistencias recientes
   */
  resetFilters(): void {
    this.filterForm.reset({
      employeeFilter: 'all',
      attendanceIncidents: 'all',
      startDate: null,
      endDate: null
    });
    
    this.loadAttendance({
      sortBy: 'date',
      sortOrder: 'desc'
    });
  }

  /**
   * Carga la lista de empleados para el filtrado
   */
  private loadEmployees(): void {
    this.employeesService.listAllEmployees()
      .subscribe({
        next: (employees: EmployeeDTO[]) => this._employees.set(employees),
        error: (error: ApiError) => this._error.set(error)
      });
  }

  /**
   * Carga los registros de asistencia aplicando los filtros especificados
   * @param filters Filtros a aplicar
   */
  private loadAttendance(filters: AttendanceFilterParams = { sortBy: 'date', sortOrder: 'desc' }): void {
    this._loading.set(true);
    this.attendanceService.getAttendance(filters)
      .subscribe({
        next: (data: AssistDetailsDTO[]) => {
          this._attendanceData.set(data);
        },
        error: (error: ApiError) => this.handleError(error),
        complete: () => this._loading.set(false)
      });
  }

  /**
   * Manejo centralizado de errores
   * @param err Error recibido
   */
  private handleError(error: ApiError): void {
    this._error.set(error);
    this._loading.set(false);
  }

  /**
   * Formatea un objeto Date a cadena YYYY-MM-DD
   * @param date Objeto Date
   * @returns Cadena de fecha formateada
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Exporta los datos de asistencia a Excel utilizando los filtros actuales
   * Implementa un enfoque declarativo y reactivo para manejar la solicitud
   */
  exportToExcel(): void {
    // Construir parámetros de solicitud
    const filters = this.buildExcelExportParams();
    // Generar nombre de archivo con la fecha actual
    const filename = `asistencias_${this.formatDate(new Date())}.xlsx`;
    
    // Flujo reactivo para gestionar la exportación
    this.attendanceService.exportToExcel(filters).pipe(
      finalize(() => this._loading.set(false))
    ).subscribe({
      next: (blob: Blob) => this.downloadExcelFile(blob, filename),
      error: (error: ApiError) => this.handleError(error)
    });
  }

  /**
   * Construye los parámetros para la exportación a Excel
   * @returns Parámetros de filtrado sin paginación
   */
  private buildExcelExportParams(): AttendanceFilterParams {
    // Obtener filtros actuales sin paginación
    return {
      ...this.buildFilterParams(this._currentPage(), this._pageSize()),
      page: undefined,
      size: undefined
    };
  }
  
  /**
   * Gestiona la descarga de un archivo de Excel de manera segura
   * @param blob Contenido del archivo como Blob
   * @param filename Nombre del archivo para la descarga
   */
  private downloadExcelFile(blob: Blob, filename: string): void {
    try {
      // Preparar el blob con el tipo MIME correcto
      const excelBlob = new Blob([blob], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      // Crear URL y descargar
      const blobUrl = URL.createObjectURL(excelBlob);
      this.triggerBrowserDownload(blobUrl, filename);
    } catch (error) {
      Swal.fire('Error al descargar el archivo Excel', error instanceof Error ? error.message : 'Error desconocido', 'error');
    }
  }
  
  /**
   * Desencadena la descarga del archivo en el navegador
   * @param blobUrl URL del blob
   * @param filename Nombre del archivo
   */
  private triggerBrowserDownload(blobUrl: string, filename: string): void {
    // Crear un elemento <a> temporal para la descarga
    const downloadLink = document.createElement('a');
    downloadLink.style.display = 'none';
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    
    // Configurar limpieza automática
    downloadLink.addEventListener('click', () => {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 150);
    }, { once: true });
    
    // Ejecutar descarga
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}

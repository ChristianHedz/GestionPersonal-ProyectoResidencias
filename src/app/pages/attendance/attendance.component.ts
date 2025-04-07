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
import { AttendanceFilterParams, AttendanceType } from '../../interfaces/attendance-filter.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../auth/interfaces/apiError';

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
    ToolbarComponent
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
    'id', 'date', 'employeeName', 'entryTime', 'exitTime', 'workedHours', 'incidents', 'actions'
  ];

  // Opciones para tipos de asistencia
  readonly attendanceTypes = [
    { value: 'all', label: 'Todos' },
    { value: 'attendance', label: 'Asistencias' },
    { value: 'absences', label: 'Faltas' },
    { value: 'delays', label: 'Retardos' }
  ];

  filterForm = this.fb.group({
    attendanceType: this.fb.nonNullable.control<AttendanceType>('all'),
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
    this.loadAttendance(filters);
  }

  private buildFilterParams(page: number, size: number): AttendanceFilterParams {
    const { employeeFilter, startDate, endDate, attendanceType } = this.filterForm.value;

    return {
      page,
      size,
      attendanceType: attendanceType!,
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
      attendanceType: 'all',
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
}

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

/**
 * Componente para visualizar y filtrar registros de asistencia de empleados
 */
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
  private readonly destroyRef = inject(DestroyRef);

  // Señales para el estado del componente
  private readonly _attendanceData = signal<AssistDetailsDTO[]>([]);
  private readonly _employees = signal<EmployeeDTO[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
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
  readonly displayedColumns: string[] = ['id', 'date', 'employeeName', 'entryTime', 'exitTime', 'workedHours', 'incidents', 'actions'];

  // Formulario de filtros
  filterForm = new FormGroup({
    employeeId: new FormControl<number | null>(null, [Validators.nullValidator]),
    date: new FormControl<Date | null>(null, [Validators.nullValidator]),
    filterType: new FormControl<string>('recent', [Validators.required])
  });

  /**
   * Hook del ciclo de vida - inicialización del componente
   */
  ngOnInit(): void {
    this.loadEmployees();
    this.loadRecentAttendance();
    
    // Suscripción a cambios en el formulario de filtros
    this.filterForm.get('filterType')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(filterType => {
        if (filterType === 'recent') {
          this.loadRecentAttendance();
        } else if (filterType === 'all') {
          this.loadAllAttendance();
        }
      });
  }

  /**
   * Maneja eventos de cambio de página del paginador
   * @param event Evento de página con índice y tamaño
   */
  onPageChange(event: PageEvent): void {
    this._currentPage.set(event.pageIndex);
    this._pageSize.set(event.pageSize);
    
    // Recargar datos con la nueva paginación
    this.reloadCurrentData(event.pageIndex, event.pageSize);
  }

  /**
   * Recarga los datos actuales con parámetros de paginación
   */
  private reloadCurrentData(page: number, size: number): void {
    const { employeeId, date, filterType } = this.filterForm.value;
    
    if (employeeId) {
      this.filterByEmployee(employeeId, page, size);
    } else if (date) {
      this.filterByDate(this.formatDate(date), page, size);
    } else if (filterType === 'recent') {
      this.loadRecentAttendance(size);
    } else {
      this.loadAllAttendance(page, size);
    }
  }

  /**
   * Aplica filtros basados en los valores actuales del formulario
   */
  applyFilters(): void {
    const { employeeId, date, filterType } = this.filterForm.value;
    const page = 0; // Reiniciar a primera página
    const size = this._pageSize();
    
    if (employeeId) {
      this.filterByEmployee(employeeId, page, size);
    } else if (date) {
      this.filterByDate(this.formatDate(date), page, size);
    } else if (filterType === 'recent') {
      this.loadRecentAttendance(size);
    } else {
      this.loadAllAttendance(page, size);
    }
  }

  /**
   * Reinicia todos los filtros y carga asistencias recientes
   */
  resetFilters(): void {
    this.filterForm.reset({
      employeeId: null,
      date: null,
      filterType: 'recent'
    });
    this.loadRecentAttendance();
  }

  /**
   * Carga la lista de empleados para el filtrado
   */
  private loadEmployees(): void {
    this.employeesService.listAllEmployees()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (employees: EmployeeDTO[]) => this._employees.set(employees),
        error: (err: any) => this._error.set(err)
      });
  }

  /**
   * Carga todos los registros de asistencia
   */
  private loadAllAttendance(page: number = 0, size: number = 20): void {
    this._loading.set(true);
    this.attendanceService.getAllAttendance(page, size)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: AssistDetailsDTO[]) => {
          this._attendanceData.set(data);
          this._error.set(null);
        },
        error: (err: any) => {
          this._error.set(err);
          this._loading.set(false);
        },
        complete: () => this._loading.set(false)
      });
  }

  /**
   * Carga los registros de asistencia más recientes
   */
  private loadRecentAttendance(size: number = 20): void {
    this._loading.set(true);
    this.attendanceService.getRecentAttendance(size)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: AssistDetailsDTO[]) => {
          this._attendanceData.set(data);
          this._error.set(null);
        },
        error: (err: any) => {
          this._error.set(err);
          this._loading.set(false);
        },
        complete: () => this._loading.set(false)
      });
  }

  /**
   * Filtra asistencias por ID de empleado
   * @param employeeId ID del empleado
   */
  private filterByEmployee(employeeId: number, page: number = 0, size: number = 20): void {
    this._loading.set(true);
    this.attendanceService.getAttendanceByEmployee(employeeId, page, size)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: AssistDetailsDTO[]) => {
          this._attendanceData.set(data);
          this._error.set(null);
        },
        error: (err: any) => {
          this._error.set(err);
          this._loading.set(false);
        },
        complete: () => this._loading.set(false)
      });
  }

  /**
   * Filtra asistencias por fecha
   * @param date Cadena de fecha en formato YYYY-MM-DD
   */
  private filterByDate(date: string, page: number = 0, size: number = 20): void {
    this._loading.set(true);
    this.attendanceService.getAttendanceByDate(date, page, size)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: AssistDetailsDTO[]) => {
          this._attendanceData.set(data);
          this._error.set(null);
        },
        error: (err: any) => {
          this._error.set(err);
          this._loading.set(false);
        },
        complete: () => this._loading.set(false)
      });
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

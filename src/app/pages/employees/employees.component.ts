import { Component, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmployeesService } from '../../service/employees.service';
import { EmployeeDTO } from '../../auth/interfaces/EmployeeDTO';
import { ToolbarComponent } from '../../shared/toolbar/toolbar.component';
import { EmployeeEditDialogComponent } from './employee-edit-dialog/employee-edit-dialog.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ToolbarComponent
  ],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  employees: EmployeeDTO[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private employeesService: EmployeesService,
    private dialog: MatDialog,
    private destroyRef: DestroyRef
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeesService.listAllEmployees()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.employees = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar los empleados';
          this.loading = false;
          console.error('Error fetching employees:', err);
        }
      });
  }

  /**
   * Opens the edit dialog for the selected employee
   * @param employee The employee to edit
   * @param event The click event
   */
  openEditDialog(employee: EmployeeDTO, event: Event): void {
    event.stopPropagation(); // Prevent event bubbling
    
    // Configuración responsiva del diálogo
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = window.innerWidth < 768 ? '95%' : '500px';
    dialogConfig.maxWidth = '95vw';
    dialogConfig.disableClose = true; // Evita cerrar al hacer clic fuera
    dialogConfig.autoFocus = true;
    dialogConfig.data = { employee };
    dialogConfig.panelClass = ['blurs-dialog', 'blurs']; // Multiple classes for better targeting
    dialogConfig.backdropClass = 'dialog-backdrop'; // Custom backdrop class
    
    const dialogRef = this.dialog.open(EmployeeEditDialogComponent, dialogConfig);

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result) {
          // Update the local employee data if edit was successful
          const index = this.employees.findIndex(emp => emp.id === result.id);
          if (index !== -1) {
            this.employees[index] = result;
            this.employees = [...this.employees]; // Trigger change detection
          }
        }
      });
  }
}
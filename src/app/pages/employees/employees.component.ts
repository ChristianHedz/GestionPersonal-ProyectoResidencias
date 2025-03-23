import { EmployeesService } from './../../service/employees.service';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmployeeDTO } from '../../auth/interfaces/EmployeeDTO';
import { ToolbarComponent } from '../../shared/toolbar/toolbar.component';
import { EmployeeEditDialogComponent } from './employee-edit-dialog/employee-edit-dialog.component';
import { ActivatedRoute } from '@angular/router';

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
  private employeesService = inject(EmployeesService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  employees: EmployeeDTO[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.employees = this.route.snapshot.data['employees'];
  }

  openEditDialog(employee: EmployeeDTO, event: Event): void {
    event.stopPropagation();
    
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
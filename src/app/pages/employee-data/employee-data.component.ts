import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeDTO } from '../../auth/interfaces/EmployeeDTO';
import { AuthService } from '../../auth/service/auth.service';
import { EmployeesService } from '../../service/employees.service';
import { EmployeeToolbarComponent } from '../../shared/toolbar/employee-toolbar/employee-toolbar.component';

@Component({
  selector: 'app-employee-data',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    EmployeeToolbarComponent
  ],
  templateUrl: './employee-data.component.html',
  styleUrl: './employee-data.component.css'
})
export class EmployeeDataComponent implements OnInit {
  
  private readonly employeesService = inject(EmployeesService);
  private readonly authService = inject(AuthService);

  public employeeData: EmployeeDTO | null = null;
  public errorMessage: string | null = null;

  ngOnInit(): void {
    const userId = this.authService.currentUser()?.id;

    if (!userId) {
      this.errorMessage = 'No se pudo obtener el ID del usuario.';
      return;
    }

    this.employeesService.getEmployeeById(userId).subscribe({
      next: (data) => {
        this.employeeData = data;
      },
      error: (err) => {
        this.errorMessage = 'Error al obtener los datos del empleado.';
        console.error(err);
      }
    });
  }

  public getInitials(name: string): string {
    if (!name) {
      return '';
    }
    return name.split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}

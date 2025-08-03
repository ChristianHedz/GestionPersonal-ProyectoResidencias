import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeToolbarComponent } from '../../../../shared/components/toolbar/employee-toolbar/employee-toolbar.component';
import { PhotoUploadComponent } from '../../../../shared/components/photo-upload/photo-upload.component';
import { AuthService } from '../../../../core/services/auth.service';
import { EmployeesService } from '../../../../core/services/employees.service';
import { EmployeeDTO } from '../../../../core/models/auth/EmployeeDTO';

@Component({
  selector: 'app-employee-profile',
  imports: [
    CommonModule, 
    MatIcon, 
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    EmployeeToolbarComponent,
    PhotoUploadComponent
  ],
  templateUrl: './employee-profile.component.html',
  styleUrl: './employee-profile.component.css'
})
export class EmployeeProfileComponent implements OnInit {
  private authService: AuthService = inject(AuthService);
  private employeesService: EmployeesService = inject(EmployeesService);

  currentEmployee: EmployeeDTO | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.loadCurrentEmployee();
  }

  loadCurrentEmployee(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser?.id) {
      this.isLoading = true;
      this.employeesService.getEmployeeById(currentUser.id).subscribe({
        next: (employee: EmployeeDTO) => {
          this.currentEmployee = employee;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading employee:', error);
          this.isLoading = false;
        }
      });
    }
  }

  onPhotoUpdated(newPhotoUrl: string | null): void {
    if (this.currentEmployee) {
      this.currentEmployee.photo = newPhotoUrl || '';
      // Actualizar también el usuario en el auth service si es necesario
      this.loadCurrentEmployee();
    }
  }
}

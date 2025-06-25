import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeToolbarComponent } from '../../shared/toolbar/employee-toolbar/employee-toolbar.component';
import { PhotoUploadComponent } from '../../components/photo-upload/photo-upload.component';
import { AuthService } from '../../auth/service/auth.service';
import { EmployeesService } from '../../service/employees.service';
import { EmployeeDTO } from '../../auth/interfaces/EmployeeDTO';

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
  private authService = inject(AuthService);
  private employeesService = inject(EmployeesService);

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
        next: (employee) => {
          this.currentEmployee = employee;
          this.isLoading = false;
        },
        error: (error) => {
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

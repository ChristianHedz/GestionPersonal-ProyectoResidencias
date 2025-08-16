import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeDTO } from '../../../../core/models/auth/EmployeeDTO';
import { EmployeesService } from '../../../../core/services/employees.service';

@Component({
  selector: 'app-employee-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './employee-edit-dialog.component.html',
  styleUrl: './employee-edit-dialog.component.css'
})
export class EmployeeEditDialogComponent {
  private fb = inject(FormBuilder);
  private employeesService = inject(EmployeesService);
  private snackBar = inject(MatSnackBar);

  editForm: FormGroup;
  isLoading = false;

  constructor(
    public dialogRef: MatDialogRef<EmployeeEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee: EmployeeDTO }
  ) {
    this.editForm = this.fb.group({
      fullName: [data.employee.fullName, [Validators.required, Validators.minLength(2)]],
      email: [data.employee.email, [Validators.required, Validators.email]],
      phone: [data.employee.phone, [Validators.pattern(/^[0-9+\-\s()]+$/)]]
    });
  }

  onSave(): void {
    if (this.editForm.valid) {
      this.isLoading = true;
      
      const updatedEmployee: EmployeeDTO = {
        ...this.data.employee,
        ...this.editForm.value
      };

      this.employeesService.updateEmployee(this.data.employee.id, updatedEmployee).subscribe({
        next: (employee: EmployeeDTO) => {
          this.isLoading = false;
          this.snackBar.open('Información actualizada correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(employee);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error updating employee:', error);
          this.snackBar.open('Error al actualizar la información', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.editForm.get(fieldName);
    if (control?.hasError('required')) {
      return `El campo ${fieldName} es requerido`;
    }
    if (control?.hasError('email')) {
      return 'Ingrese un email válido';
    }
    if (control?.hasError('minlength')) {
      return `El nombre debe tener al menos 2 caracteres`;
    }
    if (control?.hasError('pattern')) {
      return 'Ingrese un número de teléfono válido';
    }
    return '';
  }
}

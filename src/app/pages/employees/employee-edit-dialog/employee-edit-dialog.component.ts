import { ValidatorsService } from './../../../auth/service/validators.service';
import { Component,inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { EmployeeDTO } from '../../../auth/interfaces/EmployeeDTO';
import { EmployeesService } from '../../../service/employees.service';
import { PhotoUploadComponent } from '../../../components/photo-upload/photo-upload.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTabsModule,
    PhotoUploadComponent
  ],
  templateUrl: './employee-edit-dialog.component.html',
  styleUrls: ['./employee-edit-dialog.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EmployeeEditDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EmployeeEditDialogComponent>);
  private readonly employeesService = inject(EmployeesService);
  private readonly validatorsService = inject(ValidatorsService);
  public  readonly data = inject(MAT_DIALOG_DATA) as { employee: EmployeeDTO };
  statusOptions = ['ACTIVO', 'BAJA', 'VACACIONES', 'INACTIVO'];
  submitting = false;
  error: string | null = null;
  currentPhotoUrl: string | null = null;

  readonly employeeForm = this.fb.group({
    fullName: ['', [Validators.required,Validators.pattern(this.validatorsService.firstNameAndLastnamePattern)]],
    email: ['', [Validators.required, Validators.pattern(this.validatorsService.emailPattern)]],
    phone: ['',[Validators.pattern(this.validatorsService.phonePattern)]],
    photo: [''],
    status: ['ACTIVO', [Validators.required]]
  });
  
  ngOnInit(): void {
    // Initialize form with employee data
    if (this.data && this.data.employee) {
      this.currentPhotoUrl = this.data.employee.photo || null;
      this.employeeForm.patchValue({
        fullName: this.data.employee.fullName,
        email: this.data.employee.email,
        phone: this.data.employee.phone || '',
        photo: this.data.employee.photo || '',
        status: this.data.employee.status
      });
    }
  }

  onPhotoUpdated(newPhotoUrl: string | null): void {
    this.currentPhotoUrl = newPhotoUrl;
    this.employeeForm.patchValue({ photo: newPhotoUrl || '' });
  }

  onPhotoUrlInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input?.value || null;
    this.onPhotoUpdated(value);
  }

  saveChanges(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const updatedEmployee: EmployeeDTO = {
      ...this.data.employee,
      fullName: this.employeeForm.get('fullName')?.value || '',
      email: this.employeeForm.get('email')?.value || '',
      phone: this.employeeForm.get('phone')?.value || '',
      photo: this.currentPhotoUrl || '',
      status: this.employeeForm.get('status')?.value || 'ACTIVO'
    };

    this.employeesService.updateEmployee(this.data.employee.id, updatedEmployee)
      .subscribe({
        next: (response) => {
          this.submitting = false;
          this.dialogRef.close(response);
          Swal.fire('¡Empleado actualizado!', 'El empleado se ha actualizado correctamente', 'success');
        },
        error: (err) => {
          this.submitting = false;
          Swal.fire('Error!', 'No se pudo actualizar el empleado', 'error');
          console.error('Error updating employee:', err);
        }
      });
  }

  getFieldError(field: string): string | null {
    const control = this.employeeForm.get(field);
    
    if (!control || !control.errors || !control.touched) return null;
    
    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['pattern']) {
      if (field === 'email') return 'Ingresa un correo electrónico válido';
      if (field === 'phone') return 'Ingresa un número de teléfono válido';
      if (field === 'fullName') return 'El nombre debe contener al menos un apellido';
      return 'El formato ingresado no es válido';
    }
    return 'Campo inválido';
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

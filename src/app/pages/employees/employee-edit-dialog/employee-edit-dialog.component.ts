import { ValidatorsService } from './../../../auth/service/validators.service';
import { Component, DestroyRef, inject, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EmployeeDTO } from '../../../auth/interfaces/EmployeeDTO';
import { EmployeesService } from '../../../service/employees.service';
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
    MatIconModule
  ],
  templateUrl: './employee-edit-dialog.component.html',
  styleUrls: ['./employee-edit-dialog.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EmployeeEditDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EmployeeEditDialogComponent>);
  private readonly employeesService = inject(EmployeesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly validatorsService = inject(ValidatorsService);
  public  readonly data = inject(MAT_DIALOG_DATA) as { employee: EmployeeDTO };
  statusOptions = ['ACTIVO', 'Remoto', 'Vacaciones', 'Proyecto Especial'];
  submitting = false;
  error: string | null = null;

  readonly employeeForm = this.fb.group({
    fullName: ['', [Validators.required,Validators.pattern(this.validatorsService.firstNameAndLastnamePattern)]],
    email: ['', [Validators.required, Validators.pattern(this.validatorsService.emailPattern)]],
    phone: ['',[Validators.pattern(this.validatorsService.phonePattern)]],
    photo: [''],
    status: ['ACTIVO', [Validators.required]]
  });
  

  ngOnInit(): void {
    // Debug para ver la estructura del diálogo
    console.log('Dialog container:', document.querySelector('.mat-mdc-dialog-container'));
    console.log('Dialog surface:', document.querySelector('.mdc-dialog__surface'));
    
    // Initialize form with employee data
    if (this.data && this.data.employee) {
      this.employeeForm.patchValue({
        fullName: this.data.employee.fullName,
        email: this.data.employee.email,
        phone: this.data.employee.phone || '',
        photo: this.data.employee.photo || '',
        status: this.data.employee.status
      });
    }
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
      photo: this.employeeForm.get('photo')?.value || '',
      status: this.employeeForm.get('status')?.value || 'ACTIVO'
    };

    this.employeesService.updateEmployee(this.data.employee.id, updatedEmployee)
      .pipe(takeUntilDestroyed(this.destroyRef))
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

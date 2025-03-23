import { Component, DestroyRef, Inject, OnInit, ViewEncapsulation } from '@angular/core';
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
  employeeForm: FormGroup;
  statusOptions = ['Activo', 'Remoto', 'Vacaciones', 'Proyecto Especial'];
  submitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EmployeeEditDialogComponent>,
    private employeesService: EmployeesService,
    private destroyRef: DestroyRef,
    @Inject(MAT_DIALOG_DATA) public data: { employee: EmployeeDTO }
  ) {
    this.employeeForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      photo: [''],
      status: ['Activo', [Validators.required]]
    });
  }

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

  /**
   * Saves the updated employee data
   */
  saveChanges(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const updatedEmployee = {
      ...this.data.employee,
      ...this.employeeForm.value
    };

    this.employeesService.updateEmployee(this.data.employee.id, updatedEmployee)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.submitting = false;
          this.dialogRef.close(response);
        },
        error: (err) => {
          this.submitting = false;
          this.error = 'Error al actualizar el empleado';
          console.error('Error updating employee:', err);
        }
      });
  }

  /**
   * Closes the dialog without saving changes
   */
  cancel(): void {
    this.dialogRef.close();
  }
}

import { Component, computed, inject } from '@angular/core';
import { MatDialogRef, MatDialogContent, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ValidatorsService } from '../../../core/services/validators.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-late-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    CommonModule
  ],
  templateUrl: './late-dialog.component.html',
})
export class LateDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<LateDialogComponent>);
  private readonly fb = inject(FormBuilder);
  validatorsService = inject(ValidatorsService);

  protected readonly lateForm: FormGroup = this.fb.group({
    reason: ['', [Validators.required, Validators.minLength(5)]]
  });

  reason = computed(() => this.lateForm.controls['reason']);

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.lateForm.valid) {
      // Devuelve la descripción y asigna "RETARDO" como la incidencia automáticamente
      this.dialogRef.close({
        incident: 'RETARDO',
        reason: this.lateForm.value.reason
      });
    } else {
      this.lateForm.markAllAsTouched();
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeesService } from '../../service/employees.service';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="photo-upload-container">
      <!-- Foto actual -->
      <div class="photo-display">
        <img 
          [src]="photoUrl || defaultPhotoUrl" 
          [alt]="'Foto de ' + employeeName"
          class="avatar w-8rem h-8rem border-circle"
          [class.opacity-50]="isUploading">
        
        <!-- Overlay de carga -->
        <div *ngIf="isUploading" class="upload-overlay">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="photo-actions" *ngIf="canEdit">
        <!-- Botón para subir foto -->
        <button 
          mat-raised-button 
          color="primary" 
          [disabled]="isUploading"
          (click)="fileInput.click()">
          <mat-icon>camera_alt</mat-icon>
          {{ photoUrl ? 'Cambiar foto' : 'Subir foto' }}
        </button>

        <!-- Botón para eliminar foto (solo si hay foto) -->
        <button 
          *ngIf="photoUrl" 
          mat-stroked-button 
          color="warn" 
          [disabled]="isUploading"
          (click)="deletePhoto()">
          <mat-icon>delete</mat-icon>
          Eliminar
        </button>
      </div>

      <!-- Input oculto para seleccionar archivo -->
      <input 
        #fileInput
        type="file" 
        accept="image/*" 
        style="display: none"
        (change)="onFileSelected($event)">
    </div>
  `,
  styleUrl: './photo-upload.component.css'
})
export class PhotoUploadComponent {
  @Input() employeeId!: number;
  @Input() photoUrl: string | null = null;
  @Input() employeeName: string = '';
  @Input() canEdit: boolean = true;
  @Output() photoUpdated = new EventEmitter<string | null>();

  private employeesService = inject(EmployeesService);
  private snackBar = inject(MatSnackBar);

  isUploading = false;
  defaultPhotoUrl = 'https://www.w3schools.com/w3images/avatar2.png';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.showMessage('Por favor selecciona un archivo de imagen válido', 'error');
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.showMessage('El archivo es demasiado grande. Máximo 5MB permitido', 'error');
      return;
    }

    this.uploadPhoto(file);
  }

  private uploadPhoto(file: File): void {
    if (!this.canEdit) {
      this.showMessage('No tienes permisos para modificar esta foto', 'error');
      return;
    }

    this.isUploading = true;

    this.employeesService.uploadEmployeePhoto(this.employeeId, file).subscribe({
      next: (response) => {
        this.photoUrl = response.photoUrl;
        this.photoUpdated.emit(response.photoUrl);
        this.showMessage('Foto subida exitosamente', 'success');
        this.isUploading = false;
      },
      error: (error) => {
        console.error('Error uploading photo:', error);
        this.showMessage('Error al subir la foto. Inténtalo de nuevo', 'error');
        this.isUploading = false;
      }
    });
  }

  deletePhoto(): void {
    if (!this.canEdit) {
      this.showMessage('No tienes permisos para eliminar esta foto', 'error');
      return;
    }

    this.isUploading = true;

    this.employeesService.deleteEmployeePhoto(this.employeeId).subscribe({
      next: (response) => {
        this.photoUrl = null;
        this.photoUpdated.emit(null);
        this.showMessage('Foto eliminada exitosamente', 'success');
        this.isUploading = false;
      },
      error: (error) => {
        console.error('Error deleting photo:', error);
        this.showMessage('Error al eliminar la foto. Inténtalo de nuevo', 'error');
        this.isUploading = false;
      }
    });
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }
} 
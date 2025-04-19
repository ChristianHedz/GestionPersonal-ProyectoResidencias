import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ChatbotService, ChatbotDocument } from '../../services/chatbot.service';
import { finalize } from 'rxjs';
import { ToolbarComponent } from '../../shared/toolbar/toolbar.component';

@Component({
  selector: 'app-chatbot-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    ToolbarComponent,
  ],
  templateUrl: './chatbot-config.component.html',
  styleUrl: './chatbot-config.component.css'
})
export class ChatbotConfigComponent {
  private chatbotService = inject(ChatbotService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  // Signals
  documents = signal<ChatbotDocument[]>([]);
  isLoading = signal<boolean>(true);
  isUploading = signal<boolean>(false);
  uploadProgress = signal<number>(0);
  isDragging = signal<boolean>(false);
  
  // Computed values
  hasDocuments = computed(() => this.documents().length > 0);
  
  // Form
  uploadForm: FormGroup = this.fb.group({
    description: ['', [Validators.maxLength(200)]]
  });
  
  // File
  selectedFile: File | null = null;
  
  // Table columns
  displayedColumns: string[] = ['filename', 'fileSize', 'uploadDate', 'status', 'actions'];

  constructor() {
    // Cargar documentos al inicializar
    this.loadDocuments();
    
    // Effect para mostrar notificaciones cuando cambia el estado de carga
    effect(() => {
      if (this.isLoading() === false) {
        // Solo mostrar si ya terminó la carga inicial
        if (this.documents().length === 0) {
          this.snackBar.open('No hay documentos cargados', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  /**
   * Carga la lista de documentos del servidor
   */
  loadDocuments(): void {
    this.isLoading.set(true);
    
    this.chatbotService.getDocuments()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (docs) => this.documents.set(docs),
        error: (err) => {
          console.error('Error al cargar documentos', err);
          this.snackBar.open('Error al cargar los documentos', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * Maneja el evento de arrastrar un archivo sobre la zona de drop
   * @param event Evento de arrastre
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }
  
  /**
   * Maneja el evento cuando el cursor sale de la zona de drop
   * @param event Evento de arrastre
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }
  
  /**
   * Maneja el evento de soltar un archivo en la zona de drop
   * @param event Evento de drop
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    
    const dt = event.dataTransfer;
    if (dt?.files && dt.files.length > 0) {
      // Verificar extensiones permitidas
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.csv'];
      const file = dt.files[0];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (allowedExtensions.includes(fileExtension)) {
        this.selectedFile = file;
        this.snackBar.open(`Archivo seleccionado: ${file.name}`, 'OK', { duration: 2000 });
      } else {
        this.snackBar.open('Formato de archivo no permitido. Use PDF, DOC, DOCX, TXT o CSV', 'Cerrar', { duration: 3000 });
      }
    }
  }

  /**
   * Maneja la selección de archivos desde el diálogo
   * @param event Evento del input file
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  /**
   * Sube el archivo seleccionado al servidor
   */
  uploadDocument(): void {
    if (!this.selectedFile) {
      this.snackBar.open('Debe seleccionar un archivo', 'Cerrar', { duration: 3000 });
      return;
    }

    const description = this.uploadForm.get('description')?.value;
    
    // Simulación de progreso (en un escenario real esto vendría del backend)
    this.isUploading.set(true);
    this.uploadProgress.set(0);
    
    const progressInterval = setInterval(() => {
      if (this.uploadProgress() < 90) {
        this.uploadProgress.update(value => value + 10);
      }
    }, 300);
    
    this.chatbotService.uploadDocument(this.selectedFile, description)
      .pipe(
        finalize(() => {
          clearInterval(progressInterval);
          this.uploadProgress.set(100);
          setTimeout(() => {
            this.isUploading.set(false);
            this.uploadProgress.set(0);
          }, 500);
        })
      )
      .subscribe({
        next: (doc) => {
          this.documents.update(docs => [...docs, doc]);
          this.snackBar.open('Documento subido correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
        },
        error: (err) => {
          console.error('Error al subir documento', err);
          this.snackBar.open('Error al subir el documento', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * Elimina un documento del servidor
   * @param documentId ID del documento a eliminar
   */
  deleteDocument(documentId: string): void {
    this.chatbotService.deleteDocument(documentId)
      .subscribe({
        next: () => {
          this.documents.update(docs => docs.filter(doc => doc.id !== documentId));
          this.snackBar.open('Documento eliminado correctamente', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error al eliminar documento', err);
          this.snackBar.open('Error al eliminar el documento', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * Calcula el tamaño del archivo en formato legible
   * @param bytes Tamaño en bytes
   * @returns Tamaño formateado
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Reinicia el formulario después de una carga
   */
  resetForm(): void {
    this.uploadForm.reset();
    this.selectedFile = null;
    
    // Resetear también el input file (técnica para Angular)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}

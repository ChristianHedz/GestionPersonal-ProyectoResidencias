import { AssistDTO } from './../../interfaces/assist.interface';
import { ValidatorsService } from './../../auth/service/validators.service';
import { EmployeesService } from './../../service/employees.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from '../../shared/toolbar/toolbar.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { toSignal } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import 'animate.css';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { LateDialogComponent } from '../../components/late-dialog/late-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCheckboxModule,     MatToolbarModule, 
    MatButtonModule,       MatIconModule,
    MatMenuModule,         MatCardModule,
    MatFormFieldModule,    MatInputModule,
    MatButtonToggleModule, MatDividerModule,
    RouterModule,          CommonModule,
    ToolbarComponent,      ReactiveFormsModule,
    ZXingScannerModule,    MatDialogModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Propiedades de tiempo y estado
  currentTime = signal<string>('');
  currentDate = signal<string>('');
  currentView = signal<'boton' | 'codigo'>('boton');
  submitting = signal<boolean>(false);
  
  // Propiedades del escáner QR
  scannerEnabled = signal<boolean>(false);
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | null = null;
  qrResult = signal<string>('');
  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.QR_CODE,
  ];
  
  // Servicios y dependencias
  private timerInterval: any;
  private employeesService = inject(EmployeesService);
  private fb = inject(FormBuilder);
  public validatorsService = inject(ValidatorsService);
  private dialog = inject(MatDialog);

  // Formulario de asistencia
  readonly assistForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(this.validatorsService.emailPattern)]],
  });

  email = computed(() => this.assistForm.controls.email);

  /**
   * Inicializa el componente y configura el temporizador para actualizar la hora
   */
  ngOnInit(): void {
    this.updateTime();
    this.timerInterval = setInterval(() => this.updateTime(), 1000);
  }

  /**
   * Limpia los recursos al destruir el componente
   */
  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  /**
   * Actualiza la hora y fecha actual
   */
  updateTime(): void {
    const now = new Date();
    
    // Formato hora: HH:MM
    this.currentTime.set(now.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }));
    
    // Formato fecha: Día de la semana, Mes DD
    const formattedDate = now.toLocaleDateString('es-MX', {
      weekday: 'long', 
      month: 'long', 
      day: 'numeric'
    });
    
    // Capitalizar primera letra y formatear
    this.currentDate.set(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));
  }

  /**
   * Cambia entre las vistas de botón y código QR
   */
  onViewChange(view: 'boton' | 'codigo'): void {
    this.currentView.set(view);
    this.scannerEnabled.set(view === 'codigo');
  }

  /**
   * Activa o desactiva la cámara manualmente
   */
  toggleCamera(): void {
    // Invertir el estado del scanner
    this.scannerEnabled.update(enabled => !enabled);
    
    // Si desactivamos la cámara, también limpiamos el resultado del escaneo
    if (!this.scannerEnabled()) {
      this.qrResult.set('');
    }
  }

  /**
   * Maneja la detección de cámaras disponibles
   */
  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    
    if (devices && devices.length > 0) {
      this.currentDevice = devices[0];
    }
  }

  /**
   * Maneja errores en la inicialización de la cámara
   */
  onCameraError(error: Error): void {
    console.error('Camera error:', error);
    Swal.fire('Error de cámara', 'No se pudo acceder a la cámara. Por favor, verifica que has concedido los permisos necesarios.', 'error');
  }

  /**
   * Procesa el resultado del escaneo de código QR
   */
  onCodeResult(result: string): void {
    if (result !== this.qrResult() && result) {
      this.qrResult.set(result);
      
      if (this.isValidEmail(result)) {
        this.registerAttendance(result);
      } else {
        Swal.fire('Formato inválido', 'El código QR no contiene un correo electrónico válido.', 'warning');
      }
    }
  }

  /**
   * Valida si una cadena es un correo electrónico válido
   */
  private isValidEmail(email: string): boolean {
    const emailPattern = new RegExp(this.validatorsService.emailPattern);
    return emailPattern.test(email);
  }

  /**
   * Registra la asistencia mediante el formulario manual
   */
  registerAssist(): void {
    if (this.assistForm.invalid) {
      this.assistForm.markAllAsTouched();
      return;
    }
    
    const emailValue = this.assistForm.controls.email.value;
    if (emailValue) {
      this.registerAttendance(emailValue);
    }
  }

  /**
   * Registra la asistencia del empleado (usado por QR y formulario)
   */
  private registerAttendance(email: string): void {
    this.submitting.set(true);
    
    const now = new Date();
    const entryTime = now.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const assistDTO: AssistDTO = {
      date: now.toLocaleDateString('en-CA'), 
      entryTime,
      emailEmployee: email,
      incidents: 'NA',
    };

    // Convertir la hora actual a un objeto Date para comparación
    const currentTime = new Date();
    currentTime.setHours(parseInt(entryTime.split(':')[0], 10));
    currentTime.setMinutes(parseInt(entryTime.split(':')[1], 10));
    
    // Crear referencia a la hora límite (9:10 AM)
    const lateTime = new Date();
    lateTime.setHours(9);
    lateTime.setMinutes(10);
    
    // Verificar si el empleado llegó tarde
    if (currentTime > lateTime) {
      // Mostrar el modal para registrar la tardanza  
      this.dialog.open(LateDialogComponent, {
        width: '500px',
        disableClose: true,
      }).afterClosed().subscribe((result: { incident: string; reason: string } | undefined) => {
        if (result) {
          // Si se completó el formulario, agregar datos de incidencia
          assistDTO.incidents = result.incident;
          assistDTO.reason = result.reason;
          this.submitAttendance(assistDTO);
        } else {
          // Si se canceló el diálogo
          this.submitting.set(false);
        }
      });
    } else {
      // No llegó tarde, registrar asistencia normal
      this.submitAttendance(assistDTO);
    }
  }

  /**
   * Envía los datos de asistencia al servicio
   */
  private submitAttendance(assistDTO: AssistDTO): void {
    this.employeesService.registerAssist(assistDTO)
      .subscribe({
        next: () => {
          this.submitting.set(false);
          
          const isQrMode = this.currentView() === 'codigo';
          
          if (isQrMode) {
            Swal.fire({
              title: '¡Asistencia registrada!',
              text: `Se ha registrado la asistencia para ${assistDTO.emailEmployee}`,
              icon: 'success',
              timer: 3000,
              timerProgressBar: true
            });
            
            // Resetear escáner después del registro exitoso
            setTimeout(() => this.qrResult.set(''), 3000);
          } else {
            Swal.fire('¡Hora de entrada registrada exitosamente!', 
                     'Has registrado tu hora de entrada correctamente', 
                     'success');
            this.assistForm.reset();
          }
        },
        error: (error) => {
          this.submitting.set(false);
          console.error('Error al registrar asistencia:', error);
          Swal.fire('Error', 'No se pudo registrar la asistencia. Intente nuevamente.', 'error');
        }
      });
  }
}

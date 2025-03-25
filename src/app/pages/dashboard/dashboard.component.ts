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
import 'animate.css';
import { FormBuilder,ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCheckboxModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule,
    MatMenuModule, 
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatDividerModule,
    RouterModule, 
    CommonModule,
    ToolbarComponent,
    ReactiveFormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],

})
export class DashboardComponent implements OnInit, OnDestroy {
  currentTime: string = '';
  currentDate: string = '';
  currentView = signal<'boton' | 'codigo'>('boton');
  submitting: boolean = false;
  private timerInterval: any;
  private EmployeesService = inject(EmployeesService);
  validatorsService = inject(ValidatorsService);
  private fb = inject(FormBuilder);


  readonly assistForm = this.fb.group({
    email: [' ', [Validators.required, Validators.pattern(this.validatorsService.emailPattern)]],
  });

  email = computed(() => this.assistForm.controls.email);

  ngOnInit(): void {
    // Actualizar inmediatamente al iniciar
    this.updateTime();
    
    // Configurar intervalo para actualizar cada segundo
    this.timerInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo cuando el componente se destruye
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  updateTime(): void {
    const now = new Date();
    
    // Formato hora: HH:MM
    this.currentTime = now.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    // Formato fecha: Día de la semana, Mes DD
    this.currentDate = now.toLocaleDateString('es-MX', {
      weekday: 'long', 
      month: 'long', 
      day: 'numeric'
    });
    
    // Capitalizar primera letra y formatear
    this.currentDate = this.currentDate.charAt(0).toUpperCase() + this.currentDate.slice(1);
  }


  onViewChange(view: 'boton' | 'codigo'): void {
    this.currentView.set(view);
  }

  registerAssist(): void {

    if (this.assistForm.invalid) {
      this.assistForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    
    const assistDTO: AssistDTO = {
      date: new Date().toLocaleDateString('en-CA'), 
      entryTime: new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      emailEmployee: this.email().value || ''
    };
  
    this.EmployeesService.registerAssist(assistDTO)
      .subscribe({
        next: (response) => {
          this.submitting = false;
          console.log('Hora de entrada registrada exitosamente', response);
          Swal.fire('¡Hora de entrada registrada exitosamente!', 'Has registrado tu hora de entrada correctamente', 'success');
        },
        error: (error) => {
          this.submitting = false;
          console.error('Error al registrar hora de entrada', error);
          Swal.fire('¡Error al registrar hora de entrada!', 'Por favor, intenta nuevamente', 'error');
        }
      });
  }
}

import { AuthService } from './../../auth/service/auth.service';
import { DashboardService } from './../../service/dashboard.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Component, computed, inject, OnDestroy, OnInit, } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from "../../shared/toolbar/toolbar.component";
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import 'animate.css';
import { AuthResponse } from '../../auth/interfaces/authResponse';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCheckboxModule, MatToolbarModule, MatButtonModule, MatIconModule,
    MatMenuModule, RouterModule, ToolbarComponent, CommonModule,],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],

})
export class DashboardComponent implements OnInit, OnDestroy {
  currentTime: string = '';
  currentDate: string = '';
  private timerInterval: any;
  private timeRecordService = inject(HttpClient);
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  currentUser = computed(() => this.authService.currentUser());

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

  sendTimeToBackend(): void {
    const timeData = {
      timestamp: new Date().toISOString(),
      time: this.currentTime,
      date: this.currentDate
    };
  
    this.dashboardService.recordTime(timeData)
      .subscribe({
        next: (response) => {
          console.log('Hora registrada exitosamente', response);
        },
        error: (error) => {
          console.error('Error al registrar hora', error);
        }
      });
  }
}

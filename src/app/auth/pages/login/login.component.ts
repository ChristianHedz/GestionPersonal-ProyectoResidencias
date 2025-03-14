import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { ValidatorsService } from '../../service/validators.service';
import Swal from 'sweetalert2';
import { LoginResponse } from '../../interfaces';

@Component({
  selector: 'app-login',
  standalone: true, // Marcar como standalone
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
    
    // Servicios
    private validatorsService = inject(ValidatorsService);
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private authService = inject(AuthService); // Cambiado a camelCase
    
    // Formulario
    public loginForm = this.fb.group({
      email: ['', [
        Validators.required, 
        Validators.pattern(this.validatorsService.emailPattern)
      ]],
      password: ['', [Validators.required]],
    });
    
    // Propiedades computadas
    email = computed(() => this.loginForm.controls.email);
    password = computed(() => this.loginForm.controls.password);

    // Método de inicio de sesión (cambiado de register a login)
    login(): void {
      if (this.loginForm.invalid) {
        this.loginForm.markAllAsTouched();
        Swal.fire('Error!', 'Por favor completa correctamente el formulario', 'error');
        return;
      }
      
  
      this.authService.login(this.loginForm.value as LoginResponse)
        .subscribe({
          next: (success: boolean) => {
            Swal.fire('¡Inicio de sesión exitoso!', 'Has iniciado sesión correctamente', 'success');
            this.router.navigateByUrl('/inicio');
          },
          error: (error: any) => {
            console.error('Error de autenticación:', error);
            Swal.fire('Error', 'Credenciales incorrectas', 'error');
          }
        });
    }
    
    // Métodos de validación
    isValidField(field: string): boolean {
      const control = this.loginForm.get(field);
      return !!control && control.invalid && control.touched;
    }
    
    getFieldError(field: string): string | null {
      const control = this.loginForm.get(field);
      
      if (!control || !control.errors || !control.touched) return null;
      
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['pattern']) {
        if (field === 'email') return 'Ingresa un correo electrónico válido';
        return 'El formato ingresado no es válido';
      }
      
      return 'Campo inválido';
    }
}
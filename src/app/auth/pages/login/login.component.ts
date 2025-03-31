import { AuthResponse } from './../../interfaces/authResponse';
import { Component, computed, inject, OnInit} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';
import { ValidatorsService } from '../../service/validators.service';
import Swal from 'sweetalert2';
import { LoginResponse } from '../../interfaces';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { GoogleSigninButtonModule, SocialLoginModule, SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    GoogleSigninButtonModule,
    SocialLoginModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
    
    private validatorsService = inject(ValidatorsService);
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private authService = inject(AuthService);
    private socialAuthService = inject(SocialAuthService);
    
    public loginForm = this.fb.group({
      email: ['', [
        Validators.required, 
        Validators.pattern(this.validatorsService.emailPattern)
      ]],
      password: ['', [Validators.required]],
    });

    email = computed(() => this.loginForm.controls.email);
    password = computed(() => this.loginForm.controls.password);

    ngOnInit() {
      this.socialAuthService.authState.subscribe({
        next: (result) => {
          this.authService.googleLogin(result.idToken).subscribe((res) => {
            if (res) {
              Swal.fire('Bienvenido!', 'Has iniciado sesión correctamente', 'success');
              this.router.navigateByUrl('/home');
            }
          });
          console.log(result);
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
    

    login(): void {
      if (this.loginForm.invalid) {
        this.loginForm.markAllAsTouched();
        Swal.fire('Error!', 'Por favor completa correctamente el formulario', 'error');
        return;
      }
        
      this.authService.login(this.loginForm.value as LoginResponse)
        .subscribe({
          next: (employee: AuthResponse) => {
            Swal.fire('¡Inicio de sesión exitoso!', 'Has iniciado sesión correctamente', 'success');
            employee.role === 'ADMIN' ? this.router.navigateByUrl('/admin/inicio')
             : this.router.navigateByUrl('/admin/info');
          },
          error: (error: any) => {
            console.error('Error de autenticación:', error);
            Swal.fire('Error', 'Credenciales incorrectas', 'error');
          }
        });
    }
    
    isValidField(field: string): boolean {
      const control = this.loginForm.get(field);
      return !!control && control.invalid && control.touched;
    }
    
    getFieldError(field: string): string | null {
      const control = this.loginForm.get(field);
      
      if (!control || !control.errors || !control.touched) return null;
      
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['pattern']) {
        return field === 'email' ? 'Ingresa un correo electrónico válido' : 'El formato ingresado no es válido';
      }
      
      return 'Campo inválido';
    }
}
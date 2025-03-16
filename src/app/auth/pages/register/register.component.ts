import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { ValidatorsService } from '../../service/validators.service';
import { registerResponse } from '../../interfaces';
import { AuthService } from '../../service/auth.service';
import Swal from 'sweetalert2';
import { HttpClient} from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,MatFormFieldModule,MatInputModule,
      MatButtonModule,MatIconModule,MatButtonModule,RouterModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  private validatorsService = inject(ValidatorsService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private AuthService = inject(AuthService);
  
  public registerForm = this.fb.group({
    fullName: ['',[Validators.required, Validators.pattern(this.validatorsService.firstNameAndLastnamePattern)]],
    email: ['',[Validators.required, Validators.pattern(this.validatorsService.emailPattern)]],
    password: ['',[Validators.required]],
  });
  
  fullName = computed(()=> this.registerForm.controls.fullName)

  email = computed(()=> this.registerForm.controls.email)

  password = computed(()=> this.registerForm.controls.password)

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      Swal.fire('Error!', 'Por favor completa correctamente el formulario', 'error');
      return;
    }

    this.AuthService.registerUsers(this.registerForm.value as registerResponse)
      .subscribe({
        next: (success) => {
          Swal.fire('¡Registro exitoso!', 'Tu cuenta ha sido creada correctamente', 'success');
          this.router.navigateByUrl('admin/inicio');
        },
        error: (error) => {
          Swal.fire('Error', 'No se pudo completar el registro', 'error');
        }
      });
  }


  isValidField(field: string): boolean | null {
    const control = this.registerForm.get(field);
    return control ? control.errors && control.touched : null;
  }

  getFieldError(field: string): string | null {
    const control = this.registerForm.get(field);
    
    if (!control || !control.errors || !control.touched) return null;
    
    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['pattern']) {
      if (field === 'email') return 'Ingresa un correo electrónico válido';
      return 'El formato ingresado no es válido';
    }
    return 'Campo inválido';
  }


}
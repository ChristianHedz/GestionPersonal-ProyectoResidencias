import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { GoogleSigninButtonModule, SocialLoginModule, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { Router} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-social-login',
  standalone: true,
  imports: [
    GoogleSigninButtonModule,
    SocialLoginModule,
  ],
  templateUrl: './social-login.component.html',
  styleUrls: ['./social-login.component.css']
})
export class SocialLoginComponent implements OnInit {

  private socialAuthService = inject(SocialAuthService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  
  ngOnInit(): void {
    this.socialAuthService.authState
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (user: SocialUser) => {
        if (user) {
            this.handleGoogleSignIn(user);
          }
        },
        error: (error: unknown) => {
          console.error('Social login error:', error);
          this.showErrorMessage('Error al iniciar sesión con Google');
        }
      });
    }
    
    private handleGoogleSignIn(user: SocialUser): void {
    if (user && user.idToken) {
      this.authService.googleLogin(user.idToken)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.router.navigateByUrl('/admin/home');
          },
          error: (error: HttpErrorResponse | Error) => {
            console.error('Google login error:', error);
            const errorMessage = error instanceof HttpErrorResponse 
              ? error.error?.message || 'Error al iniciar sesión con Google'
              : error.message || 'Error al iniciar sesión con Google';
            this.showErrorMessage(errorMessage);
          }
        });
    }
  }

  private showErrorMessage(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error de autenticación',
      text: message,
      confirmButtonColor: '#3085d6',
    });
  }
}

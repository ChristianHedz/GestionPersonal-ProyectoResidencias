import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStatus } from '../../auth/interfaces/authStatus.enum';
import { AuthService } from '../../auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  navigateAfterAuth(role: string): void {
    const route = role === 'ADMIN' ? '/admin/inicio' : '/admin/info';
    this.router.navigateByUrl(route);
  }

  navigateToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  navigateToRegister(): void {
    this.router.navigateByUrl('/registro');
  }

  navigateToDashboard(): void {
    this.router.navigateByUrl('/admin/inicio');
  }

  navigateToEmployees(): void {
    this.router.navigateByUrl('/admin/empleados');
  }

  navigateToInfo(): void {
    this.router.navigateByUrl('/admin/info');
  }

  handleAuthError(): void {
    if (this.authService.authStatus() === AuthStatus.notAuthenticated) {
      this.navigateToLogin();
    }
  }
} 
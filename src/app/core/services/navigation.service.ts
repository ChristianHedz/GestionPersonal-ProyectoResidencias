import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStatus } from '../models/auth/authStatus.enum';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  navigateAfterAuth(role: string): void {
    const route = role === 'ADMIN' ? '/admin/home' : '/employee/profile';
    this.router.navigateByUrl(route);
  }

  navigateToLogin(): void {
    this.router.navigateByUrl('/auth/login');
  }

  navigateToRegister(): void {
    this.router.navigateByUrl('/auth/register');
  }

  navigateToDashboard(): void {
    this.router.navigateByUrl('/admin/home');
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
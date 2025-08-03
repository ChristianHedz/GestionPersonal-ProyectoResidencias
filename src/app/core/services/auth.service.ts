import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthStatus } from '../models/auth/authStatus.enum';
import { AuthResponse } from '../models/auth/authResponse';
import { LoginResponse, registerResponse } from '../models';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';

const API_ENDPOINTS = {
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  PROFILE: '/profile',
  GOOGLE_AUTH: '/authGoogle'
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly url: string = environment.urlApi;
  private readonly STORAGE_KEY = 'isLogged';
  private readonly handleError = inject(ErrorHandlerService);
  private readonly errorHandler = this.handleError.handleError;
  private readonly socialAuthService = inject(SocialAuthService);

  private _authStatus = signal<AuthStatus>(AuthStatus.checking);
  public authStatus = this._authStatus.asReadonly();

  private _currentUser = signal<AuthResponse | null>(null);
  public currentUser = this._currentUser.asReadonly();

  public isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  public isEmployee = computed(() => this.currentUser()?.role === 'EMPLOYEE');

  constructor() {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const isLogged = localStorage.getItem(this.STORAGE_KEY) === AuthStatus.authenticated;
    
    if (!isLogged) {
      this.handleLogout();
      return;
    }
    this.http.get<AuthResponse>(`${this.url}${API_ENDPOINTS.PROFILE}`)
      .pipe(
        tap(employee => {
          this._currentUser.set(employee)
          this._authStatus.set(AuthStatus.authenticated)
        }),
        catchError(() => {
          this.handleLogout();
          return of(null);
        })
      ).subscribe();
  }

  googleLogin(token: string): Observable<AuthResponse> {
    if (!token) {
      return throwError(() => new Error('Token de Google no proporcionado'));
    }
  
    return this.http.post<AuthResponse>(`${this.url}${API_ENDPOINTS.GOOGLE_AUTH}`, { token })
      .pipe(
        tap(employee => this._currentUser.set(employee)),
        tap(() => this.handleSuccessfulAuth()),
        catchError((error: HttpErrorResponse) => {
          this.handleLogout();
          return throwError(() => this.errorHandler(error));
        })
      );
  }

  login(credentials: LoginResponse): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}${API_ENDPOINTS.LOGIN}`, credentials)
      .pipe(
        tap(employee => this._currentUser.set(employee)),
        tap(() => this.handleSuccessfulAuth()),
        catchError((error) => {
          this.handleLogout();
          return throwError(() => this.errorHandler(error));
        })
      );
  }

  registerUsers(credentials: registerResponse): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}${API_ENDPOINTS.REGISTER}`, credentials)
      .pipe(
        tap(employee => this._currentUser.set(employee)),
        tap(() => this.handleSuccessfulAuth()),
        catchError((error) => {
          this.handleLogout();
          return throwError(() => this.errorHandler(error));
        })
      );
  }

  logout(): Observable<void> {
    try {
      this.socialAuthService.signOut();
    } catch (error) {
      console.error('Error signing out from Google:', error);
    }
    return this.http.post<void>(`${this.url}${API_ENDPOINTS.LOGOUT}`, {})
      .pipe(
        tap(() => this.handleLogout()),
        catchError((error) => throwError(() => this.errorHandler(error)))
    );
  }

  private handleSuccessfulAuth(): void {
    this._authStatus.set(AuthStatus.authenticated);
    localStorage.setItem(this.STORAGE_KEY, AuthStatus.authenticated);
  }


  private handleLogout(): void {
    this._authStatus.set(AuthStatus.notAuthenticated);
    this._currentUser.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

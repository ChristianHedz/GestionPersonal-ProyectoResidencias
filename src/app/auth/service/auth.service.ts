import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStatus } from '../interfaces/authStatus.enum';
import { AuthResponse } from '../interfaces/authResponse';
import { LoginResponse, registerResponse } from '../interfaces';
import { environment } from '../../../env/enviroments';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { ApiError } from '../interfaces/apiError';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly url: string = environment.urlApi;
  private readonly router = inject(Router);
  private readonly STORAGE_KEY = 'isLogged';

  private _authStatus = signal<AuthStatus>(AuthStatus.checking);
  public authStatus = computed(() => this._authStatus());

  private _currentUser = signal<AuthResponse | null>(null);
  public currentUser = computed(() => this._currentUser());

  public isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  constructor() {
    this.checkAuthStatus();
  }

    private checkAuthStatus(): void {
    this.isLogged().subscribe();
  }

    isLogged(): Observable<boolean> {
    const isLogged = localStorage.getItem(this.STORAGE_KEY) === AuthStatus.authenticated;
    this._authStatus.set(isLogged ? AuthStatus.authenticated : AuthStatus.notAuthenticated);
    
    console.log('Usuario autenticado pendiente');
    if (!isLogged) return of(false);
    
    return this.http.get<AuthResponse>(`${this.url}/profile`)
      .pipe(
        tap(employee => this._currentUser.set(employee)),
        tap(() => this._authStatus.set(AuthStatus.authenticated)),
        tap(() => console.log('Usuario autenticado')),
        map(() => true),
        catchError(() => {
          this.handleLogout();
          return of(false);
        })
      );
  }

    login(credentials: LoginResponse): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/login`, credentials, { withCredentials: true })
      .pipe(
        tap(employee => this._currentUser.set(employee)),
        tap(() => this.handleSuccessfulAuth()),
        catchError((error) => {
          this.handleLogout();
          return throwError(() => this.handleError(error));
        })
      );
  }

    registerUsers(credentials: registerResponse): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/register`, credentials, { withCredentials: true })
      .pipe(
        tap(employee => this._currentUser.set(employee)),
        tap(() => this.handleSuccessfulAuth()),
        catchError((error) => {
          this.handleLogout();
          return throwError(() => this.handleError(error));
        })
      );
  }

    logout(): Observable<void> {
    return this.http.post<void>(`${this.url}/logout`, null)
      .pipe(
        tap(() => this.handleLogout()),
        catchError((error) => throwError(() => this.handleError(error)))
    )
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


  
  // ...
  
  private handleError(error: HttpErrorResponse): ApiError {
    const errorMessages: Record<number, string> = {
      0: 'Error de conexión. Por favor, verifica tu conexión a internet.',
      401: 'Usuario no autorizado. Por favor inicia sesión nuevamente.',
      403: 'No tienes permisos para realizar esta acción.',
      404: 'Recurso no encontrado.'
    };
  
    // Intentar extraer el mensaje de error del backend si existe
    const backendMessage = error.error?.message || '';
  
    const errorMessage = errorMessages[error.status] || 
                       backendMessage || 
                       `Error ${error.status}: ${error.statusText || 'Error desconocido'}`;
  
    console.error('API Error:', error);
    
    return {
      status: error.status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      url: error.url || '',
      error: error.error || error
    };
  }
}

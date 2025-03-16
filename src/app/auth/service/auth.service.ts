import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStatus } from '../interfaces/authStatus.enum';
import { AuthResponse } from '../interfaces/authResponse';
import { LoginResponse, registerResponse } from '../interfaces';
import { environment } from '../../../env/enviroments';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly url: string = environment.urlApi;
  private router = inject(Router);

  private _authStatus = signal<AuthStatus>(AuthStatus.checking);
  public authStatus = computed(() => this._authStatus());

  private _currentAuthUser = signal<AuthResponse | null>(null);
  public currentAuthUser = computed(() => this._currentAuthUser());

  private _currentRegisteredUser = signal<AuthResponse | null>(null);
  public currentRegisteredUser = computed(() => this._currentRegisteredUser());

  constructor() {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    this.isLogged().subscribe();
  }

  isLogged(): Observable<boolean> {
    const isLogged = localStorage.getItem("isLogged") === AuthStatus.authenticated;
    
    this._authStatus.set(isLogged ? AuthStatus.authenticated : AuthStatus.notAuthenticated);
    
    if (!isLogged) return of(false);

    return this.http.get<AuthResponse>(`${this.url}/profile`, { withCredentials: true })
      .pipe(
        tap(employee => this._currentAuthUser.set(employee)),
        tap(() => this._authStatus.set(AuthStatus.authenticated)),
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
        tap(employee => this._currentAuthUser.set(employee)),
        tap(() => this.handleSuccessfulAuth()),
        catchError((error) => {
          this.handleLogout();
          return this.handleError(error);
        })
      );
  }

  registerUsers(credentials: registerResponse): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/register`, credentials, { withCredentials: true })
      .pipe(
        tap(employee => this._currentRegisteredUser.set(employee)),
        tap(() => this.handleSuccessfulAuth()),
        catchError((error) => {
          this.handleLogout();
          return this.handleError(error);
        })
      );
  }

  private handleSuccessfulAuth(): void {
    this._authStatus.set(AuthStatus.authenticated);
    localStorage.setItem("isLogged", AuthStatus.authenticated);
  }

  private handleLogout(): void {
    this._authStatus.set(AuthStatus.notAuthenticated);
    this._currentAuthUser.set(null);
    localStorage.removeItem("isLogged");
  }

  logout(): void {
    this.handleLogout();
    this.router.navigateByUrl('/login');
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Ha ocurrido un error de red:', error.error);
    } else {
      console.error(`Backend retornó código ${error.status}, error: ${error.error}`);
    }
    return throwError(() => new Error('Por favor intenta de nuevo'));
  }
}
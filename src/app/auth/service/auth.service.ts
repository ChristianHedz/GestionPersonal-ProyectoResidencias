import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStatus } from '../interfaces/authStatus.enum';
import { AuthResponse } from '../interfaces/authResponse';
import { LoginResponse, registerResponse } from '../interfaces';
import { environment } from '../../../env/enviroments';
import { catchError, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private readonly url: string = environment.urlApi;
  private router = inject(Router);

  private _authStatus = signal<AuthStatus>(AuthStatus.checking);
  public authStatus = computed(() => this._authStatus());

  private _AuthUser = signal<AuthResponse | null>(null);
  public AuthUser = computed(() => this._AuthUser());

  private _RegisteredUser = signal<AuthResponse | null>(null);
  public RegisteredUser = computed(() => this._RegisteredUser());

  public isAdmin = computed(() => this.AuthUser()?.role === 'ADMIN');

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
    console.log('isLogged', isLogged);
    
    return this.http.get<AuthResponse>(`${this.url}/profile`)
    .pipe(
      tap(employee => this._AuthUser.set(employee)),
      tap(() => console.log('isLogged', isLogged)),
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
        tap(employee => this._AuthUser.set(employee)),
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
        tap(employee => this._RegisteredUser.set(employee)),
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
    localStorage.setItem("isLogged", AuthStatus.authenticated);
  }

  private handleLogout(): void {
    this._authStatus.set(AuthStatus.notAuthenticated);
    this._AuthUser.set(null);
    localStorage.removeItem("isLogged");
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Ha ocurrido un error de red:', error.error);
    } else {
      console.error(error.error.error);
      console.error(`Backend retornó código ${error.status}, error: ${error.error}`);
    }
    return error;
  }
}

import { environment } from './../../../env/enviroments';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthStatus } from '../interfaces/authStatus.enum';
import { AuthResponse } from '../interfaces/authResponse';
import { LoginResponse, registerResponse } from '../interfaces';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { ErrorHandlerService } from '../../service/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly url: string = environment.urlApi;
  private readonly STORAGE_KEY = 'isLogged';
  private readonly handleError = inject(ErrorHandlerService)
  private readonly errorHandler = this.handleError.handleError;

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
    
    if (!isLogged) return of(false);
    console.log('Usuario autenticado pendiente');
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


  googleLogin(token: string):Observable<AuthResponse> {
    console.log('se recibio el token: ' + {token});
    return this.http.post<AuthResponse>(this.url + '/users/authGoogle',{token}).pipe(
      tap((userResp: AuthResponse) => {
        console.log({userResp});
      }),
    )
  }

  validateGoogleToken(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/auth/google`, { token })
      .pipe(
        tap(employee => this._currentUser.set(employee)),
        tap(() => this.handleSuccessfulAuth()),
        catchError((error) => {
          this.handleLogout();
          return throwError(() => this.errorHandler(error));
        })
      );
  }

  login(credentials: LoginResponse): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/login`, credentials)
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
    return this.http.post<AuthResponse>(`${this.url}/register`, credentials)
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
    return this.http.post<void>(`${this.url}/logout`, null)
      .pipe(
        tap(() => this.handleLogout()),
        catchError((error) => throwError(() => this.errorHandler(error)))
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


}

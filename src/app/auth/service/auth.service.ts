import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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
  private readonly url:string = environment.urlApi;
  private router = inject(Router);

  private _authStatus = signal<AuthStatus>(AuthStatus.checking);
  public authStatus  = computed(() => this._authStatus());

  private _currentAuthUser = signal<AuthResponse|null>(null);
  public currentAuthUser   = computed(() => this._currentAuthUser());

  private _currentUserToken = signal<String|null>(null);
  public currentUserToken  = computed(() => this._currentUserToken());

  private _currentRegisteredUser = signal<AuthResponse|null>(null);
  public currentRegisteredUser = computed(() => this._currentRegisteredUser());

  constructor() {
    this.isLogged().subscribe();
   }


  isLogged(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if(!token){
      this._authStatus.set(AuthStatus.notAuthenticated);
      return of(false);
    }else{
      this._authStatus.set(AuthStatus.authenticated);
    }

    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    
    return this.http.get<AuthResponse>(`${this.url}/profile`,{headers}).pipe(
      tap((employee: AuthResponse) => {
        this._currentAuthUser.set(employee);
        this._currentUserToken.set(AuthStatus.authenticated);
      }),
      map(() => true),
      catchError((error) => {
        this._authStatus.set(AuthStatus.notAuthenticated);
        return this.handleError(error);
      })   
    );
  }


  login(credentials: LoginResponse):Observable<boolean>{
    return this.http.post<AuthResponse>(`${this.url}/login`,credentials).pipe(

      tap((employee: AuthResponse) => {
        localStorage.setItem("jwt",employee.token);
        this._currentUserToken.set(employee.token);
        this._authStatus.set(AuthStatus.authenticated);
      }),
      map(() => true),
      catchError((error)=> {
        this._authStatus.set(AuthStatus.notAuthenticated);
        return this.handleError(error);
      })

    )
  }

  registerUsers(credentials: registerResponse):Observable<boolean>{
    console.log(credentials);
    return this.http.post<AuthResponse>(`${this.url}/register`,credentials).pipe(
      tap((employee: AuthResponse) => {
        console.log(employee);
        localStorage.setItem("jwt",employee.token);
        this._currentRegisteredUser.set(employee);
        this._authStatus.set(AuthStatus.authenticated);
      }),
      map(() => true),
      catchError((error)=>{
        this._authStatus.set(AuthStatus.notAuthenticated);
        return this.handleError(error)
      })
    )
  } 

  private handleError(error: HttpErrorResponse){
    if(error.status === 0){
      console.error('Ha ocurrido un error', error.error);
    }else{
      console.error(`Backend regreso codigo ${error.status}, el cuerpo fue: ${error.error}`);
    }
    return throwError(() => new Error('Por favor intenta de nuevo'));
  }


}

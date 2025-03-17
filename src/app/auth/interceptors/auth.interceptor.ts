import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private router: Router) {}
  
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('Interceptor');
    const authReq = request.clone({
      withCredentials: true
    });
    
    return next.handle(authReq).pipe(
      
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 ) {
          
          this.router.navigateByUrl('/login');
        }
        return throwError(() => error);
      })
    );
  }
}
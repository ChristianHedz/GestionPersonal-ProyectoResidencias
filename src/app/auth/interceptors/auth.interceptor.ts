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
    // All requests will automatically include credentials (cookies)
    console.log('Interceptor');
    const authReq = request.clone({
      withCredentials: true
    });
    
    // Continue with the modified request
    return next.handle(authReq).pipe(
      
      catchError((error: HttpErrorResponse) => {
        // Handle authentication errors globally
        if (error.status === 401 ) {
          
          // Redirect to login or handle unauthorized access
          this.router.navigateByUrl('/login');
        }
        return throwError(() => error);
      })
    );
  }
}
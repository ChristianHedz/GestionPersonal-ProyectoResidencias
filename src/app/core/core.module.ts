import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../auth/service/auth.service';
import { ErrorHandlerService } from '../service/error-handler.service';
import { NavigationService } from './services/navigation.service';
import { AuthInterceptor } from '../auth/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    AuthService,
    ErrorHandlerService,
    NavigationService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  exports: [
    CommonModule,
  ]
})
export class CoreModule { } 
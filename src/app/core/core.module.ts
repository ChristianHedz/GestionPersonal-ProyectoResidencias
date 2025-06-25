import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../auth/service/auth.service';
import { ErrorHandlerService } from '../service/error-handler.service';
import { NavigationService } from './services/navigation.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    AuthService,
    ErrorHandlerService,
    NavigationService,
    // El interceptor ahora se configura funcionalmente en app.config.ts
  ],
  exports: [
    CommonModule,
  ]
})
export class CoreModule { } 
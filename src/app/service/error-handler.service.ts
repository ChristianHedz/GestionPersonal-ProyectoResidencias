// filepath: c:\Users\crist\OneDrive\Desktop\ProyectoResidencias\gestionpersonal-frontend\src\app\shared\services\error-handler.service.ts
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../auth/interfaces/apiError';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  handleError(error: HttpErrorResponse): ApiError {
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
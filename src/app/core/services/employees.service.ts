import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';
import { EmployeeDTO } from '../models/auth/EmployeeDTO';
import { AssistDTO } from '../models/common/assist.interface';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  private readonly environment = environment.urlApi;
  private readonly http = inject(HttpClient);
  private readonly handleError = inject(ErrorHandlerService);
  private readonly ErrorHandler = this.handleError.handleError;

  listAllEmployees(): Observable<Array<EmployeeDTO>> {
    return this.http.get<Array<EmployeeDTO>>(`${this.environment}/employees`)
    .pipe(
      tap((data) => console.log(data)),
      catchError((error) => throwError(() => this.ErrorHandler(error)))
    )
  }

  getEmployeeById(id: number): Observable<EmployeeDTO> {
    return this.http.get<EmployeeDTO>(`${this.environment}/employee/${id}`)
    .pipe(
      tap((data) => console.log('Employee by id:', data)),
      catchError((error) => throwError(() => this.ErrorHandler(error)))
    );
  }

  updateEmployee(id: number, employee: EmployeeDTO): Observable<EmployeeDTO> {
    return this.http.put<EmployeeDTO>(`${this.environment}/employee/${id}`, employee)
    .pipe(
      tap((data) => console.log('Updated employee:', data)),
      catchError((error) => throwError(() => this.ErrorHandler(error)))
    );
  }

  registerAssist(assistData: AssistDTO): Observable<AssistDTO> {
    console.log('Sending assist data:', assistData);
    return this.http.post<AssistDTO>(`${this.environment}/assist`, assistData)
    .pipe(
      tap((data) => console.log('Assist registered:', data)),
      catchError((error) => throwError(() => this.ErrorHandler(error)))
    )
  }

  /**
   * Sube una foto para un empleado específico
   * @param employeeId ID del empleado
   * @param photo Archivo de la foto
   * @returns Observable con la respuesta del servidor incluyendo la URL de la foto
   */
  uploadEmployeePhoto(employeeId: number, photo: File): Observable<{message: string, photoUrl: string}> {
    const formData = new FormData();
    formData.append('photo', photo);

    return this.http.post<{message: string, photoUrl: string}>(
      `${this.environment}/employee/${employeeId}/upload-photo`, 
      formData
    ).pipe(
      tap((response) => console.log('Photo uploaded successfully:', response)),
      catchError((error) => throwError(() => this.ErrorHandler(error)))
    );
  }

  /**
   * Elimina la foto de un empleado específico
   * @param employeeId ID del empleado
   * @returns Observable con la respuesta del servidor
   */
  deleteEmployeePhoto(employeeId: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.environment}/employee/${employeeId}/delete-photo`)
    .pipe(
      tap((response) => console.log('Photo deleted successfully:', response)),
      catchError((error) => throwError(() => this.ErrorHandler(error)))
    );
  }

}

import { HttpClient } from '@angular/common/http';
import { environment } from './../../env/enviroments';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';
import { EmployeeDTO } from '../auth/interfaces/EmployeeDTO';
import { AssistDTO } from '../interfaces/assist.interface';

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

}

import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { EmployeesService } from '../services/employees.service';
import { EmployeeDTO } from '../models/auth/EmployeeDTO';

@Injectable({ providedIn: 'root' })
export class EmployeesResolver implements Resolve<EmployeeDTO[]> {
  constructor(private employeesService: EmployeesService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<EmployeeDTO[]> {
    return this.employeesService.listAllEmployees();
  }
}
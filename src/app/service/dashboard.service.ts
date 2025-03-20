import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  private apiUrl = '/api/time-record'; 
  
  constructor(private http: HttpClient) {}
  
  recordTime(timeData: any): Observable<any> {
    return this.http.post(this.apiUrl, timeData);
  }
}
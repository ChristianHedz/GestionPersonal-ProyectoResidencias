import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { EmployeeToolbarComponent } from '../../shared/toolbar/employee-toolbar/employee-toolbar.component';

@Component({
  selector: 'app-employee-profile',
  imports: [CommonModule, MatIcon, EmployeeToolbarComponent],
  templateUrl: './employee-profile.component.html',
  styleUrl: './employee-profile.component.css'
})
export class EmployeeProfileComponent {

}

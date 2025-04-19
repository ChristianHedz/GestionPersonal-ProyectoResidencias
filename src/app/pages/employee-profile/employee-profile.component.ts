import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ToolbarComponent } from '../../shared/toolbar/toolbar.component';

@Component({
  selector: 'app-employee-profile',
  imports: [MatIcon,ToolbarComponent],
  templateUrl: './employee-profile.component.html',
  styleUrl: './employee-profile.component.css'
})
export class EmployeeProfileComponent {

}

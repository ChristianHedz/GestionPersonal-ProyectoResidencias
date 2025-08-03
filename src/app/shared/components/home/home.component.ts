import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { EmployeeToolbarComponent } from '../toolbar/employee-toolbar/employee-toolbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatIcon, RouterModule, CommonModule, ToolbarComponent, EmployeeToolbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  isAdmin = false;

  ngOnInit(): void {
    this.route.data
      .pipe(map(data => data['mode'] === 'admin'))
      .subscribe(isAdmin => this.isAdmin = isAdmin);
  }

}

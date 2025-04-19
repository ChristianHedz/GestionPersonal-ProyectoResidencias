import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { IncidencesByEmployeeComponent } from './components/incidences-by-employee/incidences-by-employee.component';
import { GeneralIncidencesComponent } from './components/general-incidences/general-incidences.component';
import { HoursByEmployeeComponent } from './components/hours-by-employee/hours-by-employee.component';
import { VacationsComponent } from './components/vacations/vacations.component';
import { ChartDataService } from '../../services/chart-data.service';
import { ToolbarComponent } from '../../shared/toolbar/toolbar.component';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    IncidencesByEmployeeComponent,
    GeneralIncidencesComponent,
    HoursByEmployeeComponent,
    VacationsComponent,
    ToolbarComponent
  ],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent {
  private chartDataService = inject(ChartDataService);
  
  activeTab = signal(0);

  onTabChange(index: number): void {
    this.activeTab.set(index);
  }
}

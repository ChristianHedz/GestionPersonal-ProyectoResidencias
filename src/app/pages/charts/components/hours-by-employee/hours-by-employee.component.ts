import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ChartDataService } from '../../../../services/chart-data.service';
import { ChartTypeOption, EmployeeHoursData, WeekOption } from '../../../../interfaces/chart-data.interface';
import { AverageHoursPipe, MaxHoursPipe, MinHoursPipe } from '../../pipes/hours-stats.pipe';

@Component({
  selector: 'app-hours-by-employee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    AverageHoursPipe,
    MaxHoursPipe,
    MinHoursPipe,
    BaseChartDirective
  ],
  templateUrl: './hours-by-employee.component.html',
  styleUrl: './hours-by-employee.component.css'
})
export class HoursByEmployeeComponent {
  private chartDataService = inject(ChartDataService);
  private destroyRef = inject(DestroyRef);

  // State management with signals
  selectedWeek = signal<number>(1);
  selectedChartType = signal<ChartType>('bar');
  chartData = signal<EmployeeHoursData[]>([]);
  
  // Available chart types
  chartTypes = signal<ChartTypeOption[]>([
    { value: 'bar', label: 'Barras' },
    { value: 'line', label: 'Línea' },
    { value: 'radar', label: 'Radar' }
  ]);
  
  // Week options
  weekOptions = signal<WeekOption[]>([
    { value: 1, label: 'Semana 1' },
    { value: 2, label: 'Semana 2' },
    { value: 3, label: 'Semana 3' },
    { value: 4, label: 'Semana 4' }
  ]);

  // Chart configuration
  chartOptions = computed<ChartConfiguration['options']>(() => {
    const options: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        title: {
          display: true,
          text: 'Horas Trabajadas por Empleado'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y || 0;
              return `${label}: ${value} horas`;
            }
          }
        }
      }
    };

    if (this.selectedChartType() === 'radar') {
      return {
        ...options,
        scales: undefined,
        elements: {
          line: {
            borderWidth: 2
          }
        }
      };
    }

    return {
      ...options,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Horas'
          },
          suggestedMax: 40
        }
      }
    };
  });

  // Derived state for chart data
  chartDisplayData = computed<ChartData>(() => {
    const data = this.chartData();
    
    if (this.selectedChartType() === 'line' || this.selectedChartType() === 'bar') {
      return {
        labels: data.map(item => item.employeeName),
        datasets: [
          {
            data: data.map(item => item.hoursWorked),
            label: 'Horas Trabajadas',
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.3,
            borderWidth: 2,
            pointBackgroundColor: 'rgb(75, 192, 192)',
            pointBorderColor: '#fff'
          }
        ]
      };
    } else {
      // Radar chart
      return {
        labels: data.map(item => item.employeeName),
        datasets: [
          {
            data: data.map(item => item.hoursWorked),
            label: 'Horas Trabajadas',
            backgroundColor: 'rgba(75, 192, 192, 0.4)',
            borderColor: 'rgb(75, 192, 192)',
            pointBackgroundColor: 'rgb(75, 192, 192)',
            pointBorderColor: '#fff'
          }
        ]
      };
    }
  });

  constructor() {
    // Initialize data
    this.loadChartData();
    
    // Create effect to reload data when week changes
    effect(() => {
      const week = this.selectedWeek();
      this.loadChartData();
    });
  }

  // Load data for the selected week
  loadChartData(): void {
    this.chartDataService.getEmployeeHours(this.selectedWeek())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.chartData.set(data);
      });
  }

  // Change chart type
  onChartTypeChange(chartType: ChartType): void {
    this.selectedChartType.set(chartType as ChartType);
  }

  // Change selected week
  onWeekChange(week: number): void {
    this.selectedWeek.set(week);
  }
}

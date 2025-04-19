import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ChartDataService } from '../../../../services/chart-data.service';
import { ChartTypeOption, EmployeeVacationData } from '../../../../interfaces/chart-data.interface';
import { BaseChartDirective } from 'ng2-charts';
@Component({
  selector: 'app-vacations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonToggleModule,
    BaseChartDirective
  ],
  templateUrl: './vacations.component.html',
  styleUrl: './vacations.component.css'
})
export class VacationsComponent {
  private chartDataService = inject(ChartDataService);
  private destroyRef = inject(DestroyRef);

  // State management with signals
  selectedChartType = signal<ChartType>('bar');
  chartData = signal<EmployeeVacationData[]>([]);
  
  // Available chart types
  chartTypes = signal<ChartTypeOption[]>([
    { value: 'bar', label: 'Barras' },
    { value: 'pie', label: 'Circular' },
    { value: 'polarArea', label: 'Área Polar' }
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
          text: 'Vacaciones Disponibles por Empleado'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.label}: ${context.parsed.y || context.parsed || 0} días`;
            }
          }
        }
      }
    };

    if (this.selectedChartType() === 'bar') {
      return {
        ...options,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Días'
            },
            stacked: true
          },
          x: {
            stacked: true
          }
        }
      };
    } else {
      // For pie and polarArea charts
      return options;
    }
  });

  // Derived state for chart data based on chart type
  chartDisplayData = computed<ChartData>(() => {
    const data = this.chartData();
    
    if (this.selectedChartType() === 'bar') {
      return {
        labels: data.map(item => item.employeeName),
        datasets: [
          {
            data: data.map(item => item.vacationDaysAvailable),
            label: 'Días Disponibles',
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgb(75, 192, 192)',
          },
          {
            data: data.map(item => item.vacationDaysTaken),
            label: 'Días Tomados',
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgb(54, 162, 235)',
          }
        ]
      };
    } else {
      // For pie and polarArea charts, show only available days
      return {
        labels: data.map(item => item.employeeName),
        datasets: [
          {
            data: data.map(item => item.vacationDaysAvailable),
            label: 'Días Disponibles',
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 206, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)'
            ],
          }
        ]
      };
    }
  });

  constructor() {
    // Load vacation data on component initialization
    this.loadVacationData();
  }

  // Load vacation data
  loadVacationData(): void {
    this.chartDataService.getEmployeeVacations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.chartData.set(data);
      });
  }

  // Change chart type
  onChartTypeChange(chartType: ChartType): void {
    this.selectedChartType.set(chartType as ChartType);
  }
}

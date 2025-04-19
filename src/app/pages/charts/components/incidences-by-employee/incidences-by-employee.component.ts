import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ChartDataService } from '../../../../services/chart-data.service';
import { ChartTypeOption, EmployeeIncidenceData, WeekOption } from '../../../../interfaces/chart-data.interface';
import { CHART_TYPES } from '../../chart-config';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-incidences-by-employee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    BaseChartDirective,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
  ],
  templateUrl: './incidences-by-employee.component.html',
  styleUrls: ['./incidences-by-employee.component.css']
})
export class IncidencesByEmployeeComponent {
  private chartDataService = inject(ChartDataService);
  private destroyRef = inject(DestroyRef);

  // State management with signals
  selectedWeek = signal<number>(1);
  selectedChartType = signal<ChartType>(CHART_TYPES.HORIZONTAL_BAR);
  chartData = signal<EmployeeIncidenceData[]>([]);
  
  // Available chart types
  chartTypes = signal<ChartTypeOption[]>([
    { value: CHART_TYPES.BAR, label: 'Barras' },
    { value: CHART_TYPES.HORIZONTAL_BAR, label: 'Barras horizontales' },
    { value: CHART_TYPES.LINE, label: 'Línea' }
  ]);
  
  // Week options
  weekOptions = signal<WeekOption[]>([
    { value: 1, label: 'Semana 1' },
    { value: 2, label: 'Semana 2' },
    { value: 3, label: 'Semana 3' },
    { value: 4, label: 'Semana 4' }
  ]);

  // Chart configuration
  chartOptions = signal<ChartConfiguration['options']>({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true
      }
    },
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Incidencias por empleado'
      },
    }
  });

  // Derived state for chart data
  barChartData = computed<ChartData<'bar'>>(() => {
    const data = this.chartData();
    return {
      labels: data.map(item => item.employeeName),
      datasets: [
        {
          data: data.map(item => item.absences),
          label: 'Faltas',
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgb(255, 99, 132)',
        },
        {
          data: data.map(item => item.delays),
          label: 'Retardos',
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgb(54, 162, 235)',
        }
      ]
    };
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
    this.chartDataService.getEmployeeIncidences(this.selectedWeek())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.chartData.set(data);
      });
  }

  // Change chart type
  onChartTypeChange(chartType: string): void {
    this.selectedChartType.set(chartType as ChartType);
    
    // Update chart options based on chart type
    if (chartType === CHART_TYPES.HORIZONTAL_BAR) {
      this.chartOptions.update(current => ({
        ...current,
        indexAxis: 'y',
      }));
    } else {
      this.chartOptions.update(current => ({
        ...current,
        indexAxis: 'x',
      }));
    }
  }

  // Change selected week
  onWeekChange(week: number): void {
    this.selectedWeek.set(week);
  }
}

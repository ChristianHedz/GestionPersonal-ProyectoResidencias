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
import { ChartTypeOption, GeneralIncidenceData, WeekOption } from '../../../../interfaces/chart-data.interface';
import { CHART_TYPES } from '../../chart-config';

@Component({
  selector: 'app-general-incidences',
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
    BaseChartDirective
  ],
  templateUrl: './general-incidences.component.html',
  styleUrls: ['./general-incidences.component.css']
})
export class GeneralIncidencesComponent {
  private chartDataService = inject(ChartDataService);
  private destroyRef = inject(DestroyRef);

  // State management with signals
  selectedWeek = signal<number>(1);
  selectedChartType = signal<ChartType>(CHART_TYPES.BAR);
  chartData = signal<GeneralIncidenceData | null>(null);
  
  // Available chart types
  chartTypes = signal<ChartTypeOption[]>([
    { value: CHART_TYPES.BAR, label: 'Barras' },
    { value: CHART_TYPES.PIE, label: 'Circular' },
    { value: CHART_TYPES.DOUGHNUT, label: 'Dona' }
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
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Incidencias Generales'
      },
    }
  });

  // Derived state for chart data
  chartDisplayData = computed<ChartData>(() => {
    const data = this.chartData();
    
    if (!data) return { labels: [], datasets: [] };
    
    if (this.selectedChartType() === CHART_TYPES.BAR) {
      return {
        labels: ['Faltas', 'Retardos'],
        datasets: [
          {
            data: [data.totalAbsences, data.totalDelays],
            backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)'],
            borderColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
          }
        ]
      };
    } else {
      // For pie and doughnut charts
      return {
        labels: ['Faltas', 'Retardos'],
        datasets: [
          {
            data: [data.totalAbsences, data.totalDelays],
            backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)'],
            borderColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
            hoverOffset: 4
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
    this.chartDataService.getGeneralIncidences(this.selectedWeek())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.chartData.set(data);
      });
  }

  // Change chart type
  onChartTypeChange(chartType: string): void {
    this.selectedChartType.set(chartType as ChartType);
  }

  // Change selected week
  onWeekChange(week: number): void {
    this.selectedWeek.set(week);
  }
}

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChartDataService } from '../../../../../../core/services/chart-data.service';
import { ChartTypeOption, DateRange, GeneralIncidenceData } from '../../../../../../core/models/common/chart-data.interface';
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    BaseChartDirective
  ],
  templateUrl: './general-incidences.component.html',
  styleUrls: ['./general-incidences.component.css']
})
export class GeneralIncidencesComponent implements OnInit {
  private chartDataService = inject(ChartDataService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  // Form for date range
  dateRangeForm!: FormGroup;
  
  // State management with signals
  selectedDateRange = signal<DateRange>(this.getDefaultDateRange());
  selectedChartType = signal<ChartType>(CHART_TYPES.BAR);
  chartData = signal<GeneralIncidenceData | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Available chart types
  chartTypes = signal<ChartTypeOption[]>([
    { value: CHART_TYPES.BAR, label: 'Barras' },
    { value: CHART_TYPES.PIE, label: 'Circular' },
    { value: CHART_TYPES.DOUGHNUT, label: 'Dona' }
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

  ngOnInit(): void {
    // Initialize date range form
    const defaultRange = this.getDefaultDateRange();
    this.dateRangeForm = this.fb.group({
      startDate: [defaultRange.startDate],
      endDate: [defaultRange.endDate]
    });

    // Watch for date range changes
    this.dateRangeForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(range => {
        if (range.startDate && range.endDate) {
          this.onDateRangeChange({
            startDate: range.startDate,
            endDate: range.endDate
          });
        }
      });
    
    // Initialize data
    this.loadChartData();
  }

  // Helper function to get default date range (first day of month to current date)
  private getDefaultDateRange(): DateRange {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { startDate: firstDayOfMonth, endDate: today };
  }

  // Load data for the selected date range
  loadChartData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.chartDataService.getGeneralIncidences(this.selectedDateRange())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(err => {
          console.error('Error loading general incidence data:', err);
          this.error.set('Error al cargar los datos de incidencias generales. Por favor, intente nuevamente.');
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe(data => {
        if (data) {
          this.chartData.set(data);
        }
      });
  }

  // Change chart type
  onChartTypeChange(chartType: string): void {
    this.selectedChartType.set(chartType as ChartType);
  }

  // Change selected date range
  onDateRangeChange(dateRange: DateRange): void {
    this.selectedDateRange.set(dateRange);
    this.loadChartData();
  }
}

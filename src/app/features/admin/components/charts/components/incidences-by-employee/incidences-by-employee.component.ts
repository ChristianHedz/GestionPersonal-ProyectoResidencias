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
import { MatSelectModule } from '@angular/material/select';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ChartDataService } from '../../../../../../core/services/chart-data.service';
import { AttendanceStats, ChartTypeOption, DateRange } from '../../../../../../core/models/common/chart-data.interface';
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
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './incidences-by-employee.component.html',
  styleUrls: ['./incidences-by-employee.component.css']
})
export class IncidencesByEmployeeComponent implements OnInit {
  private chartDataService = inject(ChartDataService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  // Form for date range
  dateRangeForm!: FormGroup;
  
  // State management with signals
  selectedDateRange = signal<DateRange>(this.getDefaultDateRange());
  selectedChartType = signal<ChartType>(CHART_TYPES.HORIZONTAL_BAR);
  chartData = signal<AttendanceStats[]>([]);
  
  // Available chart types
  chartTypes = signal<ChartTypeOption[]>([
    { value: CHART_TYPES.BAR, label: 'Barras' },
    { value: CHART_TYPES.HORIZONTAL_BAR, label: 'Horizontales' },
    { value: CHART_TYPES.LINE, label: 'Línea' }
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
      labels: data.map(item => item.fullName),
      datasets: [
        {
          data: data.map(item => item.absenceCount),
          label: 'Faltas',
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgb(255, 99, 132)',
        },
        {
          data: data.map(item => item.lateCount),
          label: 'Retardos',
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgb(54, 162, 235)',
        }
      ]
    };
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
    this.chartDataService.getEmployeeAttendanceStats(this.selectedDateRange())
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

  // Change selected date range
  onDateRangeChange(dateRange: DateRange): void {
    this.selectedDateRange.set(dateRange);
    this.loadChartData();
  }
}

import { Chart, ChartType, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

// Custom horizontal bar chart type
export enum CHART_TYPES {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  RADAR = 'radar',
  POLAR_AREA = 'polarArea',
  HORIZONTAL_BAR = 'bar' // alias for horizontal bars: use 'bar' type with indexAxis 'y'
}

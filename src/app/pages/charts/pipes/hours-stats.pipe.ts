import { Pipe, PipeTransform } from '@angular/core';
import { EmployeeHoursData } from '../../../interfaces/chart-data.interface';

@Pipe({
  name: 'averageHours',
  standalone: true
})
export class AverageHoursPipe implements PipeTransform {
  transform(hours: EmployeeHoursData[]): number {
    if (!hours || hours.length === 0) return 0;
    const total = hours.reduce((sum, item) => sum + item.hoursWorked, 0);
    return total / hours.length;
  }
}

@Pipe({
  name: 'maxHours',
  standalone: true
})
export class MaxHoursPipe implements PipeTransform {
  transform(hours: EmployeeHoursData[]): number {
    if (!hours || hours.length === 0) return 0;
    return Math.max(...hours.map(item => item.hoursWorked));
  }
}

@Pipe({
  name: 'minHours',
  standalone: true
})
export class MinHoursPipe implements PipeTransform {
  transform(hours: EmployeeHoursData[]): number {
    if (!hours || hours.length === 0) return 0;
    return Math.min(...hours.map(item => item.hoursWorked));
  }
}

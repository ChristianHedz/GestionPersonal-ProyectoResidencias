export interface EmployeeIncidenceData {
  employeeId: number;
  employeeName: string;
  absences: number;
  delays: number;
  week: number;
}

export interface GeneralIncidenceData {
  week: number;
  totalAbsences: number;
  totalDelays: number;
  employeeCount: number;
}

export interface EmployeeHoursData {
  employeeId: number;
  employeeName: string;
  hoursWorked: number;
  week: number;
}

export interface EmployeeVacationData {
  employeeId: number;
  employeeName: string;
  vacationDaysAvailable: number;
  vacationDaysTaken: number;
  vacationDaysTotal: number;
}

export interface ChartTypeOption {
  value: string;
  label: string;
}

export interface WeekOption {
  value: number;
  label: string;
}

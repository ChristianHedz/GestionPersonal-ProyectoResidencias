export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface EmployeeIncidenceData {
  employeeId: number;
  employeeName: string;
  absences: number;
  delays: number;
  date: Date;
}

export interface GeneralIncidenceData {
  date: Date;
  totalAbsences: number;
  totalDelays: number;
  employeeCount: number;
}

export interface EmployeeHoursData {
  employeeId: number;
  employeeName: string;
  hoursWorked: number;
  date: Date;
}

export interface EmployeeVacationData {
  employeeName: string;
  vacationDaysAvailable: number;
  vacationDaysTaken: number;
  vacationDaysTotal: number;
}

/**
 * Interface for the available vacation days backend response
 */
export interface AvailableVacationsResponse {
  fullName: string;
  availableVacationDays: number;
}

export interface ChartTypeOption {
  value: string;
  label: string;
}

/**
 * Interface para las estadísticas de asistencia de los empleados
 * devueltas por el endpoint de incidencias
 */
export interface AttendanceStats {
  fullName: string;
  lateCount: number;
  absenceCount: number;
}

/**
 * Interface para las estadísticas generales de asistencia
 * devueltas por el endpoint de incidencias generales
 */
export interface GeneralAttendanceStats {
  totalAbsences: number;
  totalTardiness: number;
}

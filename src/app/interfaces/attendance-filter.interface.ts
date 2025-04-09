export type AttendanceIncidents = 'all' | 'attendance' | 'absences' | 'delays';

export type SortOrder = 'asc' | 'desc';

export interface AttendanceFilterParams {
    page?: number;
    size?: number;
    employeeId?: number;
    attendanceIncidents?: AttendanceIncidents;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
  }
export type AttendanceType = 'all' | 'attendance' | 'absences' | 'delays';

export type SortOrder = 'asc' | 'desc';

export interface AttendanceFilterParams {
    page?: number;
    size?: number;
    employeeId?: number;
    attendanceType?: AttendanceType;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
  }
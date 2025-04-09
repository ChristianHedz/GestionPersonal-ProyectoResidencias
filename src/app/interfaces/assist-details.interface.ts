/**
 * Interface representing attendance details for an employee
 */
export interface AssistDetailsDTO {
  id: number;
  date: string; // ISO format date YYYY-MM-DD
  entryTime: string; // Format HH:MM:SS
  exitTime: string; // Format HH:MM:SS
  incidents: string;
  reason: string;
  workedHours: number;
  fullName: string;
}

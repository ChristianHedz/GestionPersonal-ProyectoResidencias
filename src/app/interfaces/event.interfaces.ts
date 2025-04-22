import { EmployeeDTO } from '../auth/interfaces/EmployeeDTO';

/**
 * Enum representing different types of events
 */
export enum EventType {
  MEETING = 'REUNION',
  HOLIDAY = 'FESTIVO',
  TRAINING = 'CAPACITACION',
  OTHER = 'OTRO'
}

/**
 * Interface representing an event in the system
 */
export interface Event {
  id?: number;
  title: string;
  description: string;
  startDate: Date | string;
  endDate: Date | string;
  eventType: EventType;
  color: string;
  allDay: boolean;
  participants: EmployeeDTO[];
}

/**
 * Interface for event creation/update
 */
export interface EventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  eventType: EventType;
  color: string;
  allDay: boolean;
  participantIds: number[];
}

/**
 * Interface for FullCalendar event representation
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  description: string;
  eventType: EventType;
  participants: EmployeeDTO[];
}

/**
 * Interface for API responses
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

import { EventType } from '../common/event.interfaces'; // Importar EventType

export interface CalendarEventDTO {
  id?: number; // Opcional, ya que no se envía al crear un evento nuevo
  title: string;
  description?: string; // Asumo que la descripción puede ser opcional
  startDate: string; // Se espera una cadena en formato ISO (e.g., "AAAA-MM-DDTHH:mm:ss")
  endDate: string;   // Se espera una cadena en formato ISO
  eventType: EventType; // Cambiado a EventType enum
  employeeIds: number[];
} 
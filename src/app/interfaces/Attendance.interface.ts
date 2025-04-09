export interface Attendance {
    id: number;
    date: string;
    entryTime: string;
    exitTime: string;
    incidents: string;
    reason: string;
    workedHours: number;
    fullName: string;
}
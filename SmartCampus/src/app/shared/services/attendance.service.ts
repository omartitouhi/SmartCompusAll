import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceRequest {
  scheduleId: number;
  studentId: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  comment?: string;
}

export interface AttendanceResponse {
  id: number;
  scheduleId: number;
  subjectName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  studentId: number;
  studentName: string;
  date: string;
  status: AttendanceStatus;
  comment: string | null;
  recordedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly teacherBase = '/api/teacher';
  private readonly studentBase = '/api/student';

  constructor(private http: HttpClient) {}

  /** Teacher: save or update attendance for a student */
  saveAttendance(userId: number, request: AttendanceRequest): Observable<AttendanceResponse> {
    return this.http.post<AttendanceResponse>(`${this.teacherBase}/${userId}/attendance`, request);
  }

  /** Teacher: get all attendance records for a schedule slot on a date */
  getAttendanceByScheduleAndDate(userId: number, scheduleId: number, date: string): Observable<AttendanceResponse[]> {
    return this.http.get<AttendanceResponse[]>(
      `${this.teacherBase}/${userId}/attendance/schedule/${scheduleId}?date=${date}`
    );
  }

  /** Teacher: delete an attendance record */
  deleteAttendance(userId: number, attendanceId: number): Observable<void> {
    return this.http.delete<void>(`${this.teacherBase}/${userId}/attendance/${attendanceId}`);
  }

  /** Student: get own attendance history */
  getStudentAttendance(userId: number): Observable<AttendanceResponse[]> {
    return this.http.get<AttendanceResponse[]>(`${this.studentBase}/${userId}/attendance`);
  }

  statusLabel(status: AttendanceStatus): string {
    switch (status) {
      case 'PRESENT': return 'Présent';
      case 'ABSENT': return 'Absent';
      case 'LATE': return 'En retard';
      default: return status;
    }
  }

  statusClass(status: AttendanceStatus): string {
    switch (status) {
      case 'PRESENT': return 'present';
      case 'ABSENT': return 'absent';
      case 'LATE': return 'late';
      default: return '';
    }
  }
}

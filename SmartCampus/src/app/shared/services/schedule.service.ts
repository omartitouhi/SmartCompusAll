import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScheduleRequest {
  classId: number;
  teacherId: number;
  subjectId: number;
  dayOfWeek: string;
  startTime: string; // "HH:MM:SS"
  endTime: string;   // "HH:MM:SS"
  room?: string;
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string;   // "YYYY-MM-DD"
}

export interface ScheduleResponse {
  id: number;
  classId: number;
  className: string;
  filiereName: string;
  level: string;
  teacherId: number;
  teacherName: string;
  subjectId: number;
  subjectName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string | null;
  startDate: string | null; // "YYYY-MM-DD"
  endDate: string | null;   // "YYYY-MM-DD"
}

export interface SchoolClassResponse {
  id: number;
  className: string;
  fullClassName: string;
  filiereName: string;
  level: string;
  capacity: number;
  currentSize: number;
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly adminBase = '/api/admin';
  private readonly studentBase = '/api/student';
  private readonly teacherBase = '/api/teacher';

  constructor(private http: HttpClient) {}

  // Admin schedule CRUD
  createSchedule(request: ScheduleRequest): Observable<ScheduleResponse> {
    return this.http.post<ScheduleResponse>(`${this.adminBase}/schedules`, request);
  }

  getAllSchedules(): Observable<ScheduleResponse[]> {
    return this.http.get<ScheduleResponse[]>(`${this.adminBase}/schedules`);
  }

  getSchedulesByClass(classId: number): Observable<ScheduleResponse[]> {
    return this.http.get<ScheduleResponse[]>(`${this.adminBase}/schedules/class/${classId}`);
  }

  getSchedulesByTeacher(teacherId: number): Observable<ScheduleResponse[]> {
    return this.http.get<ScheduleResponse[]>(`${this.adminBase}/schedules/teacher/${teacherId}`);
  }

  updateSchedule(id: number, request: ScheduleRequest): Observable<ScheduleResponse> {
    return this.http.put<ScheduleResponse>(`${this.adminBase}/schedules/${id}`, request);
  }

  deleteSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminBase}/schedules/${id}`);
  }

  getAllClasses(): Observable<SchoolClassResponse[]> {
    return this.http.get<SchoolClassResponse[]>(`${this.adminBase}/classes`);
  }

  // Student-facing
  getStudentSchedule(userId: number): Observable<ScheduleResponse[]> {
    return this.http.get<ScheduleResponse[]>(`${this.studentBase}/${userId}/schedule`);
  }

  getStudentInfo(userId: number): Observable<any> {
    return this.http.get<any>(`${this.studentBase}/${userId}/info`);
  }

  // Teacher-facing
  getTeacherSchedule(userId: number): Observable<ScheduleResponse[]> {
    return this.http.get<ScheduleResponse[]>(`${this.teacherBase}/${userId}/schedule`);
  }

  getTeacherInfo(userId: number): Observable<any> {
    return this.http.get<any>(`${this.teacherBase}/${userId}/info`);
  }

  getStudentsByClass(teacherUserId: number, classId: number): Observable<{ studentId: number; studentName: string }[]> {
    return this.http.get<{ studentId: number; studentName: string }[]>(
      `${this.teacherBase}/${teacherUserId}/classes/${classId}/students`
    );
  }
}

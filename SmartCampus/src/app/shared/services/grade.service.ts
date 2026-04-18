import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GradeRequest {
  studentId: number;
  subjectId: number;
  classId: number;
  value: number;
  comment?: string;
  evaluationType: string;
  evaluationDate: string; // ISO date string "YYYY-MM-DD"
}

export interface GradeResponse {
  id: number;
  studentId: number;
  studentName: string;
  subjectId: number;
  subjectName: string;
  classId: number;
  className: string;
  teacherId: number;
  teacherName: string;
  value: number;
  comment: string | null;
  evaluationType: string;
  evaluationDate: string;
}

@Injectable({ providedIn: 'root' })
export class GradeService {
  private readonly teacherBase = '/api/teacher';
  private readonly studentBase = '/api/student';

  constructor(private http: HttpClient) {}

  // Teacher endpoints
  addGrade(teacherUserId: number, request: GradeRequest): Observable<GradeResponse> {
    return this.http.post<GradeResponse>(`${this.teacherBase}/${teacherUserId}/grades`, request);
  }

  getGradesByTeacher(teacherUserId: number): Observable<GradeResponse[]> {
    return this.http.get<GradeResponse[]>(`${this.teacherBase}/${teacherUserId}/grades`);
  }

  getGradesByClassAndSubject(teacherUserId: number, classId: number, subjectId: number): Observable<GradeResponse[]> {
    return this.http.get<GradeResponse[]>(
      `${this.teacherBase}/${teacherUserId}/grades/class/${classId}/subject/${subjectId}`
    );
  }

  updateGrade(teacherUserId: number, gradeId: number, request: GradeRequest): Observable<GradeResponse> {
    return this.http.put<GradeResponse>(`${this.teacherBase}/${teacherUserId}/grades/${gradeId}`, request);
  }

  deleteGrade(teacherUserId: number, gradeId: number): Observable<void> {
    return this.http.delete<void>(`${this.teacherBase}/${teacherUserId}/grades/${gradeId}`);
  }

  // Student endpoint
  getStudentGrades(studentUserId: number): Observable<GradeResponse[]> {
    return this.http.get<GradeResponse[]>(`${this.studentBase}/${studentUserId}/grades`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, TimeoutError, catchError, throwError, timeout } from 'rxjs';
import { Subject } from './subject.service';

export interface TeacherRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
  subjectNames: string[];
}

export interface TeacherResponse {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  subjects: Subject[];
}

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private readonly baseUrl = '/api/admin/teachers';

  constructor(private http: HttpClient) {}

  getAllTeachers(): Observable<TeacherResponse[]> {
    return this.http.get<TeacherResponse[]>(this.baseUrl).pipe(
      timeout(10000),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          return throwError(() => ({ message: 'Le chargement des enseignants a expiré. Vérifiez le backend / proxy API.' }));
        }
        return throwError(() => error);
      })
    );
  }

  getTeacherById(id: number): Observable<TeacherResponse> {
    return this.http.get<TeacherResponse>(`${this.baseUrl}/${id}`);
  }

  createTeacher(request: TeacherRequest): Observable<TeacherResponse> {
    return this.http.post<TeacherResponse>(this.baseUrl, request);
  }

  updateTeacher(id: number, request: TeacherRequest): Observable<TeacherResponse> {
    return this.http.put<TeacherResponse>(`${this.baseUrl}/${id}`, request);
  }

  deleteTeacher(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

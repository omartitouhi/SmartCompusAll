import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SubjectRequest {
  name: string;
  description?: string;
}

export interface Subject {
  id?: number;
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private readonly baseUrl = '/api/admin/subjects';

  constructor(private http: HttpClient) {}

  getAllSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(this.baseUrl);
  }

  getSubjectById(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.baseUrl}/${id}`);
  }

  createSubject(request: SubjectRequest): Observable<Subject> {
    return this.http.post<Subject>(this.baseUrl, request);
  }

  updateSubject(id: number, request: SubjectRequest): Observable<Subject> {
    return this.http.put<Subject>(`${this.baseUrl}/${id}`, request);
  }

  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

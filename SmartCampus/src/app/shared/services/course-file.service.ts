import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, timeout } from 'rxjs';

export interface CourseFileResponse {
  id: number;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  subjectName: string;
  className: string;
  teacherName: string;
  uploadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CourseFileService {
  constructor(private http: HttpClient) {}

  uploadFile(teacherUserId: number, subjectId: number, classId: number, file: File): Observable<CourseFileResponse> {
    const form = new FormData();
    form.append('file', file);
    form.append('subjectId', subjectId.toString());
    form.append('classId', classId.toString());
    return this.http.post<CourseFileResponse>(`/api/teacher/${teacherUserId}/files`, form);
  }

  getTeacherFiles(teacherUserId: number): Observable<CourseFileResponse[]> {
    return this.http.get<unknown>(`/api/teacher/${teacherUserId}/files`).pipe(
      timeout(10000),
      map((data) => Array.isArray(data) ? data as CourseFileResponse[] : [])
    );
  }

  deleteFile(teacherUserId: number, fileId: number): Observable<void> {
    return this.http.delete<void>(`/api/teacher/${teacherUserId}/files/${fileId}`);
  }

  getStudentFiles(studentUserId: number): Observable<CourseFileResponse[]> {
    return this.http.get<unknown>(`/api/student/${studentUserId}/files`).pipe(
      timeout(10000),
      map((data) => Array.isArray(data) ? data as CourseFileResponse[] : [])
    );
  }

  getDownloadUrl(studentUserId: number, fileId: number): string {
    return `/api/student/${studentUserId}/files/${fileId}/download`;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  }
}

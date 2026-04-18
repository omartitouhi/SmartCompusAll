import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Level = 
  'FIRST_YEAR_PREPARATORY' | 
  'SECOND_YEAR_PREPARATORY' | 
  'FIRST_YEAR_ENGINEERING' | 
  'SECOND_YEAR_ENGINEERING' | 
  'THIRD_YEAR_ENGINEERING';

export interface Student {
  id?: number;
  userId?: number;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  schoolYear: string;
  dateOfBirth: string;
  cin: string;
  level: Level;
  filiereName: string;
  className?: string;
}

export interface StudentSearchParams {
  email?: string;
  firstName?: string;
  lastName?: string;
  cin?: string;
  level?: string;
  filiereName?: string;
  schoolYear?: string;
  className?: string;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly baseUrl = '/api/admin/students';

  constructor(private http: HttpClient) {}

  // Créer un étudiant
  createStudent(student: Student): Observable<Student> {
    return this.http.post<Student>(this.baseUrl, student);
  }

  // Récupérer tous les étudiants
  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.baseUrl);
  }

  // Récupérer un étudiant par ID
  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/${id}`);
  }

  // Rechercher des étudiants avec plusieurs critères
  searchStudents(params: StudentSearchParams): Observable<Student[]> {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key as keyof StudentSearchParams];
      if (value) {
        httpParams = httpParams.set(key, value);
      }
    });

    return this.http.get<Student[]>(`${this.baseUrl}/search`, { params: httpParams });
  }

  // Récupérer les étudiants d'une classe
  getStudentsByClass(classId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/class/${classId}`);
  }

  // Mettre à jour un étudiant
  updateStudent(id: number, student: Student): Observable<Student> {
    return this.http.put<Student>(`${this.baseUrl}/${id}`, student);
  }

  // Supprimer un étudiant
  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

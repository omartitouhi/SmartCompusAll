import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, TimeoutError, catchError, throwError, timeout } from 'rxjs';

export interface FiliereRequest {
  name: string;
  description?: string;
}

export interface Filiere {
  id?: number;
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class FiliereService {
  private readonly baseUrl = '/api/admin/filieres';

  constructor(private http: HttpClient) {}

  getAllFilieres(): Observable<Filiere[]> {
    return this.http.get<Filiere[]>(this.baseUrl).pipe(
      timeout(10000),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          return throwError(() => ({ message: 'Le chargement des filières a expiré. Vérifiez le backend / proxy API.' }));
        }
        return throwError(() => error);
      })
    );
  }

  getFiliereById(id: number): Observable<Filiere> {
    return this.http.get<Filiere>(`${this.baseUrl}/${id}`);
  }

  createFiliere(request: FiliereRequest): Observable<Filiere> {
    return this.http.post<Filiere>(this.baseUrl, request);
  }

  updateFiliere(id: number, request: FiliereRequest): Observable<Filiere> {
    return this.http.put<Filiere>(`${this.baseUrl}/${id}`, request);
  }

  deleteFiliere(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

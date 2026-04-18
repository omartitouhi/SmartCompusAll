import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, TimeoutError, catchError, map, tap, throwError, timeout } from 'rxjs';

export type Role = 'student' | 'teacher' | 'admin';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginApiResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const STORAGE_KEY = 'smartcampus_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly loginUrl = '/api/auth/login';
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadFromStorage());

  constructor(private http: HttpClient) {}

  private loadFromStorage(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(user: User): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch { /* ignore */ }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<LoginApiResponse>(this.loginUrl, credentials).pipe(
      timeout(10000),
      map((response) => ({
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: this.mapBackendRole(response.role)
      })),
      tap((user) => {
        this.saveToStorage(user);
        this.currentUserSubject.next(user);
      }),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          return throwError(() => ({ message: 'Login request timed out. Check backend/CORS.' }));
        }
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
  }

  get currentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getRole(): Role | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  private mapBackendRole(role: string): Role {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'admin';
      case 'TEACHER':
        return 'teacher';
      case 'STUDENT':
        return 'student';
      default:
        throw new Error(`Unsupported role returned by backend: ${role}`);
    }
  }
}

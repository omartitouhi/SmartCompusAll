import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PasswordResetRequestItem {
  id: number;
  email: string;
  requestedAt: string;
  seen: boolean;
}

@Injectable({ providedIn: 'root' })
export class PasswordResetRequestService {
  constructor(private http: HttpClient) {}

  /** Soumettre une demande (page login, public) */
  submitRequest(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/auth/password-reset-request', { email });
  }

  /** Récupérer toutes les demandes (admin) */
  getRequests(): Observable<PasswordResetRequestItem[]> {
    return this.http.get<PasswordResetRequestItem[]>('/api/admin/password-reset-requests');
  }

  /** Compter les demandes non vues (admin) */
  getUnseenCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>('/api/admin/password-reset-requests/unseen-count');
  }

  /** Marquer comme vue (admin) */
  markAsSeen(id: number): Observable<void> {
    return this.http.put<void>(`/api/admin/password-reset-requests/${id}/seen`, {});
  }
}

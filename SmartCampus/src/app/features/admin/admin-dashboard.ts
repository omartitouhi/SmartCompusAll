import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { PasswordResetRequestService, PasswordResetRequestItem } from '../../shared/services/password-reset-request.service';
import { CommonModule, DatePipe } from '@angular/common';
import { interval, Subscription, switchMap, startWith } from 'rxjs';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AdminDashboard implements OnInit, OnDestroy {
  adminName: string = '';
  adminFirstName: string = '';
  profileOpen = false;
  notifOpen = false;
  unseenCount = 0;
  resetRequests: PasswordResetRequestItem[] = [];
  private pollSub: Subscription | null = null;

  dashboardCards: DashboardCard[] = [
    { title: 'Gestion des Étudiants',   description: 'Créer, rechercher et gérer les étudiants',   icon: '👥',   route: '/admin/students',   color: '#4CAF50' },
    { title: 'Gestion des Enseignants', description: 'Créer, rechercher et gérer les enseignants', icon: '👨‍🏫', route: '/admin/teachers',   color: '#2196F3' },
    { title: 'Gestion des Filières',    description: 'Gérer les filières des étudiants',            icon: '🎓',   route: '/admin/filieres',   color: '#4CAF50' },
    { title: 'Gestion des Matières',    description: 'Gérer les matières enseignées',               icon: '📚',   route: '/admin/subjects',   color: '#FF9800' },
    { title: 'Emplois du Temps',        description: 'Créer et gérer les créneaux horaires',        icon: '🗓️',  route: '/admin/schedules',  color: '#6366F1' },
    { title: 'Statistiques',            description: 'Consulter les statistiques et rapports',      icon: '📊',   route: '/admin/statistics', color: '#9C27B0' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private passwordResetService: PasswordResetRequestService,
    private cdr: ChangeDetectorRef
  ) {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.adminName      = `${user.firstName} ${user.lastName}`;
        this.adminFirstName = user.firstName;
      }
    });
  }

  ngOnInit(): void {
    this.pollSub = interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => this.passwordResetService.getRequests())
      )
      .subscribe({
        next: (list) => {
          this.resetRequests = list;
          this.unseenCount   = list.filter(r => !r.seen).length;
          this.cdr.detectChanges(); // forcer la mise à jour de la vue (zoneless)
        },
        error: (err) => console.error('[Admin] Erreur polling notifications:', err)
      });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  toggleNotif(): void {
    this.notifOpen = !this.notifOpen;
    if (this.profileOpen) this.profileOpen = false;
  }

  markSeen(id: number): void {
    this.passwordResetService.markAsSeen(id).subscribe({
      next: () => {
        const req = this.resetRequests.find(r => r.id === id);
        if (req) {
          req.seen = true;
          this.unseenCount = Math.max(0, this.unseenCount - 1);
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.notifOpen   = false;
    this.profileOpen = false;
  }

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
    if (this.profileOpen) this.notifOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth';
import { ScheduleService, ScheduleResponse } from '../../shared/services/schedule.service';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi', FRIDAY: 'Vendredi'
};

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-dashboard.html',
  styleUrl: './teacher-dashboard.scss',
})
export class TeacherDashboard implements OnInit {
  userName = '';
  userFirstName = '';
  userEmail = '';
  userId: number | null = null;
  teacherInfo: any = null;
  schedules: ScheduleResponse[] = [];
  loading = true;
  error = '';
  profileOpen = false;

  days = DAYS;
  dayLabels = DAY_LABELS;

  constructor(
    private authService: AuthService,
    private scheduleService: ScheduleService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    if (user) {
      this.userName      = `${user.firstName} ${user.lastName}`;
      this.userFirstName = user.firstName;
      this.userEmail     = user.email;
      this.userId        = user.id;
      this.loadData(user.id);
    } else {
      this.router.navigate(['/']);
    }
  }

  loadData(userId: number): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      info:      this.scheduleService.getTeacherInfo(userId).pipe(catchError(() => of(null))),
      schedules: this.scheduleService.getTeacherSchedule(userId).pipe(catchError(() => of([]))),
    }).subscribe({
      next: (results) => {
        this.teacherInfo = results.info;
        this.schedules   = results.schedules as ScheduleResponse[];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error   = 'Erreur lors du chargement des données.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getScheduleForDay(day: string): ScheduleResponse[] {
    const colIdx = DAYS.indexOf(day);
    const monday = this.getMonday(new Date());
    const colDate = new Date(monday);
    colDate.setDate(monday.getDate() + colIdx);
    const colDateStr = this.toYMD(colDate);

    return this.schedules
      .filter(s => {
        if (s.dayOfWeek !== day) return false;
        if (!s.startDate && !s.endDate) return true;
        const sd = s.startDate ?? '0000-01-01';
        const ed = s.endDate   ?? '9999-12-31';
        return colDateStr >= sd && colDateStr <= ed;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private toYMD(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  get uniqueSubjects(): string[] {
    return [...new Set(this.schedules.map(s => s.subjectName))];
  }

  get uniqueClasses(): string[] {
    return [...new Set(this.schedules.map(s => s.className))];
  }

  formatTime(t: string): string {
    return t ? t.substring(0, 5) : '';
  }

  dayLabel(d: string): string {
    return DAY_LABELS[d] ?? d;
  }

  goToSchedule(): void {
    this.router.navigate(['/teacher/schedule']);
  }

  goToGrades(): void {
    this.router.navigate(['/teacher/grades']);
  }

  goToFiles(): void {
    this.router.navigate(['/teacher/files']);
  }

  goToAttendance(): void {
    this.router.navigate(['/teacher/attendance']);
  }

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.avatar-wrap')) {
      this.profileOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

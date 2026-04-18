import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth';
import { ScheduleService, ScheduleResponse } from '../../shared/services/schedule.service';
import { GradeService, GradeResponse } from '../../shared/services/grade.service';
import { CourseFileService, CourseFileResponse } from '../../shared/services/course-file.service';
import { AttendanceService, AttendanceResponse } from '../../shared/services/attendance.service';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi', FRIDAY: 'Vendredi', SATURDAY: 'Samedi'
};

interface GradesBySubject {
  subjectName: string;
  grades: GradeResponse[];
  average: string;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.scss',
})
export class StudentDashboard implements OnInit {
  userName = '';
  userFirstName = '';
  userEmail = '';
  userId: number | null = null;
  studentInfo: any = null;
  schedules: ScheduleResponse[] = [];
  loading = true;
  error = '';
  profileOpen = false;

  // Grades
  gradesBySubject: GradesBySubject[] = [];

  // Course files
  courseFiles: CourseFileResponse[] = [];

  // Attendance
  attendanceRecords: AttendanceResponse[] = [];

  days = DAYS;
  dayLabels = DAY_LABELS;

  constructor(
    private authService: AuthService,
    private scheduleService: ScheduleService,
    private gradeService: GradeService,
    private courseFileService: CourseFileService,
    private attendanceService: AttendanceService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    if (user) {
      this.userName      = `${user.firstName} ${user.lastName}`;
      this.userFirstName = user.firstName;
      this.userEmail     = user.email;
      this.userId    = user.id;
      this.loadData(user.id);
    } else {
      this.router.navigate(['/']);
    }
  }

  loadData(userId: number): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      info:       this.scheduleService.getStudentInfo(userId).pipe(catchError(() => of(null))),
      schedules:  this.scheduleService.getStudentSchedule(userId).pipe(catchError(() => of([]))),
      grades:     this.gradeService.getStudentGrades(userId).pipe(catchError(() => of([]))),
      files:      this.courseFileService.getStudentFiles(userId).pipe(catchError(() => of([]))),
      attendance: this.attendanceService.getStudentAttendance(userId).pipe(catchError(() => of([]))),
    }).subscribe({
      next: (results) => {
        this.studentInfo       = results.info;
        this.schedules         = results.schedules as ScheduleResponse[];
        this.gradesBySubject   = this.groupBySubject(results.grades as GradeResponse[]);
        this.courseFiles       = results.files as CourseFileResponse[];
        this.attendanceRecords = results.attendance as AttendanceResponse[];
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

  groupBySubject(grades: GradeResponse[]): GradesBySubject[] {
    const map = new Map<string, GradeResponse[]>();
    grades.forEach(g => {
      if (!map.has(g.subjectName)) map.set(g.subjectName, []);
      map.get(g.subjectName)!.push(g);
    });
    return Array.from(map.entries()).map(([subjectName, gradeList]) => {
      const avg = gradeList.reduce((sum, g) => sum + g.value, 0) / gradeList.length;
      return { subjectName, grades: gradeList, average: avg.toFixed(2) };
    });
  }

  get recentGrades(): GradeResponse[] {
    const all = [...this.gradesBySubject.flatMap(g => g.grades)];
    return all
      .sort((a, b) => b.evaluationDate.localeCompare(a.evaluationDate))
      .slice(0, 9);
  }

  overallAverage(): string {
    const allGrades = this.gradesBySubject.flatMap(g => g.grades);
    if (allGrades.length === 0) return '—';
    const avg = allGrades.reduce((sum, g) => sum + g.value, 0) / allGrades.length;
    return avg.toFixed(2);
  }

  gradeColor(value: number): string {
    if (value >= 14) return 'good';
    if (value >= 10) return 'average';
    return 'fail';
  }

  getScheduleForDay(day: string): ScheduleResponse[] {
    // Find the actual calendar date for this day in the current week
    const colIdx = DAYS.indexOf(day);
    const monday = this.getMonday(new Date());
    const colDate = new Date(monday);
    colDate.setDate(monday.getDate() + colIdx);
    const colDateStr = this.toYMD(colDate);

    return this.schedules
      .filter(s => {
        if (s.dayOfWeek !== day) return false;
        // Legacy schedules with no date range always display
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

  formatTime(t: string): string {
    return t ? t.substring(0, 5) : '';
  }

  dayLabel(d: string): string {
    return DAY_LABELS[d] ?? d;
  }

  getDownloadUrl(fileId: number): string {
    return this.courseFileService.getDownloadUrl(this.userId!, fileId);
  }

  formatSize(bytes: number): string {
    return this.courseFileService.formatSize(bytes);
  }

  attendanceStatusLabel(status: string): string {
    return this.attendanceService.statusLabel(status as any);
  }

  attendanceStatusClass(status: string): string {
    return this.attendanceService.statusClass(status as any);
  }

  get attendanceStats(): { present: number; absent: number; late: number; total: number; rate: string } {
    const total = this.attendanceRecords.length;
    const present = this.attendanceRecords.filter(r => r.status === 'PRESENT').length;
    const absent = this.attendanceRecords.filter(r => r.status === 'ABSENT').length;
    const late = this.attendanceRecords.filter(r => r.status === 'LATE').length;
    const rate = total > 0 ? (((present + late) / total) * 100).toFixed(0) : '—';
    return { present, absent, late, total, rate };
  }

  formatEvalType(type: string): string {
    return type.replace(/_/g, ' ');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const months = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
    return `${d.getDate().toString().padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  goToSchedule(): void {
    this.router.navigate(['/student/schedule']);
  }

  goToGrades(): void {
    this.router.navigate(['/student/grades']);
  }

  goToFiles(): void {
    this.router.navigate(['/student/files']);
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

  formatLevel(level: string): string {
    const map: Record<string, string> = {
      'FIRST_YEAR_ENGINEERING':  '1ère année ingénieur',
      'SECOND_YEAR_ENGINEERING': '2ème année ingénieur',
      'THIRD_YEAR_ENGINEERING':  '3ème année ingénieur',
      'FIRST_YEAR_MASTER':       '1ère année master',
      'SECOND_YEAR_MASTER':      '2ème année master',
      'FIRST_YEAR_LICENCE':      '1ère année licence',
      'SECOND_YEAR_LICENCE':     '2ème année licence',
      'THIRD_YEAR_LICENCE':      '3ème année licence',
    };
    return map[level] ?? level;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

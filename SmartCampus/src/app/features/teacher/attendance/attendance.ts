import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ScheduleService, ScheduleResponse } from '../../../shared/services/schedule.service';
import { AttendanceService, AttendanceResponse, AttendanceStatus } from '../../../shared/services/attendance.service';
import { catchError, finalize, of, timeout } from 'rxjs';

interface StudentAttendanceRow {
  studentId: number;
  studentName: string;
  status: AttendanceStatus;
  comment: string;
  attendanceId: number | null;
  saved: boolean;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.scss',
})
export class AttendanceComponent implements OnInit {
  userId: number | null = null;
  schedules: ScheduleResponse[] = [];
  selectedScheduleId: number | null = null;
  selectedDate: string = new Date().toISOString().substring(0, 10);

  rows: StudentAttendanceRow[] = [];
  loading = false;
  saving = false;
  loadingSchedules = true;
  error = '';
  successMsg = '';

  statusOptions: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE'];

  constructor(
    private authService: AuthService,
    private scheduleService: ScheduleService,
    private attendanceService: AttendanceService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    if (!user) {
      this.loadingSchedules = false;
      this.cdr.detectChanges();
      this.router.navigate(['/']);
      return;
    }
    this.userId = user.id;
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.loadingSchedules = true;
    this.error = '';
    this.scheduleService.getTeacherSchedule(this.userId!)
      .pipe(
        timeout(10000),
        catchError(() => {
          this.error = 'Impossible de charger l\'emploi du temps.';
          return of([] as ScheduleResponse[]);
        }),
        finalize(() => {
          this.loadingSchedules = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.schedules = Array.isArray(data) ? data : [];
        }
      });
  }

  retryLoadSchedules(): void {
    this.loadSchedules();
  }

  get selectedSchedule(): ScheduleResponse | null {
    return this.schedules.find(s => s.id === this.selectedScheduleId) ?? null;
  }

  loadAttendance(): void {
    if (!this.selectedScheduleId || !this.selectedDate) return;
    this.loading = true;
    this.error = '';
    this.successMsg = '';

    this.attendanceService.getAttendanceByScheduleAndDate(this.userId!, this.selectedScheduleId, this.selectedDate).subscribe({
      next: (records) => {
        this.buildRows(records);
        this.loading = false;
      },
      error: () => { this.error = 'Impossible de charger la liste des présences.'; this.loading = false; }
    });
  }

  private buildRows(records: AttendanceResponse[]): void {
    const recordMap = new Map<number, AttendanceResponse>();
    records.forEach(r => recordMap.set(r.studentId, r));

    if (records.length > 0) {
      // Rebuild rows from existing records, keeping any students already in rows
      const existingStudentIds = new Set(this.rows.map(r => r.studentId));
      records.forEach(r => {
        if (!existingStudentIds.has(r.studentId)) {
          this.rows.push({
            studentId: r.studentId,
            studentName: r.studentName,
            status: r.status,
            comment: r.comment ?? '',
            attendanceId: r.id,
            saved: true,
          });
        } else {
          const row = this.rows.find(row => row.studentId === r.studentId);
          if (row) {
            row.status = r.status;
            row.comment = r.comment ?? '';
            row.attendanceId = r.id;
            row.saved = true;
          }
        }
      });

      // For rows not in records, mark as unsaved
      this.rows.forEach(row => {
        if (!recordMap.has(row.studentId)) {
          row.attendanceId = null;
          row.saved = false;
        }
      });
    } else if (this.rows.length === 0) {
      // No existing data and no rows yet - schedule may have no students loaded
      // We'll show a message instead
    }
  }

  loadStudentsForClass(): void {
    // When a schedule is selected, pre-populate rows with students from the class
    // We get this info from loading attendance (students appear in records once marked)
    // For first-time use, we load from the schedule's class
    this.rows = [];
    this.loadAttendance();
  }

  onScheduleChange(): void {
    this.rows = [];
    this.successMsg = '';
    this.error = '';
    if (this.selectedScheduleId) {
      this.loadClassStudents();
    }
  }

  onDateChange(): void {
    if (this.selectedScheduleId) {
      this.loadClassStudents();
    }
  }

  private loadClassStudents(): void {
    const schedule = this.selectedSchedule;
    if (!schedule) return;
    this.loading = true;

    // Load all students in the class
    this.scheduleService.getStudentsByClass(this.userId!, schedule.classId).subscribe({
      next: (students) => {
        // Load existing attendance records for the selected date
        this.attendanceService.getAttendanceByScheduleAndDate(this.userId!, schedule.id, this.selectedDate).subscribe({
          next: (records) => {
            const recordMap = new Map<number, AttendanceResponse>();
            records.forEach(r => recordMap.set(r.studentId, r));

            this.rows = students.map(s => {
              const existing = recordMap.get(s.studentId);
              return {
                studentId: s.studentId,
                studentName: s.studentName,
                status: existing ? existing.status : 'PRESENT' as AttendanceStatus,
                comment: existing ? (existing.comment ?? '') : '',
                attendanceId: existing ? existing.id : null,
                saved: !!existing,
              };
            });
            this.loading = false;
          },
          error: () => {
            // Fallback: show students without attendance records
            this.rows = students.map(s => ({
              studentId: s.studentId,
              studentName: s.studentName,
              status: 'PRESENT' as AttendanceStatus,
              comment: '',
              attendanceId: null,
              saved: false,
            }));
            this.loading = false;
          }
        });
      },
      error: () => { this.loading = false; this.error = 'Impossible de charger les étudiants.'; }
    });
  }

  saveAll(): void {
    if (!this.selectedScheduleId || !this.selectedDate) return;
    const unsaved = this.rows.filter(r => !r.saved);
    if (unsaved.length === 0) { this.successMsg = 'Tout est déjà sauvegardé.'; return; }

    this.saving = true;
    this.successMsg = '';
    this.error = '';

    let pending = unsaved.length;
    let failed = 0;

    unsaved.forEach(row => {
      this.attendanceService.saveAttendance(this.userId!, {
        scheduleId: this.selectedScheduleId!,
        studentId: row.studentId,
        date: this.selectedDate,
        status: row.status,
        comment: row.comment || undefined,
      }).subscribe({
        next: (res) => {
          row.attendanceId = res.id;
          row.saved = true;
          pending--;
          if (pending === 0) {
            this.saving = false;
            if (failed === 0) this.successMsg = 'Présences enregistrées avec succès.';
            else this.error = `${failed} enregistrement(s) ont échoué.`;
          }
        },
        error: () => {
          failed++;
          pending--;
          if (pending === 0) {
            this.saving = false;
            this.error = `${failed} enregistrement(s) ont échoué.`;
          }
        }
      });
    });
  }

  saveRow(row: StudentAttendanceRow): void {
    if (!this.selectedScheduleId || !this.selectedDate) return;
    this.attendanceService.saveAttendance(this.userId!, {
      scheduleId: this.selectedScheduleId,
      studentId: row.studentId,
      date: this.selectedDate,
      status: row.status,
      comment: row.comment || undefined,
    }).subscribe({
      next: (res) => {
        row.attendanceId = res.id;
        row.saved = true;
        this.successMsg = `Présence de ${row.studentName} enregistrée.`;
      },
      error: () => { this.error = `Impossible de sauvegarder pour ${row.studentName}.`; }
    });
  }

  markAll(status: AttendanceStatus): void {
    this.rows.forEach(r => { r.status = status; r.saved = false; });
  }

  onStatusChange(row: StudentAttendanceRow): void {
    row.saved = false;
  }

  statusLabel(s: AttendanceStatus): string {
    return this.attendanceService.statusLabel(s);
  }

  statusClass(s: AttendanceStatus): string {
    return this.attendanceService.statusClass(s);
  }

  dayLabel(d: string): string {
    const map: Record<string, string> = {
      MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi',
      THURSDAY: 'Jeudi', FRIDAY: 'Vendredi'
    };
    return map[d] ?? d;
  }

  formatTime(t: string): string {
    return t ? t.substring(0, 5) : '';
  }

  goBack(): void {
    this.router.navigate(['/teacher']);
  }
}

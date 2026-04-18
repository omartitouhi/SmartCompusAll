import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth';
import { ScheduleService, ScheduleResponse } from '../../../shared/services/schedule.service';

const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
type WeekDay = typeof WEEK_DAYS[number];

const DAY_LABELS_SHORT: Record<WeekDay, string> = {
  MONDAY:    'lun.',
  TUESDAY:   'mar.',
  WEDNESDAY: 'mer.',
  THURSDAY:  'jeu.',
  FRIDAY:    'ven.',
  SATURDAY:  'sam.',
  SUNDAY:    'dim.',
};

// Visible time range
const HOUR_START = 8;
const HOUR_END   = 23; // exclusive upper bound for display (last label = 23h)
const TOTAL_MINS = (HOUR_END - HOUR_START) * 60; // 900 min

const SLOT_COLORS = [
  '#3b5bdb', '#1971c2', '#2f9e44', '#862e9c',
  '#c92a2a', '#e67700', '#0c8599', '#5c7cfa',
];

export interface CalEvent {
  schedule: ScheduleResponse;
  color: string;
  /** top offset as percent of total height */
  topPct: number;
  /** height as percent of total height */
  heightPct: number;
  duration: string;
}

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-schedule.html',
  styleUrl: './student-schedule.scss',
})
export class StudentSchedule implements OnInit {
  userId: number | null = null;
  schedules: ScheduleResponse[] = [];
  loading = true;
  error = '';

  currentWeekStart: Date = this.getMonday(new Date());

  // hour labels 8..22 (lines between hours)
  hours: number[] = [];
  weekDays: WeekDay[] = [...WEEK_DAYS];
  dayLabelsShort = DAY_LABELS_SHORT;

  private colorMap = new Map<string, string>();
  private colorIdx = 0;

  constructor(
    private authService: AuthService,
    private scheduleService: ScheduleService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    for (let h = HOUR_START; h <= HOUR_END; h++) this.hours.push(h);
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    if (user) {
      this.userId = user.id;
      this.loadSchedule(user.id);
    } else {
      this.router.navigate(['/']);
    }
  }

  loadSchedule(userId: number): void {
    this.loading = true;
    this.error = '';
    this.scheduleService.getStudentSchedule(userId).pipe(catchError(() => of([]))).subscribe({
      next: (data) => {
        this.schedules = data as ScheduleResponse[];
        this.buildColorMap();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = "Erreur lors du chargement de l'emploi du temps.";
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Week navigation ──────────────────────────────────

  prevWeek(): void {
    const d = new Date(this.currentWeekStart);
    d.setDate(d.getDate() - 7);
    this.currentWeekStart = d;
  }

  nextWeek(): void {
    const d = new Date(this.currentWeekStart);
    d.setDate(d.getDate() + 7);
    this.currentWeekStart = d;
  }

  goToday(): void {
    this.currentWeekStart = this.getMonday(new Date());
  }

  get weekRangeLabel(): string {
    const start = this.currentWeekStart;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${this.fmtDateShort(start)} – ${this.fmtDateShort(end)} ${end.getFullYear()}`;
  }

  dateForCol(colIdx: number): Date {
    const d = new Date(this.currentWeekStart);
    d.setDate(d.getDate() + colIdx);
    return d;
  }

  colDayLabel(colIdx: number): string {
    const d = this.dateForCol(colIdx);
    const day = this.weekDays[colIdx];
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${this.dayLabelsShort[day]} ${dd}/${mm}`;
  }

  isToday(colIdx: number): boolean {
    const d = this.dateForCol(colIdx);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth()    === now.getMonth()    &&
           d.getDate()     === now.getDate();
  }

  // ── Events ───────────────────────────────────────────

  /**
   * Returns true if the schedule is active on a specific date.
   * Checks that the exact day date falls within [startDate, endDate].
   * Legacy schedules with no date range always display.
   */
  private isScheduleActiveOnDate(s: ScheduleResponse, date: Date): boolean {
    if (!s.startDate && !s.endDate) return true;
    const dateStr = this.toYMD(date);
    const sd = s.startDate ?? '0000-01-01';
    const ed = s.endDate   ?? '9999-12-31';
    return dateStr >= sd && dateStr <= ed;
  }

  getEventsForDay(day: WeekDay): CalEvent[] {
    const colIdx = WEEK_DAYS.indexOf(day);
    const colDate = this.dateForCol(colIdx);
    return this.schedules
      .filter(s => s.dayOfWeek === day && this.isScheduleActiveOnDate(s, colDate))
      .map(s => this.buildEvent(s))
      .sort((a, b) => a.topPct - b.topPct);
  }

  private buildEvent(s: ScheduleResponse): CalEvent {
    const startMin = this.timeToMin(s.startTime);
    const endMin   = this.timeToMin(s.endTime);
    const durationMin = endMin - startMin;

    const offsetMin = startMin - HOUR_START * 60;
    const topPct    = (offsetMin / TOTAL_MINS) * 100;
    const heightPct = (durationMin / TOTAL_MINS) * 100;

    const h = Math.floor(durationMin / 60);
    const m = durationMin % 60;
    const duration = m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;

    return {
      schedule: s,
      color: this.colorFor(s.subjectName),
      topPct,
      heightPct,
      duration,
    };
  }

  private buildColorMap(): void {
    this.colorMap.clear();
    this.colorIdx = 0;
    this.schedules.forEach(s => {
      if (!this.colorMap.has(s.subjectName)) {
        this.colorMap.set(s.subjectName, SLOT_COLORS[this.colorIdx % SLOT_COLORS.length]);
        this.colorIdx++;
      }
    });
  }

  colorFor(name: string): string {
    return this.colorMap.get(name) ?? SLOT_COLORS[0];
  }

  // ── Hour lines ───────────────────────────────────────

  /** Top % for a given hour line inside the body */
  hourLinePct(hour: number): number {
    return ((hour - HOUR_START) / (HOUR_END - HOUR_START)) * 100;
  }

  /** Half-hour offset in % (distance from one hour line to the next half-hour mark) */
  get halfHourPct(): number {
    return (0.5 / (HOUR_END - HOUR_START)) * 100;
  }

  // ── Helpers ──────────────────────────────────────────

  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private timeToMin(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  }

  formatTime(t: string): string {
    return t ? t.substring(0, 5) : '';
  }

  private fmtDateShort(d: Date): string {
    const months = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }

  /** Convert a Date to "YYYY-MM-DD" for lexicographic comparison */
  private toYMD(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  hourLabel(h: number): string {
    return `${h.toString().padStart(2, '0')} h`;
  }

  goBack(): void {
    this.router.navigate(['/student']);
  }
}

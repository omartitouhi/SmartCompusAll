import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth';
import { GradeService, GradeResponse } from '../../../shared/services/grade.service';
import { ScheduleService } from '../../../shared/services/schedule.service';

// Evaluation type → column key mapping
const EVAL_COL_MAP: Record<string, string> = {
  PROJET:            'projet',
  EXAMEN:            'examen',
  DEVOIR:            'devoir',
  TRAVAUX_PRATIQUES: 'tp',
  // legacy fallback
  DS:                'examen',
  TP:                'tp',
};

export interface SubjectRow {
  subjectName: string;
  coef: number | null;
  projet:  number | null;
  examen:  number | null;
  devoir:  number | null;
  tp:      number | null;
  moyenne: string;
  credit:  number;
  rattrapage: number | null;
  grades: GradeResponse[];
}

@Component({
  selector: 'app-student-grades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-grades.html',
  styleUrl: './student-grades.scss',
})
export class StudentGrades implements OnInit {
  userName = '';
  userId: number | null = null;
  studentInfo: any = null;
  subjectRows: SubjectRow[] = [];
  loading = true;
  error = '';

  constructor(
    private authService: AuthService,
    private gradeService: GradeService,
    private scheduleService: ScheduleService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    if (user) {
      this.userName = `${user.firstName} ${user.lastName}`;
      this.userId   = user.id;
      this.loadData(user.id);
    } else {
      this.router.navigate(['/']);
    }
  }

  loadData(userId: number): void {
    this.loading = true;
    this.error = '';
    forkJoin({
      info:   this.scheduleService.getStudentInfo(userId).pipe(catchError(() => of(null))),
      grades: this.gradeService.getStudentGrades(userId).pipe(catchError(() => of([]))),
    }).subscribe({
      next: (results) => {
        this.studentInfo  = results.info;
        const grades      = results.grades as GradeResponse[];
        this.subjectRows  = this.buildRows(grades);
        this.loading      = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error   = 'Erreur lors du chargement des notes.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  buildRows(grades: GradeResponse[]): SubjectRow[] {
    const map = new Map<string, GradeResponse[]>();
    grades.forEach(g => {
      if (!map.has(g.subjectName)) map.set(g.subjectName, []);
      map.get(g.subjectName)!.push(g);
    });

    return Array.from(map.entries()).map(([subjectName, list]) => {
      const colValues: Record<string, number[]> = { projet: [], examen: [], devoir: [], tp: [] };

      list.forEach(g => {
        const col = EVAL_COL_MAP[g.evaluationType.toUpperCase()] ?? 'examen';
        colValues[col].push(g.value);
      });

      const avg = (vals: number[]) => vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;

      const projet = avg(colValues['projet']);
      const examen = avg(colValues['examen']);
      const devoir = avg(colValues['devoir']);
      const tp     = avg(colValues['tp']);

      const moy = '—';

      return {
        subjectName,
        coef: null,
        projet:     projet !== null ? +projet.toFixed(2) : null,
        examen:     examen !== null ? +examen.toFixed(2) : null,
        devoir:     devoir !== null ? +devoir.toFixed(2) : null,
        tp:         tp     !== null ? +tp.toFixed(2)     : null,
        moyenne:    moy,
        credit:     0,
        rattrapage: null,
        grades:     list,
      };
    });
  }

  gradeColor(value: number | null): string {
    if (value === null) return '';
    if (value >= 14) return 'good';
    if (value >= 10) return 'average';
    return 'fail';
  }

  fmt(v: number | null): string {
    return v !== null ? v.toFixed(2) : '—';
  }

  formatEvalType(type: string): string {
    return type.replace(/_/g, ' ');
  }

  goBack(): void {
    this.router.navigate(['/student']);
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { GradeService, GradeRequest, GradeResponse } from '../../../shared/services/grade.service';
import { ScheduleService, SchoolClassResponse, ScheduleResponse } from '../../../shared/services/schedule.service';
import { HttpClient } from '@angular/common/http';

interface StudentOption {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
}

@Component({
  selector: 'app-grade-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grade-management.html',
  styleUrl: './grade-management.scss',
})
export class GradeManagement implements OnInit {
  userId: number | null = null;
  userName = '';

  // Data
  myClasses: SchoolClassResponse[] = [];
  mySubjects: { id: number; name: string }[] = [];
  students: StudentOption[] = [];
  grades: GradeResponse[] = [];

  // Filters
  selectedClassId: number | null = null;
  selectedSubjectId: number | null = null;

  // Form
  showForm = false;
  editingGradeId: number | null = null;
  editingStudentName = '';
  form: GradeRequest = {
    studentId: 0,
    subjectId: 0,
    classId: 0,
    value: 10,
    comment: '',
    evaluationType: 'EXAMEN',
    evaluationDate: new Date().toISOString().substring(0, 10),
  };

  evaluationTypes = ['PROJET', 'TRAVAUX_PRATIQUES', 'EXAMEN', 'DEVOIR'];

  loading = false;
  loadingStudents = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private gradeService: GradeService,
    private scheduleService: ScheduleService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    if (user) {
      this.userId = user.id;
      this.userName = `${user.firstName} ${user.lastName}`;
      this.loadMyScheduleData();
    } else {
      this.router.navigate(['/']);
    }
  }

  loadMyScheduleData(): void {
    if (!this.userId) return;
    // Load teacher's schedule to get unique classes and subjects
    this.scheduleService.getTeacherSchedule(this.userId).subscribe({
      next: (schedules: ScheduleResponse[]) => {
        // Extract unique classes
        const classMap = new Map<number, SchoolClassResponse>();
        const subjectMap = new Map<number, { id: number; name: string }>();
        schedules.forEach(s => {
          if (!classMap.has(s.classId)) {
            classMap.set(s.classId, {
              id: s.classId,
              className: s.className,
              fullClassName: s.className,
              filiereName: s.filiereName,
              level: s.level,
              capacity: 0,
              currentSize: 0,
            });
          }
          if (!subjectMap.has(s.subjectId)) {
            subjectMap.set(s.subjectId, { id: s.subjectId, name: s.subjectName });
          }
        });
        this.myClasses = Array.from(classMap.values());
        this.mySubjects = Array.from(subjectMap.values());
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Impossible de charger les données.';
        this.cdr.detectChanges();
      }
    });
  }

  onClassChange(): void {
    this.students = [];
    this.grades = [];
    this.form.classId = this.selectedClassId ?? 0;
    if (this.selectedClassId) {
      this.loadStudentsForClass(this.selectedClassId);
    }
    if (this.selectedClassId && this.selectedSubjectId) {
      this.loadGrades();
    }
  }

  onSubjectChange(): void {
    this.grades = [];
    this.form.subjectId = this.selectedSubjectId ?? 0;
    if (this.selectedClassId && this.selectedSubjectId) {
      this.loadGrades();
    }
  }

  loadStudentsForClass(classId: number): void {
    this.loadingStudents = true;
    this.cdr.detectChanges();
    this.http.get<any[]>(`/api/admin/students/class/${classId}`).subscribe({
      next: (data) => {
        this.students = data.map(s => ({
          id: s.id,
          userId: s.userId,
          firstName: s.firstName,
          lastName: s.lastName,
          fullName: `${s.firstName} ${s.lastName}`,
        }));
        this.loadingStudents = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingStudents = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadGrades(): void {
    if (!this.userId || !this.selectedClassId || !this.selectedSubjectId) return;
    this.loading = true;
    this.cdr.detectChanges();
    this.gradeService.getGradesByClassAndSubject(this.userId, this.selectedClassId, this.selectedSubjectId).subscribe({
      next: (data) => {
        const grades = Array.isArray(data) ? data : [];
        // Keep newest evaluations first so row lookup shows the latest note per student.
        this.grades = grades.sort((a, b) => {
          const byDate = this.gradeDateRank(b) - this.gradeDateRank(a);
          if (byDate !== 0) return byDate;
          return (b.id ?? 0) - (a.id ?? 0);
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAddForm(): void {
    this.editingGradeId = null;
    this.form = {
      studentId: 0,
      subjectId: this.selectedSubjectId ?? 0,
      classId: this.selectedClassId ?? 0,
      value: 10,
      comment: '',
      evaluationType: 'EXAMEN',
      evaluationDate: new Date().toISOString().substring(0, 10),
    };
    this.showForm = true;
    this.successMsg = '';
    this.errorMsg = '';
  }

  openEditForm(grade: GradeResponse): void {
    this.editingGradeId = grade.id;
    this.editingStudentName = grade.studentName;
    this.form = {
      studentId: grade.studentId,
      subjectId: grade.subjectId,
      classId: grade.classId,
      value: grade.value,
      comment: grade.comment ?? '',
      evaluationType: grade.evaluationType,
      evaluationDate: grade.evaluationDate,
    };
    this.showForm = true;
    this.successMsg = '';
    this.errorMsg = '';
  }

  openAddFormForStudent(studentId: number): void {
    const student = this.students.find(s => s.id === studentId);
    this.editingGradeId = null;
    this.editingStudentName = student?.fullName ?? '';
    this.form = {
      studentId,
      subjectId: this.selectedSubjectId ?? 0,
      classId: this.selectedClassId ?? 0,
      value: 10,
      comment: '',
      evaluationType: 'EXAMEN',
      evaluationDate: new Date().toISOString().substring(0, 10),
    };
    this.showForm = true;
    this.successMsg = '';
    this.errorMsg = '';
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingGradeId = null;
  }

  submitForm(): void {
    if (!this.userId) return;
    if (this.form.studentId === 0) { this.errorMsg = 'Sélectionnez un étudiant.'; return; }
    if (this.form.value < 0 || this.form.value > 20) { this.errorMsg = 'La note doit être entre 0 et 20.'; return; }

    this.errorMsg = '';
    if (this.editingGradeId !== null) {
      this.gradeService.updateGrade(this.userId, this.editingGradeId, this.form).subscribe({
        next: () => {
          this.successMsg = 'Note modifiée avec succès.';
          this.showForm = false;
          this.loadGrades();
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMsg = 'Erreur lors de la modification.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.gradeService.addGrade(this.userId, this.form).subscribe({
        next: () => {
          this.successMsg = 'Note ajoutée avec succès.';
          this.showForm = false;
          this.loadGrades();
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMsg = 'Erreur lors de l\'ajout.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteGrade(gradeId: number): void {
    if (!this.userId || !confirm('Supprimer cette note ?')) return;
    this.gradeService.deleteGrade(this.userId, gradeId).subscribe({
      next: () => {
        this.successMsg = 'Note supprimée.';
        this.loadGrades();
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Erreur lors de la suppression.';
        this.cdr.detectChanges();
      }
    });
  }

  getStudentGrade(studentId: number): GradeResponse | undefined {
    return this.grades.find(g => g.studentId === studentId);
  }

  private gradeDateRank(grade: GradeResponse): number {
    const t = Date.parse(grade.evaluationDate);
    return Number.isNaN(t) ? 0 : t;
  }

  gradeColor(value: number): string {
    if (value >= 14) return 'good';
    if (value >= 10) return 'average';
    return 'fail';
  }

  classAverage(): string {
    if (this.grades.length === 0) return '—';
    const avg = this.grades.reduce((sum, g) => sum + g.value, 0) / this.grades.length;
    return avg.toFixed(2);
  }

  goBack(): void {
    this.router.navigate(['/teacher']);
  }
}

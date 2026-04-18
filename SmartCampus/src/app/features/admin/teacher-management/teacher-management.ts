import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { TeacherService, TeacherResponse, TeacherRequest } from '../../../shared/services/teacher.service';
import { SubjectService, Subject } from '../../../shared/services/subject.service';

type ViewMode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-teacher-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './teacher-management.html',
  styleUrl: './teacher-management.scss',
})
export class TeacherManagement implements OnInit {
  view: ViewMode = 'list';

  teachers: TeacherResponse[] = [];
  filteredTeachers: TeacherResponse[] = [];
  allSubjects: Subject[] = [];
  selectedSubjectNames: string[] = [];

  selectedTeacher: TeacherResponse | null = null;
  deleteConfirmId: number | null = null;

  form!: FormGroup;
  isLoading = false;
  isTableLoading = false;
  subjectsLoading = false;
  errorMessage = '';
  successMessage = '';
  searchQuery = '';

  constructor(
    private fb: FormBuilder,
    private teacherService: TeacherService,
    private subjectService: SubjectService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadTeachers();
    this.loadSubjects();
  }

  private buildForm(teacher?: TeacherResponse): void {
    this.form = this.fb.group({
      firstName:  [teacher?.firstName  ?? '', Validators.required],
      lastName:   [teacher?.lastName   ?? '', Validators.required],
      email:      [teacher?.email      ?? '', [Validators.required, Validators.email]],
      password:   ['', this.view === 'create' ? [Validators.required, Validators.minLength(6)] : Validators.minLength(6)],
      department: [teacher?.department ?? ''],
    });
    // Initialise selected subjects from teacher data
    this.selectedSubjectNames = teacher?.subjects?.map(s => s.name) ?? [];
  }

  loadTeachers(): void {
    this.isTableLoading = true;
    this.errorMessage = '';
    this.teacherService.getAllTeachers()
      .pipe(finalize(() => (this.isTableLoading = false)))
      .subscribe({
        next: (data) => {
          this.teachers = data;
          this.applyFilter();
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Erreur lors du chargement des enseignants.';
          this.cdr.detectChanges();
        },
      });
  }

  loadSubjects(): void {
    this.subjectsLoading = true;
    this.subjectService.getAllSubjects()
      .pipe(finalize(() => (this.subjectsLoading = false)))
      .subscribe({
        next: (data) => (this.allSubjects = data),
        error: () => (this.allSubjects = []),
      });
  }

  isSubjectSelected(name: string): boolean {
    return this.selectedSubjectNames.includes(name);
  }

  toggleSubject(name: string): void {
    const idx = this.selectedSubjectNames.indexOf(name);
    if (idx === -1) {
      this.selectedSubjectNames = [...this.selectedSubjectNames, name];
    } else {
      this.selectedSubjectNames = this.selectedSubjectNames.filter(n => n !== name);
    }
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredTeachers = [...this.teachers];
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredTeachers = this.teachers.filter(t =>
      t.firstName.toLowerCase().includes(q) ||
      t.lastName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.department ?? '').toLowerCase().includes(q) ||
      (t.subjects ?? []).some(s => s.name.toLowerCase().includes(q))
    );
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    this.applyFilter();
  }

  openCreate(): void {
    this.clearMessages();
    this.selectedTeacher = null;
    this.view = 'create';
    this.buildForm();
  }

  openEdit(teacher: TeacherResponse): void {
    this.clearMessages();
    this.selectedTeacher = teacher;
    this.view = 'edit';
    this.buildForm(teacher);
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.addValidators(Validators.minLength(6));
    this.form.get('password')?.updateValueAndValidity();
  }

  cancelForm(): void {
    this.view = 'list';
    this.selectedTeacher = null;
    this.selectedSubjectNames = [];
    this.clearMessages();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.view === 'create' ? this.create() : this.update();
  }

  private buildRequest(): TeacherRequest {
    const v = this.form.value;
    return {
      email:        v.email,
      password:     v.password ?? '',
      firstName:    v.firstName,
      lastName:     v.lastName,
      department:   v.department ?? '',
      subjectNames: [...this.selectedSubjectNames],
    };
  }

  private create(): void {
    this.isLoading = true;
    this.clearMessages();
    this.teacherService.createTeacher(this.buildRequest())
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Enseignant créé avec succès !';
          this.loadTeachers();
          setTimeout(() => this.cancelForm(), 1500);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? 'Erreur lors de la création.';
        },
      });
  }

  private update(): void {
    if (!this.selectedTeacher?.id) return;
    this.isLoading = true;
    this.clearMessages();
    this.teacherService.updateTeacher(this.selectedTeacher.id, this.buildRequest())
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Enseignant mis à jour !';
          this.loadTeachers();
          setTimeout(() => this.cancelForm(), 1500);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? 'Erreur lors de la mise à jour.';
        },
      });
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  onDelete(id: number): void {
    this.isLoading = true;
    this.deleteConfirmId = null;
    this.teacherService.deleteTeacher(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Enseignant supprimé.';
          this.loadTeachers();
          setTimeout(() => this.clearMessages(), 2500);
        },
        error: () => (this.errorMessage = 'Erreur lors de la suppression.'),
      });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SubjectService, Subject } from '../../../shared/services/subject.service';
import { finalize } from 'rxjs';

type ViewMode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-subject-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subject-management.html',
  styleUrl: './subject-management.scss',
})
export class SubjectManagement implements OnInit {
  view: ViewMode = 'list';
  subjects: Subject[] = [];
  filteredSubjects: Subject[] = [];
  selectedSubject: Subject | null = null;

  form!: FormGroup;
  isLoading = false;
  isTableLoading = false;
  errorMessage = '';
  successMessage = '';
  searchQuery = '';
  deleteConfirmId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private subjectService: SubjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadSubjects();
  }

  private buildForm(subject?: Subject): void {
    this.form = this.fb.group({
      name:        [subject?.name        ?? '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: [subject?.description ?? '', [Validators.maxLength(500)]],
    });
  }

  loadSubjects(): void {
    this.isTableLoading = true;
    this.errorMessage = '';
    this.subjectService.getAllSubjects()
      .pipe(finalize(() => (this.isTableLoading = false)))
      .subscribe({
        next: (data) => {
          this.subjects = data;
          this.applyFilter();
        },
        error: () => (this.errorMessage = 'Erreur lors du chargement des matières.'),
      });
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredSubjects = [...this.subjects];
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredSubjects = this.subjects.filter(
      s => s.name.toLowerCase().includes(q) || (s.description ?? '').toLowerCase().includes(q)
    );
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    this.applyFilter();
  }

  openCreate(): void {
    this.clearMessages();
    this.buildForm();
    this.view = 'create';
  }

  openEdit(subject: Subject): void {
    this.clearMessages();
    this.selectedSubject = subject;
    this.buildForm(subject);
    this.view = 'edit';
  }

  cancelForm(): void {
    this.view = 'list';
    this.selectedSubject = null;
    this.clearMessages();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.view === 'create' ? this.create() : this.update();
  }

  private create(): void {
    this.isLoading = true;
    this.clearMessages();
    this.subjectService.createSubject(this.form.value)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Matière créée avec succès !';
          this.loadSubjects();
          setTimeout(() => this.cancelForm(), 1500);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? 'Erreur lors de la création.';
        },
      });
  }

  private update(): void {
    if (!this.selectedSubject?.id) return;
    this.isLoading = true;
    this.clearMessages();
    this.subjectService.updateSubject(this.selectedSubject.id, this.form.value)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Matière mise à jour !';
          this.loadSubjects();
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
    this.subjectService.deleteSubject(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Matière supprimée.';
          this.loadSubjects();
          setTimeout(() => this.clearMessages(), 2000);
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

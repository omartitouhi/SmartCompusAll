import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FiliereService, Filiere } from '../../../shared/services/filiere.service';
import { finalize } from 'rxjs';

type ViewMode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-filiere-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filiere-management.html',
  styleUrl: './filiere-management.scss',
})
export class FiliereManagement implements OnInit {
  view: ViewMode = 'list';
  filieres: Filiere[] = [];
  filteredFilieres: Filiere[] = [];
  selectedFiliere: Filiere | null = null;

  form!: FormGroup;
  isLoading = false;
  isTableLoading = false;
  errorMessage = '';
  successMessage = '';
  searchQuery = '';
  deleteConfirmId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private filiereService: FiliereService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadFilieres();
  }

  private buildForm(filiere?: Filiere): void {
    this.form = this.fb.group({
      name:        [filiere?.name        ?? '', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [filiere?.description ?? '', [Validators.maxLength(500)]],
    });
  }

  loadFilieres(): void {
    this.isTableLoading = true;
    this.errorMessage = '';
    this.filiereService.getAllFilieres()
      .pipe(finalize(() => {
        this.isTableLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.filieres = Array.isArray(data) ? data : [];
          this.applyFilter();
        },
        error: (err) => {
          this.filieres = [];
          this.filteredFilieres = [];
          this.errorMessage = err?.message ?? 'Erreur lors du chargement des filières.';
        },
      });
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredFilieres = [...this.filieres];
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredFilieres = this.filieres.filter(
      f => (f.name ?? '').toLowerCase().includes(q) || (f.description ?? '').toLowerCase().includes(q)
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

  openEdit(filiere: Filiere): void {
    this.clearMessages();
    this.selectedFiliere = filiere;
    this.buildForm(filiere);
    this.view = 'edit';
  }

  cancelForm(): void {
    this.view = 'list';
    this.selectedFiliere = null;
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
    this.filiereService.createFiliere(this.form.value)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Filière créée avec succès !';
          this.loadFilieres();
          setTimeout(() => this.cancelForm(), 1500);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? 'Erreur lors de la création.';
        },
      });
  }

  private update(): void {
    if (!this.selectedFiliere?.id) return;
    this.isLoading = true;
    this.clearMessages();
    this.filiereService.updateFiliere(this.selectedFiliere.id, this.form.value)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Filière mise à jour !';
          this.loadFilieres();
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
    this.filiereService.deleteFiliere(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Filière supprimée.';
          this.loadFilieres();
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

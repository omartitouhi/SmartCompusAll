import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService } from '../../../shared/services/student.service';
import { FiliereService, Filiere } from '../../../shared/services/filiere.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-create-student',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-student.html',
  styleUrl: './create-student.scss',
})
export class CreateStudent implements OnInit {
  studentForm: FormGroup;
  filieres: Filiere[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  levels = [
    { value: 'FIRST_YEAR_PREPARATORY', label: '1ère année cycle préparatoire intégré' },
    { value: 'SECOND_YEAR_PREPARATORY', label: '2ème année cycle préparatoire intégré' },
    { value: 'FIRST_YEAR_ENGINEERING', label: '1ère année ingénieur' },
    { value: 'SECOND_YEAR_ENGINEERING', label: '2ème année ingénieur' },
    { value: 'THIRD_YEAR_ENGINEERING', label: '3ème année ingénieur' }
  ];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private filiereService: FiliereService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.studentForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      schoolYear: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      cin: ['', Validators.required],
      level: ['', Validators.required],
      filiereName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadFilieres();
  }

  loadFilieres(): void {
    this.filiereService.getAllFilieres()
      .pipe(finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: (data) => {
          this.filieres = data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors du chargement des filières';
          console.error('Error loading filieres:', error);
          this.cdr.detectChanges();
        }
      });
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.cdr.detectChanges();

      this.studentService.createStudent(this.studentForm.value)
        .pipe(finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
          next: (response) => {
            this.successMessage = 'Étudiant créé avec succès !';
            console.log('Student created:', response);
            this.cdr.detectChanges();
            setTimeout(() => {
              this.router.navigate(['/admin/students']);
            }, 2000);
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Erreur lors de la création de l\'étudiant';
            console.error('Error creating student:', error);
            this.cdr.detectChanges();
          }
        });
    } else {
      this.markFormGroupTouched(this.studentForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/students']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.studentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

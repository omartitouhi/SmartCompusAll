import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService, Student, StudentSearchParams } from '../../../shared/services/student.service';
import { FiliereService, Filiere } from '../../../shared/services/filiere.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-search-student',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-student.html',
  styleUrl: './search-student.scss',
})
export class SearchStudent implements OnInit {
  searchForm: FormGroup;
  editForm: FormGroup;
  students: Student[] = [];
  selectedStudent: Student | null = null;
  filieres: Filiere[] = [];
  isLoading = false;
  isEditing = false;
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
    this.searchForm = this.fb.group({
      email: [''],
      firstName: [''],
      lastName: [''],
      cin: [''],
      level: [''],
      filiereName: [''],
      schoolYear: [''],
      className: ['']
    });

    this.editForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [''],
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
    this.loadAllStudents();
  }

  loadFilieres(): void {
    this.filiereService.getAllFilieres().subscribe({
      next: (data) => {
        this.filieres = data;
      },
      error: (error) => {
        console.error('Error loading filieres:', error);
      }
    });
  }

  loadAllStudents(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.studentService.getAllStudents()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.students = data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors du chargement des étudiants';
          console.error('Error loading students:', error);
          this.cdr.detectChanges();
        }
      });
  }

  onSearch(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    const searchParams: StudentSearchParams = {};
    Object.keys(this.searchForm.value).forEach(key => {
      const value = this.searchForm.value[key];
      if (value) {
        searchParams[key as keyof StudentSearchParams] = value;
      }
    });

    if (Object.keys(searchParams).length === 0) {
      this.loadAllStudents();
      return;
    }

    this.studentService.searchStudents(searchParams)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.students = data;
          if (data.length === 0) {
            this.errorMessage = 'Aucun étudiant trouvé avec ces critères';
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la recherche';
          console.error('Error searching students:', error);
          this.cdr.detectChanges();
        }
      });
  }

  resetSearch(): void {
    this.searchForm.reset();
    this.loadAllStudents();
    this.errorMessage = '';
    this.successMessage = '';
  }

  selectStudent(student: Student): void {
    this.selectedStudent = student;
    this.isEditing = true;
    this.editForm.patchValue({
      email: student.email,
      password: '',
      firstName: student.firstName,
      lastName: student.lastName,
      schoolYear: student.schoolYear,
      dateOfBirth: student.dateOfBirth,
      cin: student.cin,
      level: student.level,
      filiereName: student.filiereName
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedStudent = null;
    this.editForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  onUpdate(): void {
    if (this.editForm.valid && this.selectedStudent?.id) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.cdr.detectChanges();

      const formValue = this.editForm.value;

      const updateData: any = {
        email: formValue.email,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        schoolYear: formValue.schoolYear,
        dateOfBirth: formValue.dateOfBirth,
        cin: formValue.cin,
        level: formValue.level,
        filiereName: formValue.filiereName
      };

      if (formValue.password && formValue.password.trim() !== '') {
        updateData.password = formValue.password;
      }

      this.studentService.updateStudent(this.selectedStudent.id, updateData)
        .pipe(finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
          next: () => {
            this.successMessage = 'Étudiant modifié avec succès !';
            this.cdr.detectChanges();
            setTimeout(() => {
              this.cancelEdit();
              this.loadAllStudents();
            }, 1500);
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Erreur lors de la modification';
            console.error('Error updating student:', error);
            this.cdr.detectChanges();
          }
        });
    }
  }

  onDelete(student: Student): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${student.firstName} ${student.lastName} ?`)) {
      if (student.id) {
        this.isLoading = true;
        this.cdr.detectChanges();

        this.studentService.deleteStudent(student.id)
          .pipe(finalize(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }))
          .subscribe({
            next: () => {
              this.successMessage = 'Étudiant supprimé avec succès !';
              this.cdr.detectChanges();
              setTimeout(() => {
                this.cancelEdit();
                this.loadAllStudents();
              }, 1500);
            },
            error: (error) => {
              this.errorMessage = error.error?.message || 'Erreur lors de la suppression';
              console.error('Error deleting student:', error);
              this.cdr.detectChanges();
            }
          });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/students']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getLevelLabel(level: string): string {
    const found = this.levels.find(l => l.value === level);
    return found ? found.label : level;
  }
}

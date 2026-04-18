import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { CourseFileService, CourseFileResponse } from '../../../shared/services/course-file.service';
import { ScheduleService, ScheduleResponse } from '../../../shared/services/schedule.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUpload implements OnInit {
  userId: number | null = null;
  userName = '';

  // Class/subject derived from teacher's schedule
  myClasses: { id: number; name: string }[] = [];
  mySubjects: { id: number; name: string }[] = [];

  // Upload form
  selectedClassId: number | null = null;
  selectedSubjectId: number | null = null;
  selectedFile: File | null = null;
  uploading = false;
  uploadSuccess = '';
  uploadError = '';

  // File list
  files: CourseFileResponse[] = [];
  loadingFiles = false;

  // Filter for file list
  filterClassId: number | null = null;
  filterSubjectId: number | null = null;

  constructor(
    private authService: AuthService,
    private courseFileService: CourseFileService,
    private scheduleService: ScheduleService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    if (user) {
      this.userId = user.id;
      this.userName = `${user.firstName} ${user.lastName}`;
      this.loadScheduleData();
      this.loadFiles();
    } else {
      this.router.navigate(['/']);
    }
  }

  loadScheduleData(): void {
    if (!this.userId) return;
    this.scheduleService.getTeacherSchedule(this.userId).subscribe({
      next: (schedules: ScheduleResponse[]) => {
        const classMap = new Map<number, string>();
        const subjectMap = new Map<number, string>();
        schedules.forEach(s => {
          classMap.set(s.classId, s.className);
          subjectMap.set(s.subjectId, s.subjectName);
        });
        this.myClasses = Array.from(classMap.entries()).map(([id, name]) => ({ id, name }));
        this.mySubjects = Array.from(subjectMap.entries()).map(([id, name]) => ({ id, name }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.uploadError = 'Impossible de charger vos classes et matières.';
        this.cdr.detectChanges();
      }
    });
  }

  loadFiles(): void {
    if (!this.userId) return;
    this.loadingFiles = true;
    this.uploadError = '';
    this.cdr.detectChanges();
    this.courseFileService.getTeacherFiles(this.userId).subscribe({
      next: (data) => {
        this.files = Array.isArray(data) ? data : [];
        this.loadingFiles = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.files = [];
        this.loadingFiles = false;
        this.uploadError = 'Impossible de charger les supports de cours.';
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  upload(): void {
    if (!this.userId || !this.selectedFile || !this.selectedClassId || !this.selectedSubjectId) {
      this.uploadError = 'Veuillez sélectionner une classe, une matière et un fichier.';
      return;
    }
    this.uploading = true;
    this.uploadError = '';
    this.uploadSuccess = '';
    this.courseFileService.uploadFile(
      this.userId,
      this.selectedSubjectId,
      this.selectedClassId,
      this.selectedFile
    ).subscribe({
      next: () => {
        this.uploading = false;
        this.uploadSuccess = `Fichier "${this.selectedFile!.name}" déposé avec succès.`;
        this.selectedFile = null;
        // Reset file input
        const input = document.getElementById('fileInput') as HTMLInputElement;
        if (input) input.value = '';
        this.loadFiles();
        this.cdr.detectChanges();
      },
      error: () => {
        this.uploading = false;
        this.uploadError = 'Erreur lors du dépôt du fichier.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteFile(fileId: number, fileName: string): void {
    if (!this.userId || !confirm(`Supprimer "${fileName}" ?`)) return;
    this.courseFileService.deleteFile(this.userId, fileId).subscribe({
      next: () => {
        this.loadFiles();
        this.cdr.detectChanges();
      },
      error: () => {
        this.uploadError = 'Erreur lors de la suppression.';
        this.cdr.detectChanges();
      }
    });
  }

  get filteredFiles(): CourseFileResponse[] {
    return this.files.filter(f => {
      if (this.filterClassId) {
        const cls = this.myClasses.find(c => c.id === this.filterClassId);
        if (cls && f.className !== cls.name) return false;
      }
      if (this.filterSubjectId) {
        const sub = this.mySubjects.find(s => s.id === this.filterSubjectId);
        if (sub && f.subjectName !== sub.name) return false;
      }
      return true;
    });
  }

  formatSize(bytes: number): string {
    return this.courseFileService.formatSize(bytes);
  }

  goBack(): void {
    this.router.navigate(['/teacher']);
  }
}

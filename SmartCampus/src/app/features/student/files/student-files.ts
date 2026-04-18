import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { CourseFileService, CourseFileResponse } from '../../../shared/services/course-file.service';

@Component({
  selector: 'app-student-files',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-files.html',
  styleUrl: './student-files.scss',
})
export class StudentFiles implements OnInit {
  userId: number | null = null;
  files: CourseFileResponse[] = [];
  loading = true;
  error = '';

  constructor(
    private authService: AuthService,
    private courseFileService: CourseFileService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    if (user) {
      this.userId = user.id;
      this.loadFiles(user.id);
    } else {
      this.router.navigate(['/']);
    }
  }

  loadFiles(userId: number): void {
    this.loading = true;
    this.error = '';
    this.courseFileService.getStudentFiles(userId).subscribe({
      next: (files) => {
        this.files = files.sort((a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Erreur lors du chargement des supports de cours.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getDownloadUrl(fileId: number): string {
    return this.courseFileService.getDownloadUrl(this.userId!, fileId);
  }

  formatSize(bytes: number): string {
    return this.courseFileService.formatSize(bytes);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const months = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
    return `${d.getDate().toString().padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  fileIcon(contentType: string): string {
    if (contentType?.includes('pdf')) return '📄';
    if (contentType?.includes('word') || contentType?.includes('document')) return '📝';
    if (contentType?.includes('sheet') || contentType?.includes('excel')) return '📊';
    if (contentType?.includes('presentation') || contentType?.includes('powerpoint')) return '📑';
    if (contentType?.includes('image')) return '🖼️';
    return '📁';
  }

  goBack(): void {
    this.router.navigate(['/student']);
  }
}

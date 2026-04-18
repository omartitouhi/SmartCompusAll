import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScheduleService, ScheduleResponse, ScheduleRequest, SchoolClassResponse } from '../../../shared/services/schedule.service';
import { TeacherService, TeacherResponse } from '../../../shared/services/teacher.service';
import { SubjectService } from '../../../shared/services/subject.service';
import { Subject } from '../../../shared/services/subject.service';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi', FRIDAY: 'Vendredi'
};
const LEVEL_LABELS: Record<string, string> = {
  FIRST_YEAR_ENGINEERING: '1ère Ingénierie',
  SECOND_YEAR_ENGINEERING: '2ème Ingénierie',
  THIRD_YEAR_ENGINEERING: '3ème Ingénierie',
  FIRST_YEAR_MASTER: '1ère Master',
  SECOND_YEAR_MASTER: '2ème Master',
};

@Component({
  selector: 'app-schedule-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './schedule-management.html',
  styleUrl: './schedule-management.scss',
})
export class ScheduleManagement implements OnInit {
  schedules: ScheduleResponse[] = [];
  classes: SchoolClassResponse[] = [];
  teachers: TeacherResponse[] = [];
  subjects: Subject[] = [];

  days = DAYS;
  dayLabels = DAY_LABELS;

  showForm = false;
  isEditing = false;
  editingId: number | null = null;

  form: ScheduleRequest = {
    classId: 0,
    teacherId: 0,
    subjectId: 0,
    dayOfWeek: 'MONDAY',
    startTime: '08:00:00',
    endTime: '10:00:00',
    room: '',
    startDate: '',
    endDate: ''
  };

  errorMsg = '';
  successMsg = '';
  loading = false;

  // Filter
  filterClassId: number | '' = '';
  filterDay: string = '';

  constructor(
    private scheduleService: ScheduleService,
    private teacherService: TeacherService,
    private subjectService: SubjectService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.scheduleService.getAllSchedules().subscribe({
      next: (data) => { this.schedules = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.scheduleService.getAllClasses().subscribe({ next: (data) => this.classes = data });
    this.teacherService.getAllTeachers().subscribe({ next: (data) => this.teachers = data });
    this.subjectService.getAllSubjects().subscribe({ next: (data) => this.subjects = data });
  }

  get filteredSchedules(): ScheduleResponse[] {
    return this.schedules.filter(s => {
      const matchClass = this.filterClassId === '' || s.classId === Number(this.filterClassId);
      const matchDay = this.filterDay === '' || s.dayOfWeek === this.filterDay;
      return matchClass && matchDay;
    });
  }

  openCreateForm(): void {
    this.isEditing = false;
    this.editingId = null;
    this.form = { classId: 0, teacherId: 0, subjectId: 0, dayOfWeek: 'MONDAY', startTime: '08:00:00', endTime: '10:00:00', room: '', startDate: '', endDate: '' };
    this.errorMsg = '';
    this.successMsg = '';
    this.showForm = true;
  }

  openEditForm(s: ScheduleResponse): void {
    this.isEditing = true;
    this.editingId = s.id;
    this.form = {
      classId: s.classId,
      teacherId: s.teacherId,
      subjectId: s.subjectId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room ?? '',
      startDate: s.startDate ?? '',
      endDate: s.endDate ?? ''
    };
    this.errorMsg = '';
    this.successMsg = '';
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  saveSchedule(): void {
    if (!this.form.classId || !this.form.teacherId || !this.form.subjectId) {
      this.errorMsg = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    const payload: ScheduleRequest = { ...this.form };

    if (this.isEditing && this.editingId !== null) {
      this.scheduleService.updateSchedule(this.editingId, payload).subscribe({
        next: () => { this.successMsg = 'Emploi du temps mis à jour.'; this.showForm = false; this.loadAll(); },
        error: (e) => { this.errorMsg = e?.error?.message || 'Erreur lors de la mise à jour.'; }
      });
    } else {
      this.scheduleService.createSchedule(payload).subscribe({
        next: () => { this.successMsg = 'Créneau créé avec succès.'; this.showForm = false; this.loadAll(); },
        error: (e) => { this.errorMsg = e?.error?.message || 'Erreur lors de la création.'; }
      });
    }
  }

  deleteSchedule(id: number): void {
    if (!confirm('Supprimer ce créneau ?')) return;
    this.scheduleService.deleteSchedule(id).subscribe({
      next: () => { this.successMsg = 'Créneau supprimé.'; this.loadAll(); },
      error: () => { this.errorMsg = 'Erreur lors de la suppression.'; }
    });
  }

  formatTime(t: string): string {
    return t ? t.substring(0, 5) : '';
  }

  dayLabel(d: string): string {
    return DAY_LABELS[d] ?? d;
  }

  levelLabel(l: string): string {
    return LEVEL_LABELS[l] ?? l;
  }
}

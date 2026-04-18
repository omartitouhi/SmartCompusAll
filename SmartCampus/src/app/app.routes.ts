import { studentGuard } from './core/guards/student-guard';
import { teacherGuard } from './core/guards/teacher-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes = [
  { path: '', loadComponent: () => import('./features/login/login').then(m => m.Login) },
  {
    path: 'student',
    loadComponent: () => import('./features/student/student-dashboard').then(m => m.StudentDashboard),
    canActivate: [studentGuard]
  },
  {
    path: 'teacher',
    loadComponent: () => import('./features/teacher/teacher-dashboard').then(m => m.TeacherDashboard),
    canActivate: [teacherGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/students',
    loadComponent: () => import('./features/admin/student-management/student-management').then(m => m.StudentManagement),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/students/create',
    loadComponent: () => import('./features/admin/create-student/create-student').then(m => m.CreateStudent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/students/search',
    loadComponent: () => import('./features/admin/search-student/search-student').then(m => m.SearchStudent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/filieres',
    loadComponent: () => import('./features/admin/filiere-management/filiere-management').then(m => m.FiliereManagement),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/subjects',
    loadComponent: () => import('./features/admin/subject-management/subject-management').then(m => m.SubjectManagement),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/teachers',
    loadComponent: () => import('./features/admin/teacher-management/teacher-management').then(m => m.TeacherManagement),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/schedules',
    loadComponent: () => import('./features/admin/schedule-management/schedule-management').then(m => m.ScheduleManagement),
    canActivate: [adminGuard]
  },
  {
    path: 'teacher/grades',
    loadComponent: () => import('./features/teacher/grade-management/grade-management').then(m => m.GradeManagement),
    canActivate: [teacherGuard]
  },
  {
    path: 'teacher/schedule',
    loadComponent: () => import('./features/teacher/schedule/teacher-schedule').then(m => m.TeacherSchedule),
    canActivate: [teacherGuard]
  },
  {
    path: 'teacher/files',
    loadComponent: () => import('./features/teacher/file-upload/file-upload').then(m => m.FileUpload),
    canActivate: [teacherGuard]
  },
  {
    path: 'teacher/attendance',
    loadComponent: () => import('./features/teacher/attendance/attendance').then(m => m.AttendanceComponent),
    canActivate: [teacherGuard]
  },
  {
    path: 'student/grades',
    loadComponent: () => import('./features/student/grades/student-grades').then(m => m.StudentGrades),
    canActivate: [studentGuard]
  },
  {
    path: 'student/schedule',
    loadComponent: () => import('./features/student/schedule/student-schedule').then(m => m.StudentSchedule),
    canActivate: [studentGuard]
  },
  {
    path: 'student/files',
    loadComponent: () => import('./features/student/files/student-files').then(m => m.StudentFiles),
    canActivate: [studentGuard]
  },
  { path: '**', redirectTo: '' },
];

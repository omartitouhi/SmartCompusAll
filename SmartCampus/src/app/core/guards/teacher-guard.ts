import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const teacherGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.getRole() === 'teacher') {
    return true;
  }
  return router.createUrlTree(['/']);
};

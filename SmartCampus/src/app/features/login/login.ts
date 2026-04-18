import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { PasswordResetRequestService } from '../../shared/services/password-reset-request.service';
import { ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  loginForm: FormGroup;
  loading = false;
  loginError = '';

  // Forgot password modal
  showForgotModal = false;
  forgotEmail = '';
  forgotLoading = false;
  forgotSuccess = '';
  forgotError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private passwordResetService: PasswordResetRequestService,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.loginError = 'Veuillez saisir un email valide et votre mot de passe.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.loginError = '';
    this.cdr.detectChanges();

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password })
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
      next: (user) => {
        const targetRoute = this.getDashboardRoute(user.role);
        this.router.navigate([targetRoute]).then((navigated) => {
          if (!navigated) {
            this.loginError = 'Login succeeded but navigation failed.';
            this.cdr.detectChanges();
          }
        }).catch(() => {
          this.loginError = 'Login succeeded but dashboard is unreachable.';
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.loginError = this.normalizeLoginError(err);
        this.cdr.detectChanges();
      }
    });
  }

  isInvalid(field: 'email' | 'password'): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  private normalizeLoginError(err: any): string {
    const status = err?.status;
    if (status === 401 || status === 404) {
      return 'Email ou mot de passe incorrect.';
    }
    if (status === 0) {
      return 'Impossible de contacter le serveur.';
    }
    return err?.error?.message ?? err?.message ?? 'Email ou mot de passe incorrect.';
  }

  openForgotModal(): void {
    this.showForgotModal = true;
    this.forgotEmail = '';
    this.forgotSuccess = '';
    this.forgotError = '';
  }

  closeForgotModal(): void {
    this.showForgotModal = false;
  }

  submitForgotRequest(): void {
    if (!this.forgotEmail.trim()) {
      this.forgotError = 'Veuillez saisir votre adresse e-mail.';
      return;
    }
    // Fermer le modal immédiatement — la requête continue en arrière-plan
    const email = this.forgotEmail.trim();
    this.closeForgotModal();

    this.passwordResetService.submitRequest(email).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  private getDashboardRoute(role: 'student' | 'teacher' | 'admin'): string {
    switch (role) {
      case 'student': return '/student';
      case 'teacher': return '/teacher';
      case 'admin':   return '/admin';
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { PasswordResetRequestService } from '../../shared/services/password-reset-request.service';

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
    private passwordResetService: PasswordResetRequestService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.loginError = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (user) => {
        const targetRoute = this.getDashboardRoute(user.role);
        this.router.navigate([targetRoute]).then((navigated) => {
          this.loading = false;
          if (!navigated) {
            this.loginError = 'Login succeeded but navigation failed.';
          }
        }).catch(() => {
          this.loading = false;
          this.loginError = 'Login succeeded but dashboard is unreachable.';
        });
      },
      error: (err) => {
        this.loading = false;
        this.loginError = err?.error?.message ?? err?.message ?? 'Invalid email or password';
      }
    });
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

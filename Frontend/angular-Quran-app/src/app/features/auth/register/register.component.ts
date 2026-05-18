import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-card">
      <h3 class="auth-title">إنشاء حساب جديد</h3>
      <p class="auth-subtitle">سجّل الآن للاستمتاع بتلاوات القرآن الكريم</p>

      <div class="auth-error" *ngIf="error()">{{ error() }}</div>

      <form (ngSubmit)="onSubmit()" class="auth-form">
        <div class="form-group">
          <label for="name">الاسم الكامل</label>
          <input type="text" id="name" [(ngModel)]="name" name="name"
                 placeholder="أدخل اسمك" required>
        </div>
        <div class="form-group">
          <label for="email">البريد الإلكتروني</label>
          <input type="email" id="email" [(ngModel)]="email" name="email"
                 placeholder="example@email.com" required>
        </div>
        <div class="form-group">
          <label for="password">كلمة المرور</label>
          <input type="password" id="password" [(ngModel)]="password" name="password"
                 placeholder="••••••••" required>
        </div>
        <div class="form-group">
          <label for="confirmPassword">تأكيد كلمة المرور</label>
          <input type="password" id="confirmPassword" [(ngModel)]="confirmPassword" name="confirmPassword"
                 placeholder="••••••••" required>
        </div>
        <button type="submit" class="auth-submit-btn" [disabled]="isLoading()">
          {{ isLoading() ? 'جاري التسجيل...' : 'إنشاء الحساب' }}
        </button>
      </form>

      <div class="auth-footer">
        لديك حساب بالفعل؟ <a routerLink="/auth/login">سجّل الدخول</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px 28px;
    }
    .auth-title {
      font-size: 22px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 6px;
      text-align: center;
    }
    .auth-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 24px;
    }
    .auth-error {
      background: rgba(220, 50, 50, 0.15);
      border: 1px solid rgba(220, 50, 50, 0.3);
      color: #ff6b6b;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
      text-align: center;
    }
    .auth-form { display: flex; flex-direction: column; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 500;
    }
    .form-group input {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 14px;
      color: var(--text);
      font-family: var(--font-ui);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      direction: ltr;
      text-align: right;
    }
    .form-group input:focus { border-color: var(--green-light); }
    .form-group input::placeholder { color: rgba(255,255,255,0.25); }
    .auth-submit-btn {
      background: var(--green);
      border: none;
      border-radius: 10px;
      padding: 14px;
      color: #fff;
      font-family: var(--font-ui);
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      margin-top: 4px;
    }
    .auth-submit-btn:hover:not(:disabled) { background: var(--green-glow); transform: scale(1.01); }
    .auth-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .auth-footer a {
      color: var(--gold-light);
      text-decoration: none;
      font-weight: 600;
    }
    .auth-footer a:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    if (!this.name || !this.email || !this.password) {
      this.error.set('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('كلمة المرور وتأكيدها غير متطابقتين');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.authService.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'حدث خطأ أثناء التسجيل');
      }
    });
  }
}

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="auth-layout">
      <div class="auth-bg-pattern"></div>
      <div class="auth-container">
        <div class="auth-logo">
          <span class="auth-logo-icon">📖</span>
          <h2 class="auth-logo-text">تطبيق القرآن الكريم</h2>
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0a0f0d 0%, #0f2d1f 40%, #0a1a12 100%);
      position: relative;
      overflow: hidden;
      padding: 20px;
    }
    .auth-bg-pattern {
      position: absolute;
      inset: 0;
      opacity: 0.04;
      background-image:
        repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 30deg, rgba(212,160,23,0.5) 30deg, rgba(212,160,23,0.5) 32deg, transparent 32deg, transparent 60deg);
      background-size: 60px 60px;
    }
    .auth-container {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 420px;
    }
    .auth-logo {
      text-align: center;
      margin-bottom: 32px;
    }
    .auth-logo-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 12px;
    }
    .auth-logo-text {
      font-family: var(--font-ar);
      font-size: 28px;
      color: var(--gold-light);
      font-weight: 700;
    }
  `]
})
export class AuthLayoutComponent {}

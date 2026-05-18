import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AudioPlayerComponent } from '../../shared/components/audio-player/audio-player.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AudioPlayerComponent],
  template: `
    <div class="app-container">
      <!-- Top Navigation Tabs -->
      <div class="page-tabs">
        <button class="tab-btn" [class.active]="isActive('/home')" routerLink="/home">الرئيسية</button>
        <button class="tab-btn" [class.active]="isActive('/surahs')" routerLink="/surahs">السور</button>
        <button class="tab-btn" [class.active]="isActive('/reciters')" routerLink="/reciters">القراء</button>
        <button class="tab-btn" [class.active]="isActive('/collections')" routerLink="/collections">مكتبتي</button>

        <ng-container *ngIf="authService.isLoggedIn()">
          <button class="tab-btn" [class.active]="isActive('/profile')" routerLink="/profile">حسابي</button>
          <button class="tab-btn admin-tab" *ngIf="authService.isAdmin()" [class.active]="isActive('/admin')" routerLink="/admin">لوحة التحكم</button>
        </ng-container>

        <button class="tab-btn auth-tab" *ngIf="!authService.isLoggedIn()" routerLink="/auth/login">دخول</button>
      </div>

      <!-- Main Content Area -->
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>

      <!-- Persistent Audio Player -->
      <app-audio-player></app-audio-player>
    </div>
  `,
  styles: [`
    .app-container {
      position: relative;
      min-height: 100vh;
    }
    .main-content {
      padding-bottom: 110px;
    }
    .admin-tab {
      color: var(--gold-light) !important;
    }
    .auth-tab {
      color: var(--green-light) !important;
      margin-right: auto;
    }
  `]
})
export class MainLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }
}

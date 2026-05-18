import { Component, Input, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reciter } from '../../../core/services/reciter.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-reciter-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reciter-card" *ngIf="reciter">
      <div class="reciter-avatar" [style.background-image]="'url(' + getImageUrl() + ')'" style="background-size: cover; background-position: center;">
        <div class="verified-badge" *ngIf="reciter.isVerified">
          <i class="fas fa-check" style="font-size: 8px; color: white;"></i>
        </div>
      </div>
      <div class="reciter-name">{{ reciter.name }}</div>
      <div class="reciter-style">{{ reciter.styles ? reciter.styles[0] : 'مرتل' }}</div>
      <div class="reciter-followers">{{ reciter.followers || 0 }} متابع</div>
      <button class="follow-btn" [class.following]="isFollowed()" (click)="toggleFollow()" [attr.aria-label]="isFollowed() ? 'إلغاء المتابعة' : 'متابعة القارئ'">
        <i class="fas fa-spinner fa-spin" *ngIf="isLoadingFollow()"></i>
        <span *ngIf="!isLoadingFollow()">{{ isFollowed() ? 'إلغاء المتابعة' : 'متابعة' }}</span>
      </button>
    </div>
  `,
  styleUrls: []
})
export class ReciterCardComponent {
  @Input() reciter!: Reciter;
  authService = inject(AuthService);
  private router = inject(Router);

  isFollowed = computed(() => {
    return this.authService.followedReciterIds().includes(this.reciter._id);
  });

  isLoadingFollow = signal(false);

  getImageUrl(): string {
    if (!this.reciter.image) return '';
    // If it's a relative path starting with /
    if (this.reciter.image.startsWith('/')) {
        return encodeURI(`http://localhost:5000${this.reciter.image}`);
    }
    return this.reciter.image;
  }

  toggleFollow() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.isLoadingFollow()) return;
    this.isLoadingFollow.set(true);

    this.authService.toggleFollowReciter(this.reciter._id).subscribe({
      next: () => {
        this.isLoadingFollow.set(false);
      },
      error: (err) => {
        console.error('Failed to toggle follow', err);
        this.isLoadingFollow.set(false);
      }
    });
  }
}

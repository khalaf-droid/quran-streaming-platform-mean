import { Component, Input, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Recitation } from '../../../core/services/recitation.service';
import { AudioService, AudioTrack } from '../../../core/services/audio.service';

@Component({
  selector: 'app-recitation-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rec-item" *ngIf="recitation">
      <div class="rec-cover" [style.background-image]="'url(' + getCoverUrl() + ')'" style="background-size: cover; background-position: center;">
        <i class="fas fa-quran" *ngIf="!recitation.coverImage"></i>
      </div>
      <div class="rec-info">
        <div class="rec-title">{{ recitation.title }}</div>
        <div class="rec-sub">
          <span>{{ recitation.reciter?.name || 'قارئ غير معروف' }}</span>
          <span>•</span>
          <span>{{ recitation.style || 'مرتل' }}</span>
        </div>
      </div>
      <div class="rec-actions">
        <!-- Optional Waveform Animation when playing -->
        <div class="waveform" *ngIf="isPlaying()">
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
          <div class="wave-bar"></div>
        </div>
        <button class="heart-btn" [class.liked]="isLiked()" (click)="toggleLike()" aria-label="إضافة للمفضلة">
          <i class="fas fa-heart"></i>
        </button>
        <button class="play-btn-sm" [class.playing]="isPlaying()" (click)="togglePlay()" aria-label="تشغيل أو إيقاف مؤقت">
          <i class="fas" [class.fa-play]="!isPlaying()" [class.fa-pause]="isPlaying()"></i>
        </button>
      </div>
    </div>
  `,
  styleUrls: []
})
export class RecitationItemComponent {
  @Input() recitation!: Recitation;
  audioService = inject(AudioService);
  authService = inject(AuthService);
  private router = inject(Router);

  isLiked = computed(() => {
    return this.authService.favoriteRecitationIds().includes(this.recitation._id);
  });

  isPlaying = computed(() => {
    const track = this.audioService.currentTrack();
    return track?._id === this.recitation._id && this.audioService.isPlaying();
  });

  isLoadingLike = signal(false);

  getCoverUrl(): string {
    if (!this.recitation.coverImage) return '';
    if (this.recitation.coverImage.startsWith('/')) {
        return `http://localhost:5000${this.recitation.coverImage}`;
    }
    return this.recitation.coverImage;
  }

  togglePlay() {
    if (this.isPlaying()) {
      this.audioService.pause();
    } else {
      const track: AudioTrack = {
        _id: this.recitation._id,
        title: this.recitation.title,
        audioUrl: this.recitation.audioUrl,
        coverImage: this.getCoverUrl(),
        reciter: { name: this.recitation.reciter?.name || 'Unknown' }
      };
      this.audioService.play(track);
    }
  }

  toggleLike() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.isLoadingLike()) return;
    this.isLoadingLike.set(true);

    this.authService.toggleFavoriteRecitation(this.recitation._id).subscribe({
      next: () => {
        this.isLoadingLike.set(false);
      },
      error: (err) => {
        console.error('Failed to toggle favorite', err);
        this.isLoadingLike.set(false);
        // We could show a toast here in the future
      }
    });
  }
}

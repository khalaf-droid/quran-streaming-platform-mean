import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper" [ngClass]="type">
      <ng-container *ngIf="type === 'recitation'">
        <div class="skel-cover"></div>
        <div class="skel-info">
          <div class="skel-line skel-title"></div>
          <div class="skel-line skel-sub"></div>
        </div>
        <div class="skel-actions">
          <div class="skel-btn"></div>
          <div class="skel-btn"></div>
        </div>
      </ng-container>

      <ng-container *ngIf="type === 'reciter'">
        <div class="skel-avatar"></div>
        <div class="skel-line skel-name"></div>
        <div class="skel-line skel-style"></div>
        <div class="skel-btn-wide"></div>
      </ng-container>
    </div>
  `,
  styles: [`
    .skeleton-wrapper {
      position: relative;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .skeleton-wrapper::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.05) 50%,
        rgba(255, 255, 255, 0) 100%
      );
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .skel-line {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      margin-bottom: 8px;
    }

    /* Recitation Type */
    .skeleton-wrapper.recitation {
      display: flex;
      align-items: center;
      padding: 12px;
      gap: 16px;
      height: 74px;
    }
    .recitation .skel-cover {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      flex-shrink: 0;
    }
    .recitation .skel-info {
      flex: 1;
    }
    .recitation .skel-title {
      width: 60%;
      height: 14px;
    }
    .recitation .skel-sub {
      width: 40%;
      height: 10px;
    }
    .recitation .skel-actions {
      display: flex;
      gap: 12px;
    }
    .recitation .skel-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
    }

    /* Reciter Type */
    .skeleton-wrapper.reciter {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 20px;
      height: 250px;
    }
    .reciter .skel-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      margin-bottom: 16px;
    }
    .reciter .skel-name {
      width: 70%;
      height: 16px;
    }
    .reciter .skel-style {
      width: 40%;
      height: 12px;
      margin-bottom: 20px;
    }
    .reciter .skel-btn-wide {
      width: 100px;
      height: 36px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.05);
      margin-top: auto;
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'recitation' | 'reciter' = 'recitation';
}

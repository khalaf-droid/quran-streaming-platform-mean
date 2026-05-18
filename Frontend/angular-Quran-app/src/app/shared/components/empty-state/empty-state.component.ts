import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="empty-state-wrapper">
      <div class="empty-icon">
        <i class="fas" [ngClass]="icon"></i>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message">{{ message }}</p>
      
      <a *ngIf="ctaLink && ctaText" [routerLink]="ctaLink" class="empty-cta">
        {{ ctaText }}
      </a>
      <button *ngIf="!ctaLink && ctaText" class="empty-cta" (click)="ctaClick.emit()">
        {{ ctaText }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 20px;
      border: 1px dashed rgba(255, 255, 255, 0.1);
      margin: 20px 0;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(212, 175, 55, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }

    .empty-icon i {
      font-size: 32px;
      color: var(--gold-light);
    }

    .empty-title {
      font-size: 1.5rem;
      color: white;
      margin-bottom: 12px;
    }

    .empty-message {
      font-size: 1rem;
      color: var(--text-muted);
      max-width: 400px;
      line-height: 1.6;
      margin-bottom: 32px;
    }

    .empty-cta {
      display: inline-block;
      padding: 12px 32px;
      background: var(--gold-light);
      color: #000;
      border: none;
      border-radius: 30px;
      font-weight: bold;
      font-size: 1rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .empty-cta:hover {
      background: var(--gold-dark);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = 'fa-folder-open';
  @Input() title: string = 'لا توجد بيانات';
  @Input() message: string = 'لم يتم العثور على أي بيانات لعرضها هنا في الوقت الحالي.';
  @Input() ctaText?: string;
  @Input() ctaLink?: string | any[];
  
  // Custom event if needed instead of router link
  @Input() ctaClick: any = { emit: () => {} };
}

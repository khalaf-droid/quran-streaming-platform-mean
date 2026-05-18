import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts()" 
           class="toast-message" 
           [ngClass]="'toast-' + toast.type"
           @fadeAnimation>
        <i class="fas" [ngClass]="getIcon(toast.type)"></i>
        <span class="message">{{ toast.message }}</span>
        <button class="close-btn" (click)="toastService.remove(toast.id)" aria-label="إغلاق الإشعار">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    .toast-message {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      border-radius: 12px;
      background: rgba(26, 32, 44, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      color: white;
      min-width: 300px;
      direction: rtl;
    }
    .toast-success { border-right: 4px solid #10B981; }
    .toast-error { border-right: 4px solid #EF4444; }
    .toast-info { border-right: 4px solid #3B82F6; }
    
    .toast-success i.fas:first-child { color: #10B981; }
    .toast-error i.fas:first-child { color: #EF4444; }
    .toast-info i.fas:first-child { color: #3B82F6; }
    
    .message {
      flex: 1;
      font-size: 0.95rem;
    }
    .close-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      padding: 5px;
      transition: color 0.2s ease;
    }
    .close-btn:hover {
      color: white;
    }
  `],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.9)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateY(10px) scale(0.9)' }))
      ])
    ])
  ]
})
export class ToastComponent {
  toastService = inject(ToastService);

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'info': return 'fa-info-circle';
      default: return 'fa-info-circle';
    }
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { RecitationItemComponent } from '../../shared/components/recitation-item/recitation-item.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, RecitationItemComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="page active">
      <div *ngIf="isLoading()">
        <div class="profile-hero">
          <div class="skel-avatar" style="width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.05); margin:0 auto 16px;"></div>
          <div class="skel-line" style="width:150px; height:20px; margin:0 auto 8px;"></div>
          <div class="skel-line" style="width:200px; height:14px; margin:0 auto;"></div>
        </div>
        <div class="section">
          <app-skeleton type="recitation" *ngFor="let _ of [1,2,3]"></app-skeleton>
        </div>
      </div>

      <ng-container *ngIf="!isLoading() && profile()">
        <!-- PROFILE HERO -->
        <div class="profile-hero">
          <div class="islamic-pattern"></div>
          <div class="profile-avatar"
               [style.background-image]="getAvatarUrl() ? 'url(' + getAvatarUrl() + ')' : ''"
               style="background-size: cover; background-position: center;">
            <span *ngIf="!getAvatarUrl()">👤</span>
            <div class="avatar-edit">✏️</div>
          </div>
          <div class="profile-name">{{ profile()!.name }}</div>
          <div class="profile-email">{{ profile()!.email }}</div>
          <div class="profile-stats">
            <div>
              <div class="pstat-num">{{ profile()!.favoriteRecitations?.length || 0 }}</div>
              <div class="pstat-label">المفضلة</div>
            </div>
            <div>
              <div class="pstat-num">{{ profile()!.followedReciters?.length || 0 }}</div>
              <div class="pstat-label">متابَعون</div>
            </div>
            <div>
              <div class="pstat-num">{{ profile()!.followedCollections?.length || 0 }}</div>
              <div class="pstat-label">مجموعات</div>
            </div>
          </div>
        </div>

        <!-- PROFILE TABS -->
        <div class="profile-tabs">
          <div class="ptab" [class.active]="activeTab === 'favorites'" (click)="activeTab = 'favorites'">المفضلة</div>
          <div class="ptab" [class.active]="activeTab === 'reciters'" (click)="activeTab = 'reciters'">القراء المتابَعون</div>
        </div>

        <!-- TAB CONTENT -->
        <div class="section" *ngIf="activeTab === 'favorites'">
          <div class="recitation-list" *ngIf="profile()!.favoriteRecitations && profile()!.favoriteRecitations.length > 0; else noFav">
            <app-recitation-item *ngFor="let rec of profile()!.favoriteRecitations" [recitation]="rec"></app-recitation-item>
          </div>
          <ng-template #noFav>
            <app-empty-state 
              icon="fa-heart" 
              title="لا توجد مفضلة" 
              message="لم تقم بإضافة أي تلاوة إلى مفضلتك حتى الآن."
              ctaText="استكشف التلاوات"
              ctaLink="/home"
            ></app-empty-state>
          </ng-template>
        </div>

        <div class="section" *ngIf="activeTab === 'reciters'">
          <div class="reciters-followed" *ngIf="profile()!.followedReciters && profile()!.followedReciters.length > 0; else noFollowed">
            <div class="followed-item" *ngFor="let r of profile()!.followedReciters" [routerLink]="['/reciters', r._id]">
              <div class="followed-avatar">🎙️</div>
              <span class="followed-name">{{ r.name }}</span>
            </div>
          </div>
          <ng-template #noFollowed>
            <app-empty-state 
              icon="fa-user-plus" 
              title="لا تتابع أحداً" 
              message="قم بمتابعة القراء المفضلين لديك لتصلك أحدث تلاواتهم."
              ctaText="تصفح القراء"
              ctaLink="/reciters"
            ></app-empty-state>
          </ng-template>
        </div>

        <!-- LOGOUT -->
        <div class="section" style="text-align: center;">
          <button class="logout-btn" (click)="logout()">تسجيل الخروج</button>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .reciters-followed {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .followed-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .followed-item:hover {
      border-color: rgba(82,183,136,0.4);
      transform: translateY(-2px);
    }
    .followed-avatar {
      font-size: 24px;
    }
    .followed-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
    }
    .logout-btn {
      background: rgba(220, 50, 50, 0.15);
      border: 1px solid rgba(220, 50, 50, 0.3);
      color: #ff6b6b;
      padding: 12px 32px;
      border-radius: 10px;
      font-family: var(--font-ui);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .logout-btn:hover {
      background: rgba(220, 50, 50, 0.25);
    }
  `]
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);

  profile = signal<any>(null);
  isLoading = signal(true);
  activeTab = 'favorites';

  ngOnInit() {
    this.loadProfile();
  }

  private loadProfile() {
    this.isLoading.set(true);
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.profile.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getAvatarUrl(): string {
    const p = this.profile();
    if (!p || !p.profilePicture) return '';
    if (p.profilePicture.startsWith('/')) return `http://localhost:5000${p.profilePicture}`;
    return p.profilePicture;
  }

  logout() {
    this.authService.logout();
  }
}

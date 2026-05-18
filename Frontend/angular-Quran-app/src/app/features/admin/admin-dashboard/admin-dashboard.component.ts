import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SurahService } from '../../../core/services/surah.service';
import { ReciterService } from '../../../core/services/reciter.service';
import { RecitationService } from '../../../core/services/recitation.service';
import { CollectionService } from '../../../core/services/collection.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page active">
      <!-- ADMIN HEADER -->
      <div class="admin-header">
        <div class="admin-title">لوحة التحكم</div>
        <div class="admin-subtitle">إدارة محتوى تطبيق القرآن الكريم</div>
      </div>

      <!-- STATS CARDS -->
      <div class="stats-cards">
        <div class="stat-card green">
          <div class="stat-card-icon">📖</div>
          <div class="stat-card-num">{{ stats().totalSurahs }}</div>
          <div class="stat-card-label">سورة</div>
        </div>
        <div class="stat-card gold">
          <div class="stat-card-icon">🎙️</div>
          <div class="stat-card-num">{{ stats().totalReciters }}</div>
          <div class="stat-card-label">قارئ</div>
        </div>
        <div class="stat-card blue">
          <div class="stat-card-icon">🎵</div>
          <div class="stat-card-num">{{ stats().totalRecitations }}</div>
          <div class="stat-card-label">تلاوة</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-card-icon">📚</div>
          <div class="stat-card-num">{{ stats().totalCollections }}</div>
          <div class="stat-card-label">مجموعة</div>
        </div>
      </div>

      <!-- RECENT RECITERS TABLE -->
      <div class="section">
        <div class="section-header">
          <div class="section-title">أحدث القراء</div>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الأنماط</th>
                <th>المتابعون</th>
                <th>موثّق</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of reciters()">
                <td>{{ r.name }}</td>
                <td>{{ r.styles?.join(', ') || '-' }}</td>
                <td>{{ r.followers || 0 }}</td>
                <td>
                  <span [style.color]="r.isVerified ? 'var(--green-light)' : 'var(--text-muted)'">
                    {{ r.isVerified ? '✓ موثّق' : '✗ غير موثّق' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="reciters().length === 0">
                <td colspan="4" style="text-align:center; color: var(--text-muted);">لا توجد بيانات</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- RECENT RECITATIONS TABLE -->
      <div class="section">
        <div class="section-header">
          <div class="section-title">أحدث التلاوات</div>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>العنوان</th>
                <th>القارئ</th>
                <th>النمط</th>
                <th>المشاهدات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rec of recitations()">
                <td>{{ rec.title }}</td>
                <td>{{ rec.reciter?.name || '-' }}</td>
                <td>{{ rec.style || 'مرتل' }}</td>
                <td>{{ rec.plays || 0 }}</td>
              </tr>
              <tr *ngIf="recitations().length === 0">
                <td colspan="4" style="text-align:center; color: var(--text-muted);">لا توجد بيانات</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styleUrls: []
})
export class AdminDashboardComponent implements OnInit {
  private surahService = inject(SurahService);
  private reciterService = inject(ReciterService);
  private recitationService = inject(RecitationService);
  private collectionService = inject(CollectionService);

  stats = signal({ totalSurahs: 0, totalReciters: 0, totalRecitations: 0, totalCollections: 0 });
  reciters = signal<any[]>([]);
  recitations = signal<any[]>([]);

  ngOnInit() {
    this.loadStats();
  }

  private loadStats() {
    this.surahService.getSurahs(1, 1).subscribe({
      next: (res) => this.stats.update(s => ({ ...s, totalSurahs: res.totalSurahs })),
      error: () => {}
    });
    this.reciterService.getReciters(1, 10).subscribe({
      next: (res) => {
        this.stats.update(s => ({ ...s, totalReciters: res.totalReciters }));
        this.reciters.set(res.reciters);
      },
      error: () => {}
    });
    this.recitationService.getNewReleases(10).subscribe({
      next: (res: any) => {
        const arr = Array.isArray(res) ? res : (res.recitations || []);
        this.stats.update(s => ({ ...s, totalRecitations: arr.length }));
        this.recitations.set(arr);
      },
      error: () => {}
    });
    this.collectionService.getCollections(1, 1).subscribe({
      next: (res) => this.stats.update(s => ({ ...s, totalCollections: res.totalCollections })),
      error: () => {}
    });
  }
}

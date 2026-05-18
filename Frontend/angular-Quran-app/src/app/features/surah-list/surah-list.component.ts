import { Component, inject, OnInit, signal, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SurahService, Surah } from '../../core/services/surah.service';
import { SurahCardComponent } from '../../shared/components/surah-card/surah-card.component';

@Component({
  selector: 'app-surah-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SurahCardComponent],
  template: `
    <div class="page active">
      <div class="section">

        <!-- Header + Controls -->
        <div class="surah-list-header">
          <div class="section-title">سور القرآن الكريم</div>
          <div class="surah-list-total" *ngIf="totalSurahs() > 0">{{ totalSurahs() }} سورة</div>
        </div>

        <!-- Search & Filter Bar -->
        <div class="surah-controls">
          <div class="surah-search-box">
            <i class="fas fa-search surah-search-icon"></i>
            <input
              type="text"
              class="surah-search-input"
              placeholder="ابحث عن سورة بالعربي أو الإنجليزي..."
              [value]="searchQuery()"
              (input)="onSearchInput($any($event.target).value)"
              autocomplete="off"
            >
            <button class="surah-clear-btn" *ngIf="searchQuery()" (click)="clearSearch()">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="surah-filter-group">
            <button class="filter-btn" [class.active]="activeFilter() === 'all'" (click)="setFilter('all')">الكل</button>
            <button class="filter-btn" [class.active]="activeFilter() === 'Meccan'" (click)="setFilter('Meccan')">مكية</button>
            <button class="filter-btn" [class.active]="activeFilter() === 'Medinan'" (click)="setFilter('Medinan')">مدنية</button>
          </div>
        </div>

        <!-- Loading -->
        <div class="surah-state-msg" *ngIf="isLoading()">
          <i class="fas fa-spinner fa-spin"></i> جاري التحميل...
        </div>

        <!-- Error -->
        <div class="surah-state-msg" style="color: #e57373;" *ngIf="error()">
          <i class="fas fa-exclamation-circle"></i> {{ error() }}
        </div>

        <!-- Surahs Grid -->
        <div class="cards-grid" *ngIf="!isLoading() && !error()">
          <app-surah-card *ngFor="let surah of surahs()" [surah]="surah"></app-surah-card>
        </div>

        <!-- Empty State -->
        <div class="surah-empty-state" *ngIf="!isLoading() && !error() && surahs().length === 0">
          <i class="fas fa-book-open"></i>
          <p>لا توجد سور تطابق بحثك</p>
          <button class="filter-btn active" (click)="clearSearch()">إعادة الضبط</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .surah-list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .surah-list-total {
      font-size: 0.85rem;
      color: var(--text-muted, #888);
      background: rgba(212,175,55,0.1);
      padding: 4px 14px;
      border-radius: 20px;
      border: 1px solid rgba(212,175,55,0.2);
    }

    .surah-controls {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 28px;
      flex-wrap: wrap;
    }

    .surah-search-box {
      position: relative;
      flex: 1;
      min-width: 200px;
    }

    .surah-search-icon {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gold-light, #d4af37);
      font-size: 0.9rem;
      pointer-events: none;
    }

    .surah-search-input {
      width: 100%;
      padding: 11px 40px 11px 40px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: var(--text-primary, #f0f0f0);
      font-size: 0.9rem;
      direction: rtl;
      transition: border-color 0.2s, background 0.2s;
      box-sizing: border-box;
    }

    .surah-search-input:focus {
      outline: none;
      border-color: rgba(212,175,55,0.4);
      background: rgba(255,255,255,0.09);
    }

    .surah-search-input::placeholder {
      color: rgba(255,255,255,0.3);
    }

    .surah-clear-btn {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted, #888);
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      transition: color 0.2s;
    }

    .surah-clear-btn:hover {
      color: #e57373;
    }

    .surah-filter-group {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .filter-btn {
      padding: 9px 18px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.6);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      background: rgba(212,175,55,0.1);
      border-color: rgba(212,175,55,0.3);
      color: var(--gold-light, #d4af37);
    }

    .filter-btn.active {
      background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1));
      border-color: rgba(212,175,55,0.5);
      color: var(--gold-light, #d4af37);
      font-weight: 700;
    }

    .surah-state-msg {
      text-align: center;
      padding: 40px;
      color: var(--gold-light, #d4af37);
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .surah-empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted, #888);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    .surah-empty-state i {
      font-size: 2.5rem;
      color: var(--gold-light, #d4af37);
      opacity: 0.4;
    }

    .surah-empty-state p {
      font-size: 1rem;
      margin: 0;
    }
  `]
})
export class SurahListComponent implements OnInit {
  private surahService = inject(SurahService);
  private destroyRef = inject(DestroyRef);

  surahs = signal<Surah[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  totalSurahs = signal(0);

  searchQuery = signal('');
  activeFilter = signal<'all' | 'Meccan' | 'Medinan'>('all');

  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.loadSurahs();

    // Debounced search
    this.searchSubject.pipe(
      debounceTime(350),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.loadSurahs());
  }

  onSearchInput(value: string) {
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.activeFilter.set('all');
    this.loadSurahs();
  }

  setFilter(filter: 'all' | 'Meccan' | 'Medinan') {
    this.activeFilter.set(filter);
    this.loadSurahs();
  }

  private loadSurahs() {
    this.isLoading.set(true);
    this.error.set(null);

    const search = this.searchQuery().trim() || undefined;
    const revelationType = this.activeFilter() === 'all' ? undefined : this.activeFilter();

    this.surahService.getSurahs(1, 114, search, revelationType).subscribe({
      next: (res) => {
        this.surahs.set(res.surahs);
        this.totalSurahs.set(res.totalSurahs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('حدث خطأ أثناء تحميل السور');
        this.isLoading.set(false);
      }
    });
  }
}

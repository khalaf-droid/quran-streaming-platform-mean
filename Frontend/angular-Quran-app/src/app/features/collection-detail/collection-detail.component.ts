import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CollectionService, Collection } from '../../core/services/collection.service';
import { RecitationItemComponent } from '../../shared/components/recitation-item/recitation-item.component';

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [CommonModule, RecitationItemComponent],
  template: `
    <div class="page active">
      <div *ngIf="isLoading()" style="text-align:center; padding: 40px; color: var(--gold-light);">جاري التحميل...</div>
      <div *ngIf="error()" style="text-align:center; padding: 40px; color: red;">{{ error() }}</div>

      <ng-container *ngIf="!isLoading() && !error() && collection()">
        <!-- COLLECTION HERO -->
        <div class="coll-hero">
          <div class="coll-hero-cover"
               [style.background-image]="getCoverUrl() ? 'url(' + getCoverUrl() + ')' : ''"
               style="background-size: cover; background-position: center;">
            <span *ngIf="!getCoverUrl()" style="font-size: 56px;">📚</span>
          </div>
          <div class="coll-hero-info">
            <h2 class="coll-hero-name">{{ collection()!.name }}</h2>
            <p class="coll-hero-desc">{{ collection()!.description }}</p>
            <div class="coll-hero-meta">
              <span>{{ collection()!.creator?.name || 'مجهول' }}</span>
              <span>•</span>
              <span>{{ collection()!.recitations.length || 0 }} تلاوة</span>
              <span>•</span>
              <span>{{ collection()!.followers || 0 }} متابع</span>
            </div>
          </div>
        </div>

        <!-- RECITATIONS -->
        <div class="section">
          <div class="section-header">
            <div class="section-title">التلاوات</div>
          </div>
          <div class="recitation-list" *ngIf="collection()!.recitations && collection()!.recitations.length > 0; else noRec">
            <app-recitation-item *ngFor="let rec of collection()!.recitations" [recitation]="rec"></app-recitation-item>
          </div>
          <ng-template #noRec>
            <div style="text-align:center; padding: 20px; color: var(--text-muted);">لا توجد تلاوات في هذه المجموعة بعد</div>
          </ng-template>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .coll-hero {
      background: linear-gradient(135deg, #0a1f15 0%, #112918 50%, #0a1a10 100%);
      padding: 32px 24px;
      display: flex;
      gap: 24px;
      align-items: center;
      flex-wrap: wrap;
    }
    .coll-hero-cover {
      width: 120px; height: 120px;
      border-radius: 16px;
      background: linear-gradient(135deg, #0f2d1f, #1a3020);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid var(--border);
    }
    .coll-hero-info { flex: 1; min-width: 200px; }
    .coll-hero-name {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }
    .coll-hero-desc {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.7;
      margin-bottom: 12px;
    }
    .coll-hero-meta {
      display: flex;
      gap: 8px;
      font-size: 12px;
      color: var(--gold-light);
    }
  `]
})
export class CollectionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private collectionService = inject(CollectionService);

  collection = signal<Collection | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadCollection(id);
    });
  }

  private loadCollection(id: string) {
    this.isLoading.set(true);
    this.collectionService.getCollectionById(id).subscribe({
      next: (res) => {
        this.collection.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('حدث خطأ أثناء تحميل المجموعة');
        this.isLoading.set(false);
      }
    });
  }

  getCoverUrl(): string {
    const c = this.collection();
    if (!c || !c.coverImage) return '';
    if (c.coverImage.startsWith('/')) return `http://localhost:5000${c.coverImage}`;
    return c.coverImage;
  }
}

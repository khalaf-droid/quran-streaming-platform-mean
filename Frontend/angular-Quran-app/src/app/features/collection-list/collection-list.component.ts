import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CollectionService, Collection } from '../../core/services/collection.service';

@Component({
  selector: 'app-collection-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page active" style="padding-top: 20px;">
      <div class="section">
        <div class="section-header">
          <div class="section-title">المجموعات</div>
        </div>

        <div *ngIf="isLoading()" style="text-align:center; padding: 40px; color: var(--gold-light);">جاري التحميل...</div>
        <div *ngIf="error()" style="text-align:center; padding: 40px; color: red;">{{ error() }}</div>

        <div class="collection-grid" *ngIf="!isLoading() && !error()">
          <div class="collection-card" *ngFor="let coll of collections()" [routerLink]="['/collections', coll._id]">
            <div class="coll-img"
                 [style.background-image]="coll.coverImage ? 'url(' + getCoverUrl(coll) + ')' : ''"
                 style="background-size: cover; background-position: center;">
              <span *ngIf="!coll.coverImage" style="font-size: 36px;">📚</span>
              <div class="coll-count">{{ coll.recitations.length || 0 }} تلاوة</div>
            </div>
            <div class="coll-body">
              <div class="coll-name">{{ coll.name }}</div>
              <div class="coll-meta">{{ coll.creator?.name || 'مجهول' }} • {{ coll.followers || 0 }} متابع</div>
            </div>
          </div>
        </div>

        <div *ngIf="!isLoading() && !error() && collections().length === 0" 
             style="text-align:center; padding: 40px; color: var(--text-muted);">
          لا توجد مجموعات حالياً
        </div>
      </div>
    </div>
  `,
  styleUrls: []
})
export class CollectionListComponent implements OnInit {
  private collectionService = inject(CollectionService);

  collections = signal<Collection[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadCollections();
  }

  private loadCollections() {
    this.isLoading.set(true);
    this.collectionService.getCollections(1, 30).subscribe({
      next: (res) => {
        this.collections.set(res.collections);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('حدث خطأ أثناء تحميل المجموعات');
        this.isLoading.set(false);
      }
    });
  }

  getCoverUrl(coll: Collection): string {
    if (!coll.coverImage) return '';
    if (coll.coverImage.startsWith('/')) return `http://localhost:5000${coll.coverImage}`;
    return coll.coverImage;
  }
}

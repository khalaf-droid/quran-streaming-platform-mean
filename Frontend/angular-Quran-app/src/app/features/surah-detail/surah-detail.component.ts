import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SurahService, Surah } from '../../core/services/surah.service';
import { RecitationItemComponent } from '../../shared/components/recitation-item/recitation-item.component';

@Component({
  selector: 'app-surah-detail',
  standalone: true,
  imports: [CommonModule, RecitationItemComponent],
  templateUrl: './surah-detail.component.html',
  styleUrls: ['./surah-detail.component.css']
})
export class SurahDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private surahService = inject(SurahService);

  surah = signal<any>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadSurah(id);
      }
    });
  }

  private loadSurah(id: string) {
    this.isLoading.set(true);
    this.surahService.getSurahById(id).subscribe({
      next: (res) => {
        this.surah.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('حدث خطأ أثناء تحميل السورة');
        this.isLoading.set(false);
      }
    });
  }
}

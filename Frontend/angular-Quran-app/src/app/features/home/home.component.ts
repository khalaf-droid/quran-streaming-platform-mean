import { Component, inject, OnInit, signal, computed, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { debounceTime, Subject, switchMap, of, forkJoin, catchError } from 'rxjs';
import { RecitationService, Recitation } from '../../core/services/recitation.service';
import { ReciterService, Reciter } from '../../core/services/reciter.service';
import { SurahService, Surah } from '../../core/services/surah.service';
import { ReciterCardComponent } from '../../shared/components/reciter-card/reciter-card.component';
import { RecitationItemComponent } from '../../shared/components/recitation-item/recitation-item.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReciterCardComponent, RecitationItemComponent, SkeletonComponent, EmptyStateComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private recitationService = inject(RecitationService);
  private reciterService = inject(ReciterService);
  private surahService = inject(SurahService);
  private router = inject(Router);
  private el = inject(ElementRef);

  topRecitations = signal<Recitation[]>([]);
  newReleases = signal<Recitation[]>([]);
  topReciters = signal<Reciter[]>([]);

  isLoading = signal(true);
  error = signal<string | null>(null);

  // Search state
  searchQueryStr = ''; // plain string for ngModel binding
  searchQuery = signal('');
  searchResultsSurahs = signal<Surah[]>([]);
  searchResultsReciters = signal<Reciter[]>([]);
  isSearching = signal(false);
  showDropdown = signal(false);

  private searchSubject = new Subject<string>();

  hasSearchResults = computed(() =>
    this.searchResultsSurahs().length > 0 || this.searchResultsReciters().length > 0
  );

  ngOnInit() {
    this.loadData();
    this.setupSearch();
  }

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      switchMap(query => {
        const q = (query || '').trim();

        // Clear results if query too short
        if (q.length < 1) {
          this.searchResultsSurahs.set([]);
          this.searchResultsReciters.set([]);
          this.isSearching.set(false);
          this.showDropdown.set(false);
          return of(null);
        }

        this.isSearching.set(true);
        this.showDropdown.set(true);

        // Use catchError on each observable so one failure doesn't kill forkJoin
        return forkJoin({
          surahs: this.surahService.searchSurahs(q, 6).pipe(
            catchError(err => {
              console.warn('Surah search error:', err);
              return of({ surahs: [], page: 1, pages: 0, totalSurahs: 0 });
            })
          ),
          reciters: this.reciterService.searchReciters(q, 5).pipe(
            catchError(err => {
              console.warn('Reciter search error:', err);
              return of({ reciters: [], page: 1, pages: 0, totalReciters: 0 });
            })
          )
        });
      })
    ).subscribe({
      next: (result) => {
        if (result) {
          const surahs = result.surahs?.surahs ?? [];
          const reciters = result.reciters?.reciters ?? [];
          this.searchResultsSurahs.set(surahs);
          this.searchResultsReciters.set(reciters);
          this.showDropdown.set(true);
        }
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Search pipeline error:', err);
        this.isSearching.set(false);
        this.showDropdown.set(false);
      }
    });
  }

  onSearchInput(query: string) {
    this.searchQuery.set(query);
    if (!query || !query.trim()) {
      this.showDropdown.set(false);
      this.searchResultsSurahs.set([]);
      this.searchResultsReciters.set([]);
      this.isSearching.set(false);
    }
    this.searchSubject.next(query);
  }

  navigateToSurah(surah: Surah) {
    this.showDropdown.set(false);
    this.searchQuery.set('');
    this.router.navigate(['/surahs', surah._id]);
  }

  navigateToReciter(reciter: Reciter) {
    this.showDropdown.set(false);
    this.searchQuery.set('');
    this.router.navigate(['/reciters', reciter._id]);
  }

  getReciterImageUrl(image: string): string {
    if (!image) return '';
    if (image.startsWith('/')) return encodeURI(`http://localhost:5000${image}`);
    return image;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.showDropdown.set(false);
    }
  }

  loadData() {
    this.isLoading.set(true);

    this.recitationService.getTopRecitations(4).subscribe({
      next: (res: any) => this.topRecitations.set(res.recitations || res),
      error: () => this.error.set('Failed to load top recitations')
    });

    this.recitationService.getNewReleases(4).subscribe({
      next: (res: any) => this.newReleases.set(res || []),
      error: (err) => console.error('Failed to load new releases', err)
    });

    this.reciterService.getTopReciters(6).subscribe({
      next: (res: any) => {
        this.topReciters.set(res.reciters || res);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load top reciters');
        this.isLoading.set(false);
      }
    });
  }
}

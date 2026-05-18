import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReciterService, Reciter } from '../../core/services/reciter.service';
import { RecitationItemComponent } from '../../shared/components/recitation-item/recitation-item.component';

@Component({
  selector: 'app-reciter-profile',
  standalone: true,
  imports: [CommonModule, RecitationItemComponent],
  templateUrl: './reciter-profile.component.html',
  styleUrls: ['./reciter-profile.component.css']
})
export class ReciterProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reciterService = inject(ReciterService);

  reciter = signal<Reciter | null>(null);
  recitations = signal<any[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  isFollowing = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadReciter(id);
      }
    });
  }

  private loadReciter(id: string) {
    this.isLoading.set(true);

    this.reciterService.getReciterById(id).subscribe({
      next: (res) => {
        this.reciter.set(res);
        this.isLoading.set(false);
        // Load recitations after reciter loads
        this.loadRecitations(id);
      },
      error: (err) => {
        console.error(err);
        this.error.set('حدث خطأ أثناء تحميل بيانات القارئ');
        this.isLoading.set(false);
      }
    });
  }

  private loadRecitations(id: string) {
    this.reciterService.getReciterTopRecitations(id, 20).subscribe({
      next: (res) => this.recitations.set(res),
      error: () => {} // Silent fail - reciter may have no recitations yet
    });
  }

  toggleFollow() {
    this.isFollowing = !this.isFollowing;
  }

  getImageUrl(): string {
    const r = this.reciter();
    if (!r || !r.image) return '';
    if (r.image.startsWith('/')) return `http://localhost:5000${r.image}`;
    return r.image;
  }
}

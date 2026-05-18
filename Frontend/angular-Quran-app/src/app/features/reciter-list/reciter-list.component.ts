import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReciterService, Reciter } from '../../core/services/reciter.service';
import { ReciterCardComponent } from '../../shared/components/reciter-card/reciter-card.component';

@Component({
  selector: 'app-reciter-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReciterCardComponent],
  templateUrl: './reciter-list.component.html',
  styleUrls: ['./reciter-list.component.css']
})
export class ReciterListComponent implements OnInit {
  private reciterService = inject(ReciterService);

  reciters = signal<Reciter[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadReciters();
  }

  private loadReciters() {
    this.isLoading.set(true);
    this.reciterService.getReciters(1, 50).subscribe({
      next: (res) => {
        this.reciters.set(res.reciters);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('حدث خطأ أثناء تحميل القراء');
        this.isLoading.set(false);
      }
    });
  }
}

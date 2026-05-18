import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ArticleData {
  title: string;
  summary: string;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  language: string;
}

@Component({
  selector: 'app-article-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="analyzer-container">
      <h2>تحليل النصوص (Structured Output)</h2>
      <p>أدخل نصاً (مقال، تفسير، إلخ) ليتم استخراج البيانات منه بصيغة مهيكلة.</p>
      
      <textarea 
        [(ngModel)]="textToAnalyze" 
        rows="8" 
        placeholder="أدخل النص هنا..."
        class="text-input"
        [disabled]="isLoading()"></textarea>

      <button [disabled]="!textToAnalyze.trim() || isLoading()" (click)="analyze()">
        {{ isLoading() ? 'جاري التحليل واستخراج البيانات...' : 'حلل النص' }}
      </button>

      <div *ngIf="result()" class="result-box">
        <h3>البيانات المستخرجة:</h3>
        <div class="data-row"><strong>العنوان المقترح:</strong> {{ result()?.title }}</div>
        <div class="data-row"><strong>الملخص:</strong> {{ result()?.summary }}</div>
        <div class="data-row"><strong>اللغة:</strong> {{ result()?.language }}</div>
        <div class="data-row"><strong>الاتجاه العام:</strong> 
          <span [class]="'sentiment ' + result()?.sentiment">
            {{ result()?.sentiment === 'positive' ? 'إيجابي' : (result()?.sentiment === 'negative' ? 'سلبي' : 'محايد') }}
          </span>
        </div>
        <div class="data-row">
          <strong>الكلمات المفتاحية:</strong>
          <div class="keywords">
            <span class="badge" *ngFor="let kw of result()?.keywords">{{ kw }}</span>
          </div>
        </div>
      </div>
      
      <div *ngIf="error()" class="error-box">
        <p>{{ error() }}</p>
      </div>
    </div>
  `,
  styles: [`
    .analyzer-container { max-width: 700px; margin: 2rem auto; font-family: system-ui; }
    .text-input { width: 100%; padding: 1rem; border: 1px solid #ccc; border-radius: 8px; font-family: inherit; font-size: 1rem; resize: vertical; margin-bottom: 1rem; }
    button { width: 100%; padding: 0.75rem; background: #673ab7; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .result-box { margin-top: 1.5rem; padding: 1.5rem; background: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-top: 4px solid #673ab7; }
    .data-row { margin-bottom: 1rem; line-height: 1.6; }
    .keywords { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
    .badge { background: #e0e0e0; padding: 0.25rem 0.75rem; border-radius: 16px; font-size: 0.85rem; }
    .error-box { margin-top: 1.5rem; padding: 1rem; background: #fdf3f2; color: #d32f2f; border-radius: 8px; border-right: 4px solid #d32f2f; }
    .sentiment { font-weight: bold; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .sentiment.positive { color: #155724; background: #d4edda; }
    .sentiment.negative { color: #721c24; background: #f8d7da; }
    .sentiment.neutral { color: #383d41; background: #e2e3e5; }
  `]
})
export class ArticleAnalyzerComponent {
  private http = inject(HttpClient);
  
  textToAnalyze = '';
  isLoading = signal(false);
  result = signal<ArticleData | null>(null);
  error = signal<string | null>(null);

  analyze() {
    if (!this.textToAnalyze.trim()) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.result.set(null);

    this.http.post<ArticleData>('/api/gemini/analyze', { text: this.textToAnalyze })
      .subscribe({
        next: (res) => {
          this.result.set(res);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('حدث خطأ أثناء تحليل النص.');
          this.isLoading.set(false);
        }
      });
  }
}

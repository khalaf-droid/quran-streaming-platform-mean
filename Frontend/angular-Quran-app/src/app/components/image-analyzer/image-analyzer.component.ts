import { Component, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-analyzer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analyzer-container">
      <h2>تحليل الصور بالذكاء الاصطناعي (Vision API)</h2>
      
      <div 
        class="drop-zone" 
        [class.dragging]="isDragging()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        
        <p *ngIf="!previewUrl()">اسحب وأفلت صورة هنا، أو انقر للاختيار</p>
        <img *ngIf="previewUrl()" [src]="previewUrl()" alt="Preview" class="preview-img">
        <input #fileInput type="file" hidden accept="image/*" (change)="onFileSelected($event)">
      </div>

      <button [disabled]="!selectedFile() || isLoading()" (click)="analyzeImage()">
        {{ isLoading() ? 'جاري التحليل...' : 'حلل الصورة' }}
      </button>

      <div *ngIf="result()" class="result-box">
        <h3>النتيجة:</h3>
        <p>{{ result() }}</p>
      </div>
      <div *ngIf="error()" class="error-box">
        <p>{{ error() }}</p>
      </div>
    </div>
  `,
  styles: [`
    .analyzer-container { max-width: 600px; margin: 2rem auto; font-family: system-ui; }
    .drop-zone { border: 2px dashed #ccc; border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer; transition: all 0.3s ease; }
    .drop-zone.dragging { border-color: #007bff; background: #e9f5ff; }
    .preview-img { max-width: 100%; max-height: 300px; border-radius: 8px; }
    button { margin-top: 1rem; width: 100%; padding: 0.75rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .result-box { margin-top: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; border-right: 4px solid #28a745; }
    .error-box { margin-top: 1.5rem; padding: 1rem; background: #fdf3f2; color: #d32f2f; border-radius: 8px; border-right: 4px solid #d32f2f; }
  `]
})
export class ImageAnalyzerComponent {
  private http = inject(HttpClient);
  
  isDragging = signal(false);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isLoading = signal(false);
  result = signal<string | null>(null);
  error = signal<string | null>(null);

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      this.handleFile(file);
    }
  }

  onFileSelected(e: any) {
    const file = e.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File) {
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
    this.result.set(null);
    this.error.set(null);
  }

  analyzeImage() {
    const file = this.selectedFile();
    if (!file) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.result.set(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('prompt', 'استخرج أي آيات قرآنية أو نصوص عربية من هذه الصورة، واشرح ما تراه بتفصيل مناسب.');

    this.http.post<{ analysis: string }>('/api/gemini/analyze-image', formData)
      .subscribe({
        next: (res) => {
          this.result.set(res.analysis);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('حدث خطأ أثناء تحليل الصورة.');
          this.isLoading.set(false);
        }
      });
  }
}

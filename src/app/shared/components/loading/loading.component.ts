import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-loading',
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule],
    template: `
    <div *ngIf="loadingService.loading()" class="loading-overlay">
      <div class="loading-container">
        <mat-spinner diameter="50" color="accent"></mat-spinner>
        <p class="loading-text">{{ loadingService.message() }}</p>
      </div>
    </div>
  `,
    styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(2px);
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .loading-text {
      color: #0f766e; /* Teal-700 */
      font-weight: 500;
      font-size: 1.1rem;
      margin: 0;
      animation: pulse 1.5s infinite ease-in-out;
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `]
})
export class LoadingComponent {
    loadingService = inject(LoadingService);
}

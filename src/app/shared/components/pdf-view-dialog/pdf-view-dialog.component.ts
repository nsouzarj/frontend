import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface PdfViewDialogData {
    title: string;
    pdfUrl: string; // Blob URL
}

@Component({
    selector: 'app-pdf-view-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
        <div class="flex flex-col h-[90vh] w-full max-w-[1200px]">
            <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
                <h2 class="text-xl font-bold text-gray-800 m-0 flex items-center gap-2">
                    <mat-icon class="text-red-500">picture_as_pdf</mat-icon>
                    {{ data.title }}
                </h2>
                <div class="flex gap-2">
                    <button mat-flat-button (click)="print()" class="hidden sm:flex !bg-gradient-to-r !from-emerald-500 !to-teal-600 !text-white !font-bold shadow-sm hover:shadow-md transition-all">
                        <mat-icon class="mr-1 text-white">print</mat-icon> Imprimir
                    </button>
                    <button mat-icon-button mat-dialog-close>
                        <mat-icon>close</mat-icon>
                    </button>
                </div>
            </div>
            
            <div class="flex-1 bg-gray-100 overflow-hidden relative">
                <iframe 
                    [src]="safeUrl" 
                    id="pdf-frame"
                    class="w-full h-full border-0"
                    type="application/pdf">
                </iframe>
            </div>
        </div>
    `,
    styles: [`
        .mat-mdc-dialog-container .mat-mdc-dialog-surface {
            border-radius: 12px !important;
            padding: 0 !important;
        }
    `],
    encapsulation: ViewEncapsulation.None
})
export class PdfViewDialogComponent {
    safeUrl: SafeResourceUrl;

    constructor(
        public dialogRef: MatDialogRef<PdfViewDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PdfViewDialogData,
        private sanitizer: DomSanitizer
    ) {
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.pdfUrl);
    }

    print() {
        const iframe = document.getElementById('pdf-frame') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.print();
        }
    }
}

import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private _loading = signal<boolean>(false);
    private _message = signal<string>('Processando...');
    private requestCount = 0;

    get loading() {
        return this._loading.asReadonly();
    }

    get message() {
        return this._message.asReadonly();
    }

    show(msg: string = 'Processando...') {
        this.requestCount++;
        this._message.set(msg);
        if (this.requestCount > 0) {
            this._loading.set(true);
        }
    }

    hide() {
        this.requestCount--;
        if (this.requestCount <= 0) {
            this.requestCount = 0; // Prevent negative
            this._loading.set(false);
        }
    }

    // Force reset if something goes wrong
    reset() {
        this.requestCount = 0;
        this._loading.set(false);
    }
}

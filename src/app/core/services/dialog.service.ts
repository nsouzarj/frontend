import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class DialogService {
    private dialog = inject(MatDialog);

    confirm(data: ConfirmationDialogData): Observable<boolean> {
        return this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: data,
            disableClose: true
        }).afterClosed();
    }

    alert(title: string, message: string): Observable<boolean> {
        return this.confirm({
            title,
            message,
            confirmText: 'OK',
            showCancel: false,
            color: 'primary'
        });
    }
}

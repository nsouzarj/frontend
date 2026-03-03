
import { Component, OnInit, inject, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';

import { OwnerService } from '../../../core/services/owner.service';
import { Owner } from '../../../core/models/owner.model';
import { DialogService } from '../../../core/services/dialog.service';
import { PhoneFormatPipe } from '../../../shared/pipes/phone-format.pipe';

@Component({
    selector: 'app-owner-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        PhoneFormatPipe,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatTooltipModule
    ],
    templateUrl: './owner-list.component.html'
})
export class OwnerListComponent implements OnInit, AfterViewInit {
    private ownerService = inject(OwnerService);
    private dialogService = inject(DialogService);
    private cdr = inject(ChangeDetectorRef);

    owners: Owner[] = []; // Mantendo para compatibilidade se necessário, mas dataSource é o principal
    dataSource = new MatTableDataSource<Owner>([]);

    @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
        this.dataSource.paginator = paginator;
    }

    @ViewChild(MatSort) set sort(sort: MatSort) {
        this.dataSource.sort = sort;
    }

    isLoading = false;

    displayedColumns: string[] = ['full_name', 'email', 'phone', 'address', 'actions'];
    errorMessage: string | null = null;

    ngOnInit(): void {
        this.loadOwners();
    }

    ngAfterViewInit() {
        // Redundant with setters, but kept for interface compliance
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    loadOwners(): void {
        this.isLoading = true;
        this.ownerService.getOwners().subscribe({
            next: (data) => {
                this.owners = data;
                this.dataSource.data = data;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching owners', err);
                this.errorMessage = 'Erro ao carregar tutores: ' + (err.error?.detail || err.message);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    deleteOwner(id: number, name: string): void {
        this.dialogService.confirm({
            title: 'Excluir Tutor',
            message: `Tem certeza que deseja excluir o tutor "${name}"?`,
            confirmText: 'Excluir',
            color: 'warn'
        }).subscribe(confirmed => {
            if (confirmed) {
                this.ownerService.deleteOwner(id).subscribe({
                    next: () => {
                        this.loadOwners(); // Refresh list
                    },
                    error: (err) => {
                        console.error('Error deleting owner', err);
                        this.errorMessage = 'Erro ao excluir tutor.';
                        this.cdr.detectChanges();
                    }
                });
            }
        });
    }
}

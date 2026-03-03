import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BreedService } from '../../../core/services/breed.service';
import { DialogService } from '../../../core/services/dialog.service';
import { Breed } from '../../../core/models/breed.model';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SpeciesTranslatePipe } from '../../../shared/pipes/species-translate.pipe';
import { BreedDialogComponent } from '../breed-dialog/breed-dialog.component';

@Component({
    selector: 'app-breed-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatDialogModule,
        SpeciesTranslatePipe
    ],
    templateUrl: './breed-list.component.html'
})
export class BreedListComponent implements OnInit, OnDestroy {
    private breedService = inject(BreedService);
    private dialogService = inject(DialogService);
    private dialog = inject(MatDialog);

    dataSource = new MatTableDataSource<Breed>([]);
    displayedColumns: string[] = ['name', 'species', 'actions'];

    isLoading = false;
    errorMessage: string | null = null;

    totalBreeds = 0;
    pageSize = 10;
    pageIndex = 0;
    filterValue = '';

    private searchSubject = new Subject<string>();
    private searchSubscription?: Subscription;

    ngOnInit() {
        this.loadBreeds();

        this.searchSubscription = this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(filterValue => {
            this.filterValue = filterValue;
            this.pageIndex = 0; // Reset to first page on search
            this.loadBreeds();
        });
    }

    ngOnDestroy() {
        this.searchSubscription?.unsubscribe();
    }

    applyFilter(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.searchSubject.next(value.trim());
    }

    loadBreeds() {
        this.isLoading = true;
        this.breedService.getBreeds(this.pageIndex * this.pageSize, this.pageSize, undefined, this.filterValue).subscribe({
            next: (data) => {
                setTimeout(() => {
                    this.dataSource.data = data.items;
                    this.totalBreeds = data.total;
                });
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading breeds', err);
                this.errorMessage = 'Erro ao carregar raças';
                this.isLoading = false;
            }
        });
    }

    onPageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadBreeds();
    }

    openBreedDialog(breed?: Breed) {
        const dialogRef = this.dialog.open(BreedDialogComponent, {
            width: '400px',
            data: { breed }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadBreeds();
            }
        });
    }

    deleteBreed(breed: Breed) {
        this.dialogService.confirm({
            title: 'Excluir Raça',
            message: `Tem certeza que deseja excluir a raça "${breed.name}"?`,
            confirmText: 'Excluir',
            color: 'warn'
        }).subscribe(confirmed => {
            if (confirmed) {
                this.breedService.deleteBreed(breed.id).subscribe(() => this.loadBreeds());
            }
        });
    }
}

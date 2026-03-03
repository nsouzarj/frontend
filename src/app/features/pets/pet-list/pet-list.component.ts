import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SpeciesTranslatePipe } from '../../../shared/pipes/species-translate.pipe';

import { PetService } from '../../../core/services/pet.service';
import { DialogService } from '../../../core/services/dialog.service';
import { Pet } from '../../../core/models/pet.model';
import { PetDialogComponent } from '../pet-dialog/pet-dialog.component';

@Component({
    selector: 'app-pet-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        SpeciesTranslatePipe
    ],
    templateUrl: './pet-list.component.html'
})
export class PetListComponent implements OnInit {
    private petService = inject(PetService);
    private dialogService = inject(DialogService);
    private dialog = inject(MatDialog);
    private cdr = inject(ChangeDetectorRef);

    pets: Pet[] = [];
    dataSource = new MatTableDataSource<Pet>([]);
    displayedColumns: string[] = ['name', 'species', 'age', 'owner', 'actions'];

    isLoading = false;
    errorMessage: string | null = null;

    @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
        this.dataSource.paginator = paginator;
    }

    @ViewChild(MatSort) set sort(sort: MatSort) {
        this.dataSource.sort = sort;
    }

    ngOnInit(): void {
        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'owner': return item.owner?.full_name || '';
                default: return (item as any)[property];
            }
        };

        this.dataSource.filterPredicate = (data: Pet, filter: string) => {
            const searchStr = (data.name + data.species + (data.breed || '') + (data.owner?.full_name || '') + data.owner_id).toLowerCase();
            return searchStr.indexOf(filter) !== -1;
        };

        this.loadPets();
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    loadPets(): void {
        this.isLoading = true;
        this.petService.getPets().subscribe({
            next: (data) => {
                this.pets = data;
                this.dataSource.data = data;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading pets', err);
                this.errorMessage = 'Erro ao carregar pets.';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    editPet(pet: Pet): void {
        const dialogRef = this.dialog.open(PetDialogComponent, {
            width: '600px',
            data: { ownerId: pet.owner_id, pet: pet }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadPets(); // Reload if updated
            }
        });
    }

    deletePet(pet: Pet): void {
        this.dialogService.confirm({
            title: 'Excluir Pet',
            message: `Tem certeza que deseja excluir o pet "${pet.name}"?`,
            confirmText: 'Excluir',
            color: 'warn'
        }).subscribe(confirmed => {
            if (confirmed) {
                this.petService.deletePet(pet.id).subscribe({
                    next: () => {
                        this.pets = this.pets.filter(p => p.id !== pet.id);
                        this.dataSource.data = this.pets;
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        console.error('Error deleting pet', err);
                        alert('Erro ao excluir pet');
                    }
                });
            }
        });
    }
}

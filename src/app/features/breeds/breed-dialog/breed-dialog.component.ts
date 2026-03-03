import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SpeciesTranslatePipe } from '../../../shared/pipes/species-translate.pipe';
import { SpeciesType, Breed } from '../../../core/models/breed.model';
import { BreedService } from '../../../core/services/breed.service';

@Component({
    selector: 'app-breed-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        SpeciesTranslatePipe
    ],
    templateUrl: './breed-dialog.component.html',
    styles: [`
    .full-width { width: 100%; margin-bottom: 8px; }
    form { display: flex; flex-direction: column; min-width: 300px; }
  `]
})
export class BreedDialogComponent implements OnInit {
    private fb = inject(FormBuilder);
    private breedService = inject(BreedService);
    public dialogRef = inject(MatDialogRef<BreedDialogComponent>);
    public data = inject(MAT_DIALOG_DATA) as { breed?: Breed };

    breedForm: FormGroup;
    speciesOptions = Object.values(SpeciesType);
    isLoading = false;

    constructor() {
        this.breedForm = this.fb.group({
            name: [this.data.breed?.name || '', [Validators.required]],
            species: [this.data.breed?.species || SpeciesType.DOG, [Validators.required]]
        });
    }

    ngOnInit(): void { }

    onSubmit() {
        if (this.breedForm.invalid) return;

        this.isLoading = true;
        const breedData = this.breedForm.value;

        const request$ = this.data.breed
            ? this.breedService.updateBreed(this.data.breed.id, breedData)
            : this.breedService.createBreed(breedData);

        request$.subscribe({
            next: (result) => {
                this.isLoading = false;
                this.dialogRef.close(result);
            },
            error: (err) => {
                console.error('Error saving breed', err);
                this.isLoading = false;
            }
        });
    }
}

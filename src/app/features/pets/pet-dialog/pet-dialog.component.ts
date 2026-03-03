import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { SpeciesTranslatePipe } from '../../../shared/pipes/species-translate.pipe';
import { PetService } from '../../../core/services/pet.service';
import { BreedService } from '../../../core/services/breed.service';
import { SpeciesType, Pet, PetCreate } from '../../../core/models/pet.model';
import { Breed } from '../../../core/models/breed.model';
import { Observable, map, startWith } from 'rxjs';

@Component({
    selector: 'app-pet-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatAutocompleteModule,
        MatIconModule,
        SpeciesTranslatePipe
    ],
    templateUrl: './pet-dialog.component.html',
    styles: [`
    .full-width { width: 100%; margin-bottom: 8px; }
    form { display: flex; flex-direction: column; }
  `]
})
export class PetDialogComponent implements OnInit {
    private fb = inject(FormBuilder);
    private petService = inject(PetService);
    private breedService = inject(BreedService);

    petForm: FormGroup;
    speciesOptions = Object.values(SpeciesType);
    isLoading = false;

    breeds: Breed[] = [];
    filteredBreeds!: Observable<Breed[]>;

    public dialogRef = inject(MatDialogRef<PetDialogComponent>);
    public data = inject(MAT_DIALOG_DATA) as { ownerId: number, pet?: Pet };

    constructor() {
        this.petForm = this.fb.group({
            name: [this.data.pet?.name || '', [Validators.required]],
            species: [this.data.pet?.species || SpeciesType.DOG, [Validators.required]],
            breed: [this.data.pet?.breed || ''],
            age_years: [this.data.pet?.age_years || 0],
            weight_kg: [this.data.pet?.weight_kg || 0],
            size: [this.data.pet?.size || '']
        });
    }

    ngOnInit() {
        // Initial load based on default or selected species
        const initialSpecies = this.petForm.get('species')?.value;
        this.loadBreeds(initialSpecies);
        this.updateSizeValidator(initialSpecies);

        // Reload breeds when species changes
        this.petForm.get('species')?.valueChanges.subscribe(species => {
            this.petForm.patchValue({ breed: '' }); // Reset breed on species change
            this.loadBreeds(species);
            this.updateSizeValidator(species);
            // Also clear breeds list immediately to give visual feedback or just wait for load
        });

        // Auto-complete filter
        this.filteredBreeds = this.petForm.get('breed')!.valueChanges.pipe(
            startWith(''),
            map(value => this._filterBreeds(value || ''))
        );
    }

    updateSizeValidator(species: SpeciesType | string) {
        const sizeControl = this.petForm.get('size');
        if (species === SpeciesType.DOG || species === 'dog') {
            sizeControl?.setValidators([Validators.required]);
        } else {
            sizeControl?.clearValidators();
            sizeControl?.setValue(null); // Clear value if not dog
        }
        sizeControl?.updateValueAndValidity();
    }


    loadBreeds(species: SpeciesType) {
        console.log('Loading breeds for species:', species);
        // Only fetch for Dog and Cat for now, as those have seeds
        if (species === SpeciesType.DOG || species === SpeciesType.CAT) {
            this.breedService.getBreeds(0, 1000, species).subscribe(response => { // Increased limit for debug/safety
                console.log('Breeds loaded:', response.items.length, response.items);
                this.breeds = response.items;
                // Re-trigger filter update manually
                this.petForm.get('breed')?.updateValueAndValidity({ emitEvent: true });
            });
        } else {
            this.breeds = [];
        }
    }

    private _filterBreeds(value: string): Breed[] {
        const filterValue = value.toLowerCase();
        const start = Date.now();
        const result = this.breeds.filter(breed => breed.name.toLowerCase().includes(filterValue));
        console.log(`Filtering breeds. Input: "${value}", Found: ${result.length}/${this.breeds.length}`);
        return result;
    }


    onSubmit() {
        if (this.petForm.invalid) return;

        this.isLoading = true;
        const petData: PetCreate = {
            ...this.petForm.value,
            owner_id: this.data.ownerId
        };

        const request$ = this.data.pet
            ? this.petService.updatePet(this.data.pet.id, petData)
            : this.petService.createPet(petData);

        request$.subscribe({
            next: (result) => {
                this.isLoading = false;
                this.dialogRef.close(result);
            },
            error: (err) => {
                console.error('Error saving pet', err);
                this.isLoading = false;
                // Optionally show error message
            }
        });
    }
}

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { OwnerService } from '../../../core/services/owner.service';
import { OwnerCreate } from '../../../core/models/owner.model';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PetService } from '../../../core/services/pet.service';
import { DialogService } from '../../../core/services/dialog.service';
import { PetDialogComponent } from '../../pets/pet-dialog/pet-dialog.component';
import { Pet } from '../../../core/models/pet.model';
import { PhoneMaskDirective } from '../../../shared/directives/phone-mask.directive';
import { SpeciesTranslatePipe } from '../../../shared/pipes/species-translate.pipe';

@Component({
    selector: 'app-owner-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        MatDialogModule,
        PhoneMaskDirective,
        SpeciesTranslatePipe
    ],
    templateUrl: './owner-form.component.html',
    styleUrls: ['./owner-form.component.css']
})
export class OwnerFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private ownerService = inject(OwnerService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private dialog = inject(MatDialog);
    private cdr = inject(ChangeDetectorRef); // Injected

    ownerForm: FormGroup = this.fb.group({
        full_name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.email]],
        phone: [''],
        address: ['']
    });

    isEditMode = false;
    ownerId: number | null = null;
    isLoading = false;
    errorMessage: string | null = null;
    pets: Pet[] = [];

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') {
            this.isEditMode = true;
            this.ownerId = +id;
            this.loadOwner(this.ownerId);
        }
    }

    loadOwner(id: number): void {
        this.isLoading = true;
        this.ownerService.getOwner(id).subscribe({
            next: (owner) => {
                console.log('Owner loaded:', owner); // Debug log
                this.ownerForm.patchValue(owner);
                this.pets = owner.pets || [];
                this.isLoading = false;
                this.cdr.detectChanges(); // Force update
            },
            error: (err) => {
                console.error('Error loading owner', err);
                this.errorMessage = 'Erro ao carregar dados do tutor.';
                this.isLoading = false;
            }
        });
    }

    private petService = inject(PetService);
    private dialogService = inject(DialogService);

    openPetDialog(pet?: Pet): void {
        if (!this.ownerId) return;

        const dialogRef = this.dialog.open(PetDialogComponent, {
            width: '400px',
            data: { ownerId: this.ownerId, pet }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadOwner(this.ownerId!); // Reload to show new/updated pet
            }
        });
    }

    deletePet(petId: number, petName: string): void {
        this.dialogService.confirm({
            title: 'Excluir Pet',
            message: `Tem certeza que deseja excluir o pet "${petName}"?`,
            confirmText: 'Excluir',
            color: 'warn'
        }).subscribe(confirmed => {
            if (confirmed) {
                this.isLoading = true;
                this.petService.deletePet(petId).subscribe({
                    next: () => {
                        this.pets = this.pets.filter(p => p.id !== petId);
                        this.isLoading = false;
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        console.error('Error deleting pet', err);
                        this.isLoading = false;
                        alert('Erro ao excluir pet.');
                    }
                });
            }
        });
    }

    onSubmit(): void {
        if (this.ownerForm.invalid) {
            return;
        }

        this.isLoading = true;
        const ownerData: OwnerCreate = this.ownerForm.value;

        if (this.isEditMode && this.ownerId) {
            this.ownerService.updateOwner(this.ownerId, ownerData).subscribe({
                next: () => {
                    this.router.navigate(['/owners']);
                },
                error: (err) => {
                    console.error('Error updating owner', err);
                    this.errorMessage = 'Erro ao atualizar tutor.';
                    this.isLoading = false;
                }
            });
        } else {
            this.ownerService.createOwner(ownerData).subscribe({
                next: () => {
                    this.router.navigate(['/owners']);
                },
                error: (err) => {
                    console.error('Error creating owner', err);
                    this.errorMessage = 'Erro ao criar tutor.';
                    this.isLoading = false;
                }
            });
        }
    }
}

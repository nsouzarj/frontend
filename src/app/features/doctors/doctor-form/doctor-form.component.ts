import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { DoctorService } from '../../../core/services/doctor.service';
import { Doctor } from '../../../core/models/business.models';

import { PhoneMaskDirective } from '../../../shared/directives/phone-mask.directive';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PhoneMaskDirective],
  template: `
    <div class="container mx-auto p-6">
      <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">{{ isEditMode ? 'Editar Veterinário' : 'Novo Veterinário' }}</h2>
        
        <form [formGroup]="doctorForm" (ngSubmit)="onSubmit()">
          
          <div class="flex flex-col md:grid md:grid-cols-2 gap-6 mb-6">
            <!-- Full Name -->
            <div class="col-span-2">
              <label for="full_name" class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input id="full_name" type="text" formControlName="full_name" 
                     class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                     [class.border-red-500]="doctorForm.get('full_name')?.invalid && doctorForm.get('full_name')?.touched">
              <div *ngIf="doctorForm.get('full_name')?.invalid && doctorForm.get('full_name')?.touched" class="text-red-500 text-sm mt-1">
                Nome completo é obrigatório.
              </div>
            </div>

            <!-- CRMV -->
            <div>
              <label for="crmv" class="block text-sm font-medium text-gray-700 mb-1">CRMV</label>
              <input id="crmv" type="text" formControlName="crmv" 
                     class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                     [class.border-red-500]="doctorForm.get('crmv')?.invalid && doctorForm.get('crmv')?.touched">
              <div *ngIf="doctorForm.get('crmv')?.invalid && doctorForm.get('crmv')?.touched" class="text-red-500 text-sm mt-1">
                CRMV é obrigatório.
              </div>
            </div>

            <!-- Specialty -->
            <div>
              <label for="specialty" class="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
              <input id="specialty" type="text" formControlName="specialty" 
                     class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500">
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="email" type="email" formControlName="email" 
                     class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500">
            </div>

            <!-- Phone -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input id="phone" type="text" formControlName="phone" appPhoneMask placeholder="Ex: (11) 99999-9999"
                     class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500">
            </div>

            <!-- Active Status -->
            <div class="col-span-2 flex items-center">
              <input id="is_active" type="checkbox" formControlName="is_active" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="is_active" class="ml-2 block text-sm text-gray-900">Veterinário Ativo</label>
            </div>

          </div>

          <div class="flex justify-end space-x-4">
            <a routerLink="/doctors" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-300">
              Cancelar
            </a>
            <button type="submit" [disabled]="doctorForm.invalid || isLoading" 
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 disabled:opacity-50">
              {{ isLoading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>

        </form>
      </div>
    </div>
  `
})
export class DoctorFormComponent implements OnInit {
  doctorForm: FormGroup;
  isEditMode = false;
  doctorId: number | null = null;
  isLoading = false;

  private fb = inject(FormBuilder);
  private doctorService = inject(DoctorService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.doctorForm = this.fb.group({
      full_name: ['', Validators.required],
      crmv: ['', Validators.required],
      specialty: [''],
      email: ['', [Validators.email]],
      phone: [''],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.doctorId = +id;
      this.loadDoctor(this.doctorId);
    }
  }

  loadDoctor(id: number): void {
    this.doctorService.getDoctor(id).subscribe({
      next: (doctor) => {
        this.doctorForm.patchValue(doctor);
      },
      error: (err) => {
        console.error('Error loading doctor', err);
        // Handle error (e.g., redirect or show message)
      }
    });
  }

  onSubmit(): void {
    if (this.doctorForm.invalid) return;

    this.isLoading = true;
    const doctorData = this.doctorForm.value;

    if (this.isEditMode && this.doctorId) {
      this.doctorService.updateDoctor(this.doctorId, doctorData).subscribe({
        next: () => {
          this.router.navigate(['/doctors']);
        },
        error: (err) => {
          console.error('Error updating doctor', err);
          this.isLoading = false;
        }
      });
    } else {
      this.doctorService.createDoctor(doctorData).subscribe({
        next: () => {
          this.router.navigate(['/doctors']);
        },
        error: (err) => {
          console.error('Error creating doctor', err);
          this.isLoading = false;
        }
      });
    }
  }
}

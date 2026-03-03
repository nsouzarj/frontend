import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { PetService } from '../../../core/services/pet.service';
import { AppointmentStatus, Doctor } from '../../../core/models/business.models';
import { Pet } from '../../../core/models/pet.model';
import { Service } from '../../../core/models/service.model';
import { GroomingService } from '../../../core/services/grooming.service';
import { DateMaskDirective } from '../../../shared/directives/date-mask.directive';
import { CurrencyMaskDirective } from '../../../shared/directives/currency-mask.directive';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DateMaskDirective,
    CurrencyMaskDirective
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' }
  ],
  template: `
    <div class="container mx-auto p-6">
      <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">{{ pageTitle }}</h2>
        
        <form [formGroup]="appointmentForm" (ngSubmit)="onSubmit()">
          
          <div class="flex flex-col md:grid md:grid-cols-2 gap-6 mb-6">
            
            <!-- Appointment Type (Hidden for stricter separation) -->
            <div class="col-span-2 hidden">
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Agendamento</label>
              <div class="flex items-center space-x-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <label class="inline-flex items-center cursor-pointer">
                  <input type="radio" formControlName="type" value="medical" class="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                  <span class="ml-2 text-gray-700">Consulta Médica</span>
                </label>
                <label class="inline-flex items-center cursor-pointer">
                  <input type="radio" formControlName="type" value="grooming" class="form-radio h-4 w-4 text-pink-600 border-gray-300 focus:ring-pink-500">
                  <span class="ml-2 text-gray-700">Estética (Banho/Tosa)</span>
                </label>
              </div>
            </div>

            <!-- Doctor Selection (Medical only) -->
            <div class="col-span-2 md:col-span-1" *ngIf="appointmentForm.get('type')?.value === 'medical'">
              <label for="doctor_id" class="block text-sm font-medium text-gray-700 mb-1">Veterinário</label>
              <select id="doctor_id" formControlName="doctor_id" 
                      class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                      [class.border-red-500]="appointmentForm.get('doctor_id')?.invalid && appointmentForm.get('doctor_id')?.touched">
                <option [ngValue]="null" disabled>Selecione um veterinário</option>
                <option *ngFor="let doctor of doctors" [ngValue]="doctor.id">{{ doctor.full_name }} ({{ doctor.specialty }})</option>
              </select>
               <div *ngIf="appointmentForm.get('doctor_id')?.invalid && appointmentForm.get('doctor_id')?.touched" class="text-red-500 text-sm mt-1">
                Selecione um veterinário.
              </div>
            </div>

            <!-- Service Selection (Grooming only) -->
            <div class="col-span-2 md:col-span-1" *ngIf="appointmentForm.get('type')?.value === 'grooming'">
              <label for="service_id" class="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
              <select id="service_id" formControlName="service_id" 
                      class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                      [class.border-red-500]="appointmentForm.get('service_id')?.invalid && appointmentForm.get('service_id')?.touched">
                <option [ngValue]="null" disabled>Selecione um serviço</option>
                <option *ngFor="let service of services" [ngValue]="service.id">{{ service.name }} ({{ service.duration_minutes }} min)</option>
              </select>
               <div *ngIf="appointmentForm.get('service_id')?.invalid && appointmentForm.get('service_id')?.touched" class="text-red-500 text-sm mt-1">
                Selecione um serviço.
              </div>
            </div>

            <!-- Pet Selection -->
            <div class="col-span-2 md:col-span-1">
              <label for="pet_id" class="block text-sm font-medium text-gray-700 mb-1">Pet</label>
              <select id="pet_id" formControlName="pet_id" 
                      class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                      [class.border-red-500]="appointmentForm.get('pet_id')?.invalid && appointmentForm.get('pet_id')?.touched">
                <option [ngValue]="null" disabled>Selecione um pet</option>
                 <option *ngFor="let pet of pets" [ngValue]="pet.id">{{ pet.name }} ({{ pet.breed }})</option>
              </select>
              <div *ngIf="appointmentForm.get('pet_id')?.invalid && appointmentForm.get('pet_id')?.touched" class="text-red-500 text-sm mt-1">
                Selecione um pet.
              </div>
            </div>

            <!-- Price Input (Grooming only) -->
            <div class="col-span-2 md:col-span-1" *ngIf="appointmentForm.get('type')?.value === 'grooming'">
              <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500">R$</span>
                <input id="price" type="text" formControlName="price" appCurrencyMask placeholder="0,00"
                       class="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                       [class.border-red-500]="appointmentForm.get('price')?.invalid && appointmentForm.get('price')?.touched">
              </div>
              <div *ngIf="appointmentForm.get('price')?.invalid && appointmentForm.get('price')?.touched" class="text-red-500 text-sm mt-1">
                Informe o valor do serviço.
              </div>
            </div>

            <!-- Date and Time -->
            <div class="col-span-2">
              <label for="date_time" class="block text-sm font-medium text-gray-700 mb-1">Data e Hora (DD/MM/YYYY HH:MM)</label>
              <div class="relative flex items-center">
                  <input id="date_time" type="text" formControlName="date_time" appDateMask placeholder="DD/MM/YYYY HH:MM"
                        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-12 bg-white"
                        [class.border-red-500]="appointmentForm.get('date_time')?.invalid && appointmentForm.get('date_time')?.touched">
                  
                  <!-- Calendar Toggle -->
                  <div class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 cursor-pointer">
                      <mat-datepicker-toggle [for]="picker"></mat-datepicker-toggle>
                  </div>
                  <!-- Hidden Datepicker -->
                  <input [matDatepicker]="picker" class="hidden" (dateChange)="onDateChange($event)">
                  <mat-datepicker #picker [touchUi]="true"></mat-datepicker>
              </div>
               <div *ngIf="appointmentForm.get('date_time')?.invalid && appointmentForm.get('date_time')?.touched" class="text-red-500 text-sm mt-1">
                Formato inválido. Use DD/MM/YYYY HH:MM (ex: 31/12/2026 14:30)
              </div>
            </div>

             <!-- Status -->
            <div class="col-span-2 md:col-span-1">
              <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select id="status" formControlName="status" class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option [ngValue]="'scheduled'">Agendado</option>
                <option [ngValue]="'completed'">Realizado</option>
                <option [ngValue]="'cancelled'">Cancelado</option>
              </select>
            </div>

            <!-- Reason -->
            <div class="col-span-2">
              <label for="reason" class="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <input id="reason" type="text" formControlName="reason" class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white">
            </div>

            <!-- Notes -->
            <div class="col-span-2">
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea id="notes" formControlName="notes" rows="3" class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>

          </div>

          <div class="flex justify-end space-x-4">
            <button type="button" (click)="navigateBack()" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-300">
              Cancelar
            </button>
            <button type="submit" [disabled]="appointmentForm.invalid || isLoading" 
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 disabled:opacity-50">
              {{ isLoading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>

        </form>
      </div>
    </div>
  `
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm: FormGroup;
  isEditMode = false;
  isGroomingRoute = false;
  appointmentId: number | null = null;
  isLoading = false;

  doctors: Doctor[] = [];
  pets: Pet[] = [];
  services: Service[] = [];
  estimatedPrice: number | null = null;

  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentService);
  private doctorService = inject(DoctorService);
  private petService = inject(PetService);
  private groomingService = inject(GroomingService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.appointmentForm = this.fb.group({
      type: ['medical'], // 'medical' or 'grooming'
      doctor_id: [null], // Validators set dynamically
      service_id: [null], // Validators set dynamically
      pet_id: [null, Validators.required],
      // Regex for DD/MM/YYYY HH:MM
      date_time: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)]],
      status: ['scheduled', Validators.required],
      reason: [''],
      notes: [''],
      price: [null]
    });
  }

  ngOnInit(): void {
    this.loadDoctors();
    this.loadPets();
    this.loadServices();

    // Check route data for mode
    this.route.data.subscribe(data => {
      this.isGroomingRoute = !!data['isGrooming'];
      const type = this.isGroomingRoute ? 'grooming' : 'medical';
      this.appointmentForm.patchValue({ type: type });
      // Lock validators immediately based on route
      this.updateValidators(type);
    });

    this.setupFormLogic();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.appointmentId = +id;
      this.loadAppointment(this.appointmentId);
    }
  }

  get pageTitle(): string {
    if (this.isGroomingRoute) {
      return this.isEditMode ? 'Editar Banho e Tosa' : 'Novo Banho e Tosa';
    }
    return this.isEditMode ? 'Editar Consulta' : 'Nova Consulta';
  }

  loadServices(): void {
    this.groomingService.getServices().subscribe(data => this.services = data);
  }

  setupFormLogic() {
    const typeControl = this.appointmentForm.get('type');
    const serviceControl = this.appointmentForm.get('service_id');
    const petControl = this.appointmentForm.get('pet_id');

    // Type changes
    typeControl?.valueChanges.subscribe(type => {
      this.updateValidators(type);
      if (type === 'medical') {
        this.appointmentForm.patchValue({ service_id: null, price: null });
        this.estimatedPrice = null;
      } else {
        this.appointmentForm.patchValue({ doctor_id: null });
      }
    });

    // Price calculation triggers
    const calculate = () => {
      const type = typeControl?.value;
      const serviceId = serviceControl?.value;
      const petId = petControl?.value;

      if (type === 'grooming' && serviceId && petId) {
        const pet = this.pets.find(p => p.id === petId);
        if (pet) {
          this.groomingService.calculatePrice(serviceId, pet).subscribe(price => {
            this.estimatedPrice = price;
            if (price !== null) {
              // Only update if the user hasn't manually entered a value yet, OR if we want to force update on change
              // For better UX, let's update it so they have a starting point
              this.appointmentForm.patchValue({ price: price });
            }
          });
        }
      } else {
        this.estimatedPrice = null;
      }
    };

    serviceControl?.valueChanges.subscribe(calculate);
    petControl?.valueChanges.subscribe(calculate);
  }

  updateValidators(type: string) {
    const doctorControl = this.appointmentForm.get('doctor_id');
    const serviceControl = this.appointmentForm.get('service_id');
    const priceControl = this.appointmentForm.get('price');

    if (type === 'medical') {
      doctorControl?.setValidators([Validators.required]);
      serviceControl?.clearValidators();
      priceControl?.clearValidators();
    } else {
      serviceControl?.setValidators([Validators.required]);
      priceControl?.setValidators([Validators.required, Validators.min(0)]);
      doctorControl?.clearValidators();
    }
    doctorControl?.updateValueAndValidity();
    serviceControl?.updateValueAndValidity();
    priceControl?.updateValueAndValidity();
  }

  loadDoctors(): void {
    this.doctorService.getDoctors().subscribe(data => {
      // Business Rule: Only active doctors can perform consultations
      this.doctors = data.filter(d => d.is_active);
    });
  }

  loadPets(): void {
    this.petService.getPets().subscribe(data => this.pets = data);
  }

  loadAppointment(id: number): void {
    this.appointmentService.getAppointment(id).subscribe({
      next: (appointment) => {
        // Convert ISO to MM/DD/YYYY HH:MM
        const formattedDate = this.isoToDisplay(appointment.date_time);

        // Determine type based on service_id presence
        const type = appointment.service_id ? 'grooming' : 'medical';
        this.updateValidators(type);

        this.appointmentForm.patchValue({
          ...appointment,
          date_time: formattedDate,
          type: type
        });

        if (appointment.price) {
          this.estimatedPrice = appointment.price;
        }
      },
      error: (err) => console.error('Error loading appointment', err)
    });
  }

  // Called when the MatDatepicker selects a date
  onDateChange(event: any) {
    const date: Date = event.value;
    if (!date) return;

    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();

    // Preserve existing time if strict format is already there, otherwise default to 09:00
    let timePart = '09:00';
    const currentValue = this.appointmentForm.get('date_time')?.value;

    if (currentValue && /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(currentValue)) {
      timePart = currentValue.split(' ')[1];
    }

    const newValue = `${dd}/${mm}/${yyyy} ${timePart}`;
    this.appointmentForm.patchValue({ date_time: newValue });
    this.appointmentForm.markAsDirty();
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) return;

    this.isLoading = true;
    const formValue = this.appointmentForm.value;

    // Convert MM/DD/YYYY HH:MM to ISO
    try {
      const isoDate = this.displayToIso(formValue.date_time);

      // Destructure to remove 'type' from payload and ensure correct fields
      const { type, ...cleanFormValue } = formValue;

      const payload = {
        ...cleanFormValue,
        date_time: isoDate
      };

      if (this.isEditMode && this.appointmentId) {
        // Medical appointments need doctor availability check
        if (type === 'medical' && formValue.doctor_id) {
          this.appointmentService.checkAvailability(formValue.doctor_id, isoDate, this.appointmentId).subscribe((isAvailable) => {
            if (!isAvailable) {
              alert('Este veterinário já possui uma consulta neste horário.');
              this.isLoading = false;
              return;
            }
            this.updateAppointment(this.appointmentId!, payload);
          });
        } else {
          // Grooming or no doctor check needed
          this.updateAppointment(this.appointmentId!, payload);
        }
      } else {
        // New Appointment
        if (type === 'medical' && formValue.doctor_id) {
          this.appointmentService.checkAvailability(formValue.doctor_id, isoDate).subscribe((isAvailable) => {
            if (!isAvailable) {
              alert('Este veterinário já possui uma consulta neste horário.');
              this.isLoading = false;
              return;
            }
            this.createAppointment(payload);
          });
        } else {
          this.createAppointment(payload);
        }
      }
    } catch (e) {
      console.error('Date parsing error', e);
      alert('Data inválida. Use o formato DD/MM/YYYY HH:MM');
      this.isLoading = false;
    }
  }

  createAppointment(payload: any) {
    this.appointmentService.createAppointment(payload).subscribe({
      next: () => {
        this.navigateBack();
      },
      error: (err) => {
        console.error('Error creating appointment', err);
        this.isLoading = false;
        alert('Erro ao criar agendamento. Tente novamente.');
      }
    });
  }

  updateAppointment(id: number, payload: any) {
    this.appointmentService.updateAppointment(id, payload).subscribe({
      next: () => {
        this.navigateBack();
      },
      error: (err) => {
        console.error('Error updating appointment', err);
        this.isLoading = false;
        alert('Erro ao atualizar agendamento. Tente novamente.');
      }
    });
  }

  navigateBack() {
    if (this.isGroomingRoute) {
      this.router.navigate(['/grooming']);
    } else {
      this.router.navigate(['/appointments']);
    }
  }

  // Helper: ISO (YYYY-MM-DDTHH:mm:ss) -> DD/MM/YYYY HH:mm
  private isoToDisplay(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }

  // Helper: DD/MM/YYYY HH:mm -> ISO
  private displayToIso(displayString: string): string {
    // Expected: 29/01/2026 17:00
    const [datePart, timePart] = displayString.split(' ');
    if (!datePart || !timePart) throw new Error('Invalid format');

    const [dd, mm, yyyy] = datePart.split('/');
    const [hh, min] = timePart.split(':');

    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
    return date.toISOString();
  }
}

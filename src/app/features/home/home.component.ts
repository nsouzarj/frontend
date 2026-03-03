import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container mx-auto p-6 animate-fade-in-up">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
        <div class="relative z-10">
          <h1 class="text-3xl md:text-4xl font-bold mb-2">Bem-vindo ao CliniPet</h1>
          <p class="text-primary-100 text-lg max-w-2xl">Sistema de gestão veterinária inteligente. Gerencie tutores, pacientes e consultas de forma simples e eficiente.</p>
        </div>
        
        <!-- Decorative bg shapes -->
        <div class="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-1/4 -mb-10 w-40 h-40 bg-teal-400 opacity-20 rounded-full blur-2xl"></div>
      </div>

      <!-- Quick Actions -->
      <h2 class="text-xl font-bold text-gray-800 mb-4 ml-1 flex items-center">
        <mat-icon class="mr-2 text-gray-600">flash_on</mat-icon>
        Ações Rápidas
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          <!-- Nova Consulta -->
          <a routerLink="/appointments/new" class="group flex items-center p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
             <div class="bg-white/20 p-3 rounded-lg mr-4 group-hover:bg-white/30 transition-colors">
                <mat-icon class="text-white scale-125">event_available</mat-icon>
             </div>
             <div>
                <p class="text-white font-bold text-lg">Nova Consulta</p>
                <p class="text-indigo-100 text-xs">Agendar atendimento</p>
             </div>
          </a>

          <!-- Novo Tutor -->
          <a routerLink="/owners/new" class="group flex items-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
             <div class="bg-white/20 p-3 rounded-lg mr-4 group-hover:bg-white/30 transition-colors">
                <mat-icon class="text-white scale-125">person_add</mat-icon>
             </div>
             <div>
                 <p class="text-white font-bold text-lg">Novo Tutor</p>
                 <p class="text-blue-100 text-xs">Cadastrar cliente</p>
             </div>
          </a>

          <!-- Novo Pet -->
          <a routerLink="/pets" class="group flex items-center p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
             <div class="bg-white/20 p-3 rounded-lg mr-4 group-hover:bg-white/30 transition-colors">
                <mat-icon class="text-white scale-125">pets</mat-icon>
             </div>
             <div>
                 <p class="text-white font-bold text-lg">Ver Pets</p>
                 <p class="text-teal-100 text-xs">Acessar pacientes</p>
             </div>
          </a>

          <!-- Novo Veterinário -->
          <a routerLink="/doctors/new" class="group flex items-center p-4 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
             <div class="bg-white/20 p-3 rounded-lg mr-4 group-hover:bg-white/30 transition-colors">
                <mat-icon class="text-white scale-125">medical_services</mat-icon>
             </div>
             <div>
                 <p class="text-white font-bold text-lg">Novo Vet</p>
                 <p class="text-rose-100 text-xs">Adicionar especialista</p>
             </div>
          </a>

          <!-- Novo Banho e Tosa -->
          <a routerLink="/grooming/new" class="group flex items-center p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
             <div class="bg-white/20 p-3 rounded-lg mr-4 group-hover:bg-white/30 transition-colors">
                <mat-icon class="text-white scale-125">content_cut</mat-icon>
             </div>
             <div>
                 <p class="text-white font-bold text-lg">Novo Banho</p>
                 <p class="text-pink-100 text-xs">Agendar estética</p>
             </div>
          </a>
      </div>

      <!-- Quick Stats / Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        
        <!-- Owners Card -->
        <mat-card appearance="outlined" class="hover:shadow-md transition-shadow !rounded-xl !p-4 !bg-[#FFFDD0]">
          <mat-card-header>
            <div mat-card-avatar class="bg-blue-50 flex items-center justify-center rounded-full text-blue-600">
               <mat-icon color="primary">people</mat-icon>
            </div>
            <mat-card-title class="!text-lg !font-bold">Tutores e Pets</mat-card-title>
            <mat-card-subtitle>Gestão</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="mt-4 min-h-[40px]">
             <mat-spinner *ngIf="isLoading" diameter="30"></mat-spinner>
             <p *ngIf="!isLoading" class="text-3xl font-bold text-gray-800">
                {{ stats?.total_owners || 0 }} / {{ stats?.total_pets || 0 }}
             </p> 
          </mat-card-content>
          <mat-card-actions align="end">
            <a mat-button color="primary" routerLink="/owners">
              ACESSAR <mat-icon iconPositionEnd>arrow_forward</mat-icon>
            </a>
          </mat-card-actions>
        </mat-card>

        <!-- Doctors Card -->
        <mat-card appearance="outlined" class="hover:shadow-md transition-shadow !rounded-xl !p-4 !bg-[#FFFDD0]">
          <mat-card-header>
            <div mat-card-avatar class="bg-green-50 flex items-center justify-center rounded-full text-green-600">
               <mat-icon class="text-green-600">medical_services</mat-icon>
            </div>
            <mat-card-title class="!text-lg !font-bold">Veterinários</mat-card-title>
            <mat-card-subtitle>Clínica</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="mt-4 min-h-[40px]">
             <mat-spinner *ngIf="isLoading" diameter="30"></mat-spinner>
             <p *ngIf="!isLoading" class="text-3xl font-bold text-gray-800">{{ stats?.total_doctors || 0 }}</p>
          </mat-card-content>
          <mat-card-actions align="end">
            <a mat-button color="primary" routerLink="/doctors">
              GERENCIAR <mat-icon iconPositionEnd>arrow_forward</mat-icon>
            </a>
          </mat-card-actions>
        </mat-card>

        <!-- Appointments Card (Medical Only) -->
        <mat-card appearance="outlined" class="hover:shadow-md transition-shadow !rounded-xl !p-4 !bg-[#FFFDD0]">
          <mat-card-header>
            <div mat-card-avatar class="bg-purple-50 flex items-center justify-center rounded-full text-purple-600">
               <mat-icon color="accent">calendar_today</mat-icon>
            </div>
            <mat-card-title class="!text-lg !font-bold">Consultas Médicas</mat-card-title>
            <mat-card-subtitle>Agenda Clínica</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="mt-4 min-h-[40px]">
             <mat-spinner *ngIf="isLoading" diameter="30"></mat-spinner>
             <div *ngIf="!isLoading">
                <p class="text-3xl font-bold text-gray-800 mb-3">{{ stats?.total_appointments || 0 }}</p>
                
                <div class="flex flex-col gap-1 border-t pt-2">
                    <div class="flex justify-between items-center">
                        <span class="text-xs uppercase font-bold text-blue-600">Agendadas</span>
                        <span class="text-lg font-bold text-blue-600">{{ stats?.appointments_scheduled || 0 }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs uppercase font-bold text-green-600">Realizadas</span>
                        <span class="text-lg font-bold text-green-600">{{ stats?.appointments_completed || 0 }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs uppercase font-bold text-red-600">Canceladas</span>
                        <span class="text-lg font-bold text-red-600">{{ stats?.appointments_cancelled || 0 }}</span>
                    </div>
                </div>
             </div>
          </mat-card-content>
          <mat-card-actions align="end">
            <a mat-button color="accent" routerLink="/appointments">
              VER AGENDA <mat-icon iconPositionEnd>arrow_forward</mat-icon>
            </a>
          </mat-card-actions>
        </mat-card>

        <!-- Grooming Card (Banho e Tosa) -->
        <mat-card appearance="outlined" class="hover:shadow-md transition-shadow !rounded-xl !p-4 !bg-[#FFFDD0]">
          <mat-card-header>
            <div mat-card-avatar class="bg-pink-50 flex items-center justify-center rounded-full text-pink-600">
               <mat-icon class="text-pink-600">content_cut</mat-icon>
            </div>
            <mat-card-title class="!text-lg !font-bold">Banho e Tosa</mat-card-title>
            <mat-card-subtitle>Estética</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="mt-4 min-h-[40px]">
             <mat-spinner *ngIf="isLoading" diameter="30"></mat-spinner>
             <div *ngIf="!isLoading">
                <p class="text-3xl font-bold text-gray-800 mb-3">{{ stats?.total_grooming || 0 }}</p>
                
                <div class="flex flex-col gap-1 border-t pt-2">
                    <div class="flex justify-between items-center">
                        <span class="text-xs uppercase font-bold text-blue-600">Agendados</span>
                        <span class="text-lg font-bold text-blue-600">{{ stats?.grooming_scheduled || 0 }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs uppercase font-bold text-green-600">Realizados</span>
                        <span class="text-lg font-bold text-green-600">{{ stats?.grooming_completed || 0 }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs uppercase font-bold text-red-600">Cancelados</span>
                        <span class="text-lg font-bold text-red-600">{{ stats?.grooming_cancelled || 0 }}</span>
                    </div>
                </div>
             </div>
          </mat-card-content>
          <mat-card-actions align="end">
            <a mat-button color="accent" routerLink="/grooming" class="!text-pink-600">
              VER AGENDA <mat-icon iconPositionEnd>arrow_forward</mat-icon>
            </a>
          </mat-card-actions>
        </mat-card>

        <!-- Species Stats Card -->
        <mat-card appearance="outlined" class="hover:shadow-md transition-shadow !rounded-xl !p-4 col-span-1 md:col-span-2 lg:col-span-1 !bg-[#FFFDD0]">
          <mat-card-header>
            <div mat-card-avatar class="bg-orange-50 flex items-center justify-center rounded-full text-orange-600">
               <mat-icon class="text-orange-600">pets</mat-icon>
            </div>
            <mat-card-title class="!text-lg !font-bold">Pacientes</mat-card-title>
            <mat-card-subtitle>Por Espécie</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content class="mt-4 min-h-[40px]">
             <mat-spinner *ngIf="isLoading" diameter="30"></mat-spinner>
             <div *ngIf="!isLoading">
                <p class="text-3xl font-bold text-gray-800 mb-3">{{ stats?.total_pets || 0 }}</p>
                
                <div class="flex flex-col gap-1 border-t pt-2">
                    <div class="flex justify-between items-center">
                        <span class="text-xs uppercase font-bold text-orange-600">Cães</span>
                        <span class="text-lg font-bold text-orange-600">{{ stats?.total_dogs || 0 }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs uppercase font-bold text-blue-600">Gatos</span>
                        <span class="text-lg font-bold text-blue-600">{{ stats?.total_cats || 0 }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs uppercase font-bold text-green-600">Outros</span>
                        <span class="text-lg font-bold text-green-600">{{ (stats?.total_birds || 0) + (stats?.total_others || 0) }}</span>
                    </div>
                </div>
             </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  stats: DashboardStats | null = null;
  isLoading = true;

  ngOnInit() {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching stats', err);
        // Fallback to zeros or stay loading? let's just stop loading
        this.isLoading = false;
      }
    });

  }
}

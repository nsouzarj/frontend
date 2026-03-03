import { Component, OnInit, ChangeDetectorRef, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DoctorService } from '../../../core/services/doctor.service';
import { DialogService } from '../../../core/services/dialog.service';
import { Doctor } from '../../../core/models/business.models';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './doctor-list.component.html'
})
export class DoctorListComponent implements OnInit, AfterViewInit {
  private doctorService = inject(DoctorService);
  private cdr = inject(ChangeDetectorRef);
  private dialogService = inject(DialogService);

  doctors: Doctor[] = [];
  dataSource = new MatTableDataSource<Doctor>([]);
  displayedColumns: string[] = ['full_name', 'crmv', 'specialty', 'status', 'actions'];

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadDoctors();
  }

  ngAfterViewInit() {
    // Redundant with setters, but kept for interface compliance if needed
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.errorMessage = null;
    console.log(`[${new Date().toISOString()}] Initiating doctor load...`);

    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        console.log(`[${new Date().toISOString()}] Doctors loaded successfully:`, data);
        this.doctors = data;
        this.dataSource.data = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(`[${new Date().toISOString()}] Error loading doctors:`, err);
        this.errorMessage = 'Erro ao carregar lista de veterinários. ' + (err.error?.detail || err.message || 'Erro desconhecido.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteDoctor(doctor: Doctor): void {
    this.dialogService.confirm({
      title: 'Excluir Veterinário',
      message: `Tem certeza que deseja excluir o veterinário "${doctor.full_name}"?`,
      confirmText: 'Excluir',
      color: 'warn'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.doctorService.deleteDoctor(doctor.id).subscribe({
          next: () => {
            this.doctors = this.doctors.filter(d => d.id !== doctor.id);
            this.dataSource.data = this.doctors;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error deleting doctor', err);
            alert('Erro ao excluir veterinário');
          }
        });
      }
    });
  }
}

import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment, AppointmentStatus } from '../../../core/models/business.models';
import { DoctorService } from '../../../core/services/doctor.service';
import { DialogService } from '../../../core/services/dialog.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PrescriptionDialogComponent } from '../prescription-dialog/prescription-dialog.component';
import { ExamDialogComponent } from '../exam-dialog/exam-dialog.component';
import { AppointmentStatusPipe } from '../../../shared/pipes/appointment-status.pipe';
import { AppointmentStatusColorPipe } from '../../../shared/pipes/appointment-status-color.pipe';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    AppointmentStatusPipe,
    AppointmentStatusColorPipe
  ],
  templateUrl: './appointment-list.component.html'
})
export class AppointmentListComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private doctorService = inject(DoctorService);
  private dialogService = inject(DialogService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  appointments: Appointment[] = [];
  doctors: Record<number, string> = {};
  isGrooming = false;

  dataSource = new MatTableDataSource<Appointment>([]);
  displayedColumns: string[] = ['date_time', 'doctor_name', 'pet_id', 'status', 'actions'];

  isLoading = false;
  errorMessage: string | null = null;

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.dataSource.sort = sort;

    // Custom sorting for Professional/Doctor Name
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'doctor_name': return this.getProfessionalName(item).toLowerCase();
        case 'date_time': return new Date(item.date_time).getTime();
        default: return (item as any)[property];
      }
    };
  }

  ngOnInit(): void {
    // Determine mode based on route data
    this.route.data.subscribe(data => {
      this.isGrooming = !!data['isGrooming'];
      // Update displayed columns header title dynamically if possible, or use *ngIf in template
    });

    // Configure custom filter predicate
    this.dataSource.filterPredicate = (data: Appointment, filter: string) => {
      const search = filter.toLowerCase();

      // Doctor or Service
      const professional = this.getProfessionalName(data).toLowerCase();

      // Pet
      const pet = (data.pet?.name || data.pet_name || `pet #${data.pet_id}`).toLowerCase();

      // Status
      const statusRaw = data.status.toLowerCase();
      let statusTranslated = '';
      if (statusRaw === 'scheduled') statusTranslated = 'agendado';
      else if (statusRaw === 'completed') statusTranslated = 'realizado';
      else if (statusRaw === 'cancelled') statusTranslated = 'cancelado';

      // Date
      const date = new Date(data.date_time).toLocaleDateString().toLowerCase();

      return professional.includes(search) ||
        pet.includes(search) ||
        statusRaw.includes(search) ||
        statusTranslated.includes(search) ||
        date.includes(search);
    };

    this.loadDoctors();
    this.loadAppointments();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.appointmentService.getAppointments().subscribe({
      next: (data) => {
        // Filter based on route (Client-side filtering for simplicity)
        if (this.isGrooming) {
          this.appointments = data.filter(a => a.service_id !== null && a.service_id !== undefined);
        } else {
          // Medical: Show where service_id is null (or undefined)
          this.appointments = data.filter(a => !a.service_id);
        }

        this.dataSource.data = this.appointments;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading appointments', err);
        this.errorMessage = 'Erro ao carregar consultas.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadDoctors(): void {
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        data.forEach(d => this.doctors[d.id] = d.full_name);

        // Refresh table data
        if (this.dataSource.data.length > 0) {
          const currentData = this.dataSource.data;
          this.dataSource.data = currentData;
        }

        this.cdr.detectChanges();
      }
    });
  }

  // Renamed/Enhanced helper
  getProfessionalName(appointment: Appointment): string {
    if (appointment.service_id) {
      return appointment.service?.name || 'Serviço de Estética';
    }
    if (!appointment.doctor_id) return 'Não atribuído';
    return this.doctors[appointment.doctor_id] || 'Carregando...';
  }

  // Legacy helper for template usage if needed, pointing to new logic
  getDoctorName(id: number | undefined): string {
    // This method signature is insufficient for service name, so we rely on the row object in template
    // We will update the template to call getProfessionalName(element)
    return '';
  }

  deleteAppointment(app: Appointment): void {
    const title = this.isGrooming ? 'Excluir Banho e Tosa' : 'Excluir Consulta';
    let petName = app.pet?.name || app.pet_name || `Pet #${app.pet_id}`;
    const message = this.isGrooming
      ? `Deseja excluir esse banho e tosa do pet "${petName}"?`
      : `Tem certeza que deseja cancelar e excluir esta consulta do pet "${petName}"?`;

    this.dialogService.confirm({
      title: title,
      message: message,
      confirmText: 'Excluir',
      color: 'warn'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.appointmentService.deleteAppointment(app.id).subscribe({
          next: () => {
            this.appointments = this.appointments.filter(a => a.id !== app.id);
            this.dataSource.data = this.appointments; // Update datasource explicitly
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error deleting appointment', err);
            alert('Erro ao excluir consulta');
          }
        });
      }
    });
  }

  // TrackBy for performance
  trackByFn(index: number, item: Appointment): number {
    return item.id;
  }

  openPrescriptionDialog(appointment: Appointment) {
    if (!appointment) return;

    // Determine pet name safely with multiple fallbacks
    let petName = 'Paciente Desconhecido';
    if (appointment.pet && appointment.pet.name) {
      petName = appointment.pet.name;
    } else if (appointment.pet_name) {
      petName = appointment.pet_name;
    } else if (appointment.pet_id) {
      petName = `Pet #${appointment.pet_id}`;
    }

    console.log('Opening prescription dialog for:', { id: appointment.id, petId: appointment.pet_id });

    this.dialog.open(PrescriptionDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: {
        appointmentId: appointment.id,
        petId: appointment.pet_id,
        petName: petName,
        petWeight: appointment.pet?.weight_kg,
        petAge: appointment.pet?.age_years
      }
    });
  }

  openExamDialog(appointment: Appointment) {
    if (!appointment) return;

    let petName = 'Paciente Desconhecido';
    if (appointment.pet && appointment.pet.name) {
      petName = appointment.pet.name;
    } else if (appointment.pet_name) {
      petName = appointment.pet_name;
    }

    this.dialog.open(ExamDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: {
        appointmentId: appointment.id,
        petName: petName,
        petWeight: appointment.pet?.weight_kg,
        petAge: appointment.pet?.age_years
      }
    });
  }
}

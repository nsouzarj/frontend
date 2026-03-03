import { Component, Inject, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { PrescriptionService, PrescriptionCreate, Prescription } from '../../../core/services/prescription.service';
import { DialogService } from '../../../core/services/dialog.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DatePipe } from '@angular/common';
import { PdfViewDialogComponent } from '../../../shared/components/pdf-view-dialog/pdf-view-dialog.component';
import { PdfService } from '../../../core/services/pdf.service';

interface MedicationItem {
    id: number;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: string;
}

export interface PrescriptionDialogData {
    appointmentId: number;
    petId?: number;
    petName: string;
    petWeight?: number;
    petAge?: number;
}

@Component({
    selector: 'app-prescription-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatListModule,
        MatTooltipModule,
        MatSelectModule
    ],
    providers: [DatePipe],
    templateUrl: './prescription-dialog.component.html'
})
export class PrescriptionDialogComponent {
    private fb = inject(FormBuilder);
    private prescriptionService = inject(PrescriptionService);
    private dialogService = inject(DialogService);
    private appointmentService = inject(AppointmentService);
    private cdr = inject(ChangeDetectorRef);
    private dialog = inject(MatDialog);
    private pdfService = inject(PdfService);

    mainForm: FormGroup;
    medForm: FormGroup;
    isSaving = false;
    currentDate = new Date();

    medications: MedicationItem[] = [];
    previousPrescriptions: Prescription[] = [];
    nextId = 1;

    routes = [
        'Oral',
        'Tópico',
        'Injetável (SC)',
        'Injetável (IM)',
        'Injetável (IV)',
        'Oftálmico',
        'Otológico',
        'Outro'
    ];

    appointmentDetails: any = null;

    public dialogRef = inject(MatDialogRef<PrescriptionDialogComponent>);
    public data = inject(MAT_DIALOG_DATA) as PrescriptionDialogData;

    constructor() {
        this.mainForm = this.fb.group({
            instructions: ['']
        });

        this.medForm = this.fb.group({
            name: ['', Validators.required],
            dosage: ['', Validators.required],
            frequency: ['', Validators.required],
            duration: ['', Validators.required],
            route: ['Oral', Validators.required]
        });

        // Load details for PDF
        this.loadAppointmentDetails();

        this.loadPreviousPrescriptions();
    }

    loadAppointmentDetails() {
        this.appointmentService.getAppointment(this.data.appointmentId).subscribe({
            next: (appt: any) => {
                this.appointmentDetails = appt;
                console.log('Dados completos para PDF:', appt);
            },
            error: (err) => console.error('Erro ao carregar detalhes para PDF', err)
        });
    }

    addMedication() {
        if (this.medForm.invalid) return;

        const val = this.medForm.value;
        const newItem: MedicationItem = {
            id: this.nextId++,
            name: val.name,
            dosage: val.dosage,
            frequency: val.frequency,
            duration: val.duration,
            route: val.route
        };

        this.medications.push(newItem);
        this.medForm.reset({ route: 'Oral' });
        Object.keys(this.medForm.controls).forEach(key => {
            this.medForm.get(key)?.setErrors(null);
        });
    }

    removeMedication(id: number) {
        this.medications = this.medications.filter(m => m.id !== id);
    }

    save() {
        if (this.medications.length === 0 && !this.mainForm.value.instructions) {
            return;
        }

        this.isSaving = true;

        let medsText = "";
        this.medications.forEach((med, index) => {
            medsText += `${index + 1}. ${med.name} -- ${med.dosage}\n`;
            medsText += `   Via: ${med.route} | Uso: ${med.frequency} por ${med.duration}\n\n`;
        });

        const model: PrescriptionCreate = {
            appointment_id: this.data.appointmentId,
            medications: medsText.trim(),
            instructions: this.mainForm.value.instructions
        };

        this.prescriptionService.createPrescription(model).subscribe({
            next: (res) => {
                // Generate PDF Client-Side using Data from DB
                const doctorName = this.appointmentDetails?.doctor?.full_name || 'Veterinário';
                const doctorCrm = this.appointmentDetails?.doctor?.crmv || '00000';
                const ownerName = this.appointmentDetails?.pet?.owner?.full_name || 'Tutor';
                const pet = this.appointmentDetails?.pet;
                const owner = pet?.owner;

                this.pdfService.generatePrescription({
                    doctorName,
                    doctorCrm,
                    doctorEmail: this.appointmentDetails?.doctor?.email,
                    doctorPhone: this.appointmentDetails?.doctor?.phone,
                    petName: this.data.petName,
                    species: pet?.species,
                    breed: pet?.breed,
                    age: pet?.age_years ? `${pet.age_years} anos` : undefined,
                    weight: pet?.weight_kg ? `${pet.weight_kg} kg` : undefined,
                    ownerName,
                    ownerPhone: owner?.phone,
                    ownerEmail: owner?.email,
                    medications: this.medications.map(m => ({
                        name: `${m.name} ${m.dosage}`,
                        usage: `Via ${m.route} - ${m.frequency}`,
                        notes: `Duração: ${m.duration}`
                    })),
                    instructions: this.mainForm.value.instructions
                });

                this.loadPreviousPrescriptions();

                // Reset
                this.medications = [];
                this.mainForm.reset();
                this.medForm.reset({ route: 'Oral' });
                this.isSaving = false;
            },
            error: (err) => {
                console.error('Error creating prescription', err);
                this.isSaving = false;
            }
        });
    }

    loadPreviousPrescriptions() {
        const tryLoad = (petId?: number) => {
            const apptId = petId ? undefined : this.data.appointmentId;
            this.prescriptionService.getPrescriptions(apptId, petId).subscribe({
                next: (data) => {
                    this.previousPrescriptions = data;
                    this.cdr.detectChanges();
                },
                error: (err) => console.error('Error loading history', err)
            });
        };

        if (this.data.petId) {
            tryLoad(this.data.petId);
        } else {
            // Already fetched in loadAppointmentDetails, but async race condition requires caution
            // We can rely on service again or wait. Simplest is fetch again or strictly use appointmentId first.
            tryLoad(undefined);
        }
    }

    printOldPdf(prescription: Prescription) {
        // Reimprime uma receita antiga usando o texto salvo
        const doctorName = this.appointmentDetails?.doctor?.full_name || 'Veterinário';
        const doctorCrm = this.appointmentDetails?.doctor?.crmv || '00000';
        const ownerName = this.appointmentDetails?.pet?.owner?.full_name || 'Tutor';

        // Como o texto salvo é um bloco único, mandamos como um item único ou tentamos parsear?
        // Vamos mandar formatao simples.

        const owner = this.appointmentDetails?.pet?.owner;

        this.pdfService.generatePrescription({
            doctorName,
            doctorCrm,
            doctorEmail: this.appointmentDetails?.doctor?.email,
            doctorPhone: this.appointmentDetails?.doctor?.phone,
            petName: this.data.petName,
            species: this.appointmentDetails?.pet?.species,
            breed: this.appointmentDetails?.pet?.breed,
            age: this.appointmentDetails?.pet?.age_years ? `${this.appointmentDetails.pet.age_years} anos` : undefined,
            weight: this.appointmentDetails?.pet?.weight_kg ? `${this.appointmentDetails.pet.weight_kg} kg` : undefined,
            ownerName,
            ownerPhone: owner?.phone,
            ownerEmail: owner?.email,
            medications: [
                {
                    name: 'Conteúdo Original (Cópia)',
                    usage: prescription.medications,
                    notes: `Emitida originalmente em: ${new Date(prescription.created_at).toLocaleDateString('pt-BR')}`
                }
            ],
            instructions: prescription.instructions || ''
        });
    }

    deletePrescription(p: Prescription) {
        this.dialogService.confirm({
            title: 'Excluir Receita',
            message: `Tem certeza que deseja excluir esta receita gerada em ${new Date(p.created_at).toLocaleDateString('pt-BR')} do histórico?`,
            confirmText: 'Excluir',
            color: 'warn'
        }).subscribe(confirmed => {
            if (confirmed) {
                this.prescriptionService.deletePrescription(p.id).subscribe({
                    next: () => {
                        this.previousPrescriptions = this.previousPrescriptions.filter(rx => rx.id !== p.id);
                    },
                    error: (err) => {
                        console.error('Error deleting prescription', err);
                        alert('Erro ao excluir receita.');
                    }
                });
            }
        });
    }
}

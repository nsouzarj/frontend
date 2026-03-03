import { Component, Inject, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExamService, ExamCreate } from '../../../core/services/exam.service';
import { PrescriptionDialogData } from '../prescription-dialog/prescription-dialog.component';
import { DialogService } from '../../../core/services/dialog.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PdfService } from '../../../core/services/pdf.service';

@Component({
    selector: 'app-exam-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatCheckboxModule,
        MatTooltipModule
    ],
    providers: [DatePipe],
    templateUrl: './exam-dialog.component.html'
})
export class ExamDialogComponent {
    private fb = inject(FormBuilder);
    private examService = inject(ExamService);
    private cdr = inject(ChangeDetectorRef);
    private pdfService = inject(PdfService);

    form: FormGroup;
    isSaving = false;
    currentDate = new Date();

    // List of common exams
    commonExams = [
        { name: 'Hemograma Completo', selected: false },
        { name: 'Bioquímico (Renal/Hepático)', selected: false },
        { name: 'Raio-X (Tórax)', selected: false },
        { name: 'Raio-X (Abdomen)', selected: false },
        { name: 'Ultrassonografia Abdominal', selected: false },
        { name: 'Ecocardiograma', selected: false },
        { name: 'Urinálise', selected: false },
        { name: 'Coprológico', selected: false },
        { name: 'Citologia', selected: false },
        { name: 'Teste Rápido (4Dx/FIV/FeLV)', selected: false }
    ];

    previousExams: any[] = []; // Using any for simplicity or reuse Exam interface
    appointmentDetails: any = null;

    public dialogRef = inject(MatDialogRef<ExamDialogComponent>);
    public data = inject(MAT_DIALOG_DATA) as PrescriptionDialogData;
    private dialogService = inject(DialogService);
    private appointmentService = inject(AppointmentService);

    constructor() {
        this.form = this.fb.group({
            observations: [''],
            otherExams: ['']
        });

        // Load details for PDF
        this.loadAppointmentDetails();

        this.loadPreviousExams();
    }

    loadAppointmentDetails() {
        this.appointmentService.getAppointment(this.data.appointmentId).subscribe({
            next: (appt: any) => {
                this.appointmentDetails = appt;
            },
            error: (err) => console.error('Erro ao carregar detalhes para PDF', err)
        });
    }

    toggleExam(index: number) {
        this.commonExams[index].selected = !this.commonExams[index].selected;
    }

    save() {
        const selectedExams = this.commonExams.filter(e => e.selected).map(e => e.name);
        const otherExams = this.form.value.otherExams;

        if (otherExams) {
            // Split by comma or new line and add to array
            const others = otherExams.split(/[\n,]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            selectedExams.push(...others);
        }

        if (selectedExams.length === 0 && !this.form.value.observations) {
            return;
        }

        this.isSaving = true;

        const model: ExamCreate = {
            appointment_id: this.data.appointmentId,
            exam_types: selectedExams.join('\n'),
            observations: this.form.value.observations
        };

        this.examService.createExam(model).subscribe({
            next: (res) => {
                // Generate PDF Client-Side using Data from DB
                const doctorName = this.appointmentDetails?.doctor?.full_name || 'Veterinário';
                const doctorCrm = this.appointmentDetails?.doctor?.crmv || '00000';
                const ownerName = this.appointmentDetails?.pet?.owner?.full_name || 'Tutor';
                const pet = this.appointmentDetails?.pet;

                const owner = this.appointmentDetails?.pet?.owner;

                this.pdfService.generateExamRequest({
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
                    exams: selectedExams,
                    clinicalHistory: this.form.value.observations
                });

                // Refresh history instead of closing
                this.loadPreviousExams();

                // Reset selections
                this.commonExams.forEach(e => e.selected = false);
                this.form.reset();
                this.isSaving = false;
            },
            error: (err) => {
                console.error('Error creating exam request', err);
                this.isSaving = false;
            }
        });
    }

    loadPreviousExams() {
        const tryLoad = (petId?: number) => {
            const apptId = petId ? undefined : this.data.appointmentId;
            this.examService.getExams(apptId, petId).subscribe({
                next: (data) => {
                    this.previousExams = data;
                    this.cdr.detectChanges();
                },
                error: (err) => console.error('Error loading history', err)
            });
        };

        if (this.data.petId) {
            tryLoad(this.data.petId);
        } else {
            // Already fetched in loadAppointmentDetails, but race cond
            tryLoad(undefined);
        }
    }

    printOldPdf(exam: any) {
        // Reimprime um pedido antigo
        const doctorName = this.appointmentDetails?.doctor?.full_name || 'Veterinário';
        const doctorCrm = this.appointmentDetails?.doctor?.crmv || '00000';
        const ownerName = this.appointmentDetails?.pet?.owner?.full_name || 'Tutor';
        const pet = this.appointmentDetails?.pet;

        // Parse exam_types which is stored as string with newlines
        const examsList = exam.exam_types ? exam.exam_types.split('\n') : [];

        const owner = this.appointmentDetails?.pet?.owner;

        this.pdfService.generateExamRequest({
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
            exams: examsList,
            clinicalHistory: exam.observations
        });
    }

    deleteExam(p: any) {
        this.dialogService.confirm({
            title: 'Excluir Pedido de Exames',
            message: `Tem certeza que deseja excluir este pedido gerado em ${new Date(p.created_at).toLocaleDateString('pt-BR')} do histórico?`,
            confirmText: 'Excluir',
            color: 'warn'
        }).subscribe(confirmed => {
            if (confirmed) {
                this.examService.deleteExam(p.id).subscribe({
                    next: () => {
                        this.previousExams = this.previousExams.filter(rx => rx.id !== p.id);
                    },
                    error: (err) => {
                        console.error('Error deleting exam', err);
                        alert('Erro ao excluir pedido');
                    }
                });
            }
        });
    }
}

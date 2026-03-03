import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LoadingService } from './loading.service';

@Injectable({
    providedIn: 'root'
})
export class PdfService {
    private loadingService = inject(LoadingService);

    constructor() { }

    // ==========================================
    // HELPERS
    // ==========================================

    private translateSpecies(species?: string): string {
        if (!species) return 'N/I';
        switch (species.toLowerCase()) {
            case 'dog': return 'Cachorro';
            case 'cat': return 'Gato';
            case 'bird': return 'Pássaro';
            case 'other': return 'Outro';
            default: return species;
        }
    }

    private addHeader(doc: jsPDF) {
        const pageWidth = doc.internal.pageSize.width;

        doc.setTextColor(15, 118, 110); // Teal #0f766e
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('CLINIPET', pageWidth / 2, 15, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(85, 85, 85);
        doc.text('Centro Veterinário Especializado', pageWidth / 2, 22, { align: 'center' });

        doc.setFontSize(9);
        doc.text('Rua das Flores, 123 - Centro - Cidade/UF | Tel: (11) 99999-9999', pageWidth / 2, 27, { align: 'center' });

        doc.setDrawColor(229, 231, 235); // gray-200
        doc.line(10, 32, pageWidth - 10, 32);
    }

    private addFooter(doc: jsPDF) {
        const pageCount = doc.internal.pages.length - 1;
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text('CliniPet - Software de Gestão Veterinária', 10, pageHeight - 10);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
        }
    }

    private addPatientInfo(doc: jsPDF, data: any, startY: number): number {
        doc.setFontSize(10);
        doc.setTextColor(15, 118, 110); // Teal
        doc.setFont('helvetica', 'bold');
        doc.text('DADOS DO PACIENTE', 14, startY);

        doc.text('DADOS DO TUTOR', 110, startY);

        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');

        let y = startY + 7;
        const lineHeight = 5;

        // Patient Column
        doc.text(`Nome: ${data.petName || 'N/A'}`, 14, y); y += lineHeight;
        doc.text(`Espécie: ${this.translateSpecies(data.species)}`, 14, y); y += lineHeight;
        doc.text(`Raça: ${data.breed || 'N/I'}`, 14, y); y += lineHeight;
        doc.text(`Idade: ${data.age || 'N/I'}`, 14, y); y += lineHeight;
        doc.text(`Peso: ${data.weight || 'N/I'}`, 14, y);

        // reset Y for Owner Column
        y = startY + 7;

        // Owner Column
        doc.text(`Nome: ${data.ownerName || 'N/A'}`, 110, y); y += lineHeight;
        doc.text(`Telefone: ${data.ownerPhone || 'N/I'}`, 110, y); y += lineHeight;
        doc.text(`Email: ${data.ownerEmail || 'N/I'}`, 110, y);

        // Return Y with more padding to avoid overlap with next section
        return startY + (lineHeight * 6) + 15;
    }

    private addSignature(doc: jsPDF, doctorName: string, crm: string, email?: string, phone?: string) {
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        // Adjusted Y position
        const startY = pageHeight - 35;

        doc.setDrawColor(0);
        doc.line(pageWidth / 2 - 60, startY, pageWidth / 2 + 60, startY);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);

        // Line 1: Name and CRMV
        doc.text(`${doctorName} - CRMV: ${crm}`, pageWidth / 2, startY + 5, { align: 'center' });

        // Line 2: Contact Info
        if (email || phone) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50);

            let contactInfo = '';
            if (phone) contactInfo += `Tel: ${phone}`;
            if (email) {
                if (contactInfo) contactInfo += '  |  ';
                contactInfo += `Email: ${email}`;
            }
            doc.text(contactInfo, pageWidth / 2, startY + 10, { align: 'center' });
        }
    }

    // ==========================================
    // GENERATORS
    // ==========================================

    async generatePrescription(data: {
        doctorName: string;
        doctorCrm: string;
        doctorEmail?: string;
        doctorPhone?: string;
        petName: string;
        species?: string;
        breed?: string;
        age?: string;
        weight?: string;
        ownerName: string;
        ownerPhone?: string;
        ownerEmail?: string;
        medications: { name: string; usage: string; notes?: string }[];
        instructions?: string;
    }) {
        this.loadingService.show('Gerando Receita...');
        await new Promise(resolve => setTimeout(resolve, 50)); // Allow UI to render

        try {
            const doc = new jsPDF();

            this.addHeader(doc);

            let y = 45;
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0);
            doc.text('RECEITA VETERINÁRIA', doc.internal.pageSize.width / 2, y, { align: 'center' });

            y += 20;
            y = this.addPatientInfo(doc, data, y);

            // Title
            doc.setFontSize(12);
            doc.setTextColor(15, 118, 110);
            doc.setFont('helvetica', 'bold');
            doc.text('USO INTERNO / EXTERNO', 14, y);
            y += 5;

            // Table
            const tableData = data.medications.map((med, index) => [
                (index + 1).toString(),
                `${med.name}\n${med.usage}${med.notes ? '\nObs: ' + med.notes : ''}`
            ]);

            autoTable(doc, {
                startY: y,
                head: [['#', 'Medicação / Posologia']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [15, 118, 110] },
                columnStyles: {
                    0: { cellWidth: 10, halign: 'center' },
                    1: { cellWidth: 'auto' }
                },
                styles: { fontSize: 10, cellPadding: 3 }
            });

            // Get final Y after table
            y = (doc as any).lastAutoTable.finalY + 15;

            if (data.instructions) {
                // Check page break for instructions
                if (y > 230) {
                    doc.addPage();
                    this.addHeader(doc);
                    y = 40;
                }

                doc.setFontSize(12);
                doc.setTextColor(15, 118, 110);
                doc.setFont('helvetica', 'bold');
                doc.text('OUTRAS ORIENTAÇÕES', 14, y);
                y += 7;

                doc.setFontSize(10);
                doc.setTextColor(0);
                doc.setFont('helvetica', 'normal');

                const splitText = doc.splitTextToSize(data.instructions, 180);
                doc.text(splitText, 14, y);
            }

            this.addSignature(doc, data.doctorName, data.doctorCrm, data.doctorEmail, data.doctorPhone);
            this.addFooter(doc);

            window.open(doc.output('bloburl'), '_blank');
        } finally {
            this.loadingService.hide();
        }
    }

    async generateExamRequest(data: {
        doctorName: string;
        doctorCrm: string;
        doctorEmail?: string;
        doctorPhone?: string;
        petName: string;
        species?: string;
        breed?: string;
        age?: string;
        weight?: string;
        ownerName: string;
        ownerPhone?: string;
        ownerEmail?: string;
        exams: string[];
        clinicalHistory?: string;
    }) {
        this.loadingService.show('Gerando Pedido de Exames...');
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const doc = new jsPDF();

            this.addHeader(doc);

            let y = 45;
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0);
            doc.text('SOLICITAÇÃO DE EXAMES', doc.internal.pageSize.width / 2, y, { align: 'center' });

            y += 20;
            y = this.addPatientInfo(doc, data, y);

            // Exams List
            doc.setFontSize(12);
            doc.setTextColor(15, 118, 110);
            doc.setFont('helvetica', 'bold');
            doc.text('EXAMES SOLICITADOS', 14, y);
            y += 10;

            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.setFont('helvetica', 'normal');

            data.exams.forEach(exam => {
                // Check page break
                if (y > 240) {
                    doc.addPage();
                    this.addHeader(doc);
                    y = 40;
                }

                doc.circle(16, y - 1, 1, 'F');
                doc.text(exam, 20, y);
                y += 7;
            });

            y += 10;

            if (data.clinicalHistory) {
                if (y > 230) {
                    doc.addPage();
                    this.addHeader(doc);
                    y = 40;
                }

                doc.setFontSize(12);
                doc.setTextColor(15, 118, 110);
                doc.setFont('helvetica', 'bold');
                doc.text('RESUMO CLÍNICO / SUSPEITA', 14, y);
                y += 7;

                doc.setFontSize(10);
                doc.setTextColor(0);
                doc.setFont('helvetica', 'normal');

                const splitText = doc.splitTextToSize(data.clinicalHistory, 180);
                doc.text(splitText, 14, y);
            }

            this.addSignature(doc, data.doctorName, data.doctorCrm, data.doctorEmail, data.doctorPhone);
            this.addFooter(doc);

            window.open(doc.output('bloburl'), '_blank');
        } finally {
            this.loadingService.hide();
        }
    }

    async generateConsultationSummary(data: {
        doctorName: string;
        doctorCrm: string;
        doctorEmail?: string;
        doctorPhone?: string;
        date: string;
        petName: string;
        species?: string;
        breed?: string;
        age?: string;
        weight?: string;
        ownerName: string;
        ownerPhone?: string;
        ownerEmail?: string;
        reason?: string;
        anamnesis?: string;
        physicalExam?: string;
        diagnosis?: string;
        treatment?: string;
        notes?: string;
    }) {
        this.loadingService.show('Gerando Resumo de Consulta...');
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const doc = new jsPDF();

            this.addHeader(doc);

            let y = 45;
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0);
            doc.text('RESUMO DE CONSULTA CLÍNICA', doc.internal.pageSize.width / 2, y, { align: 'center' });

            y += 20;
            y = this.addPatientInfo(doc, data, y);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`Data da Consulta: ${data.date}`, 14, y);
            y += 10;

            const sections = [
                { title: 'MOTIVO DA CONSULTA', text: data.reason },
                { title: 'ANAMNESE', text: data.anamnesis },
                { title: 'EXAME FÍSICO', text: data.physicalExam },
                { title: 'DIAGNÓSTICO', text: data.diagnosis },
                { title: 'TRATAMENTO / CONDUTA', text: data.treatment },
                { title: 'OBSERVAÇÕES ADICIONAIS', text: data.notes }
            ];

            sections.forEach(sec => {
                if (sec.text) {
                    // Check if we need new page
                    if (y > 250) {
                        doc.addPage();
                        this.addHeader(doc);
                        y = 40;
                    }

                    doc.setFontSize(11);
                    doc.setTextColor(15, 118, 110);
                    doc.setFont('helvetica', 'bold');
                    doc.text(sec.title, 14, y);
                    y += 6;

                    doc.setFontSize(10);
                    doc.setTextColor(0);
                    doc.setFont('helvetica', 'normal');

                    const splitText = doc.splitTextToSize(sec.text, 180);
                    const textHeight = doc.getTextDimensions(splitText).h;

                    doc.text(splitText, 14, y);
                    y += textHeight + 8;
                }
            });

            this.addSignature(doc, data.doctorName, data.doctorCrm, data.doctorEmail, data.doctorPhone);
            this.addFooter(doc);

            // Open in new tab (desktop) or download (mobile logic can be added)
            window.open(doc.output('bloburl'), '_blank');
        } finally {
            this.loadingService.hide();
        }
    }
}

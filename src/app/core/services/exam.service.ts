import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

export interface Exam {
    id: number;
    appointment_id: number;
    exam_types: string;
    observations?: string;
    created_at: string;
}

export interface ExamCreate {
    appointment_id: number;
    exam_types: string;
    observations?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ExamService {
    private supabase = inject(SupabaseService);

    createExam(data: ExamCreate): Observable<Exam> {
        return from(
            this.supabase.from('exams')
                .insert(data)
                .select()
                .single()
        ).pipe(
            map((response: any) => {
                // response: { data, error }
                if (response.error) throw response.error;
                return response.data as Exam;
            })
        );
    }

    getExam(id: number): Observable<Exam> {
        return from(
            this.supabase.from('exams')
                .select('*')
                .eq('id', id)
                .single()
        ).pipe(
            map((response: any) => {
                if (response.error) throw response.error;
                return response.data as Exam;
            })
        );
    }

    // Deprecated? Client-side PDF generation is now preferred.
    // Keeping for interface compatibility but warning: this won't work without backend endpoint.
    // Ideally update components to NOT call this.
    downloadPdf(id: number): Observable<Blob> {
        // Since we moved to frontend generation, this service method should ideally simply return 
        // a generated Blob locally or be removed.
        // For now, let's throw an error to force usage of PdfService.
        throw new Error('Use PdfService.generateExamRequest() instead of downloading from backend.');
    }

    getExams(appointmentId?: number, petId?: number): Observable<Exam[]> {
        let query = this.supabase.from('exams').select('*');

        if (appointmentId) {
            query = query.eq('appointment_id', appointmentId);
        }

        // Note: Filtering by petId requires a join if 'pet_id' isn't on exams directly.
        // Assuming current logic links via appointment.
        if (petId) {
            // Supabase filter on foreign table relation
            // exams -> appointments -> pet_id
            // Syntax: !inner creates an inner join which filters parent rows
            query = query.select('*, appointments!inner(pet_id)').eq('appointments.pet_id', petId);
        }

        return from(query).pipe(
            map((response: any) => {
                if (response.error) throw response.error;
                return response.data as Exam[];
            })
        );
    }

    deleteExam(id: number): Observable<void> {
        return from(
            this.supabase.from('exams')
                .delete()
                .eq('id', id)
        ).pipe(
            map((response: any) => {
                if (response.error) throw response.error;
                return;
            })
        );
    }
}

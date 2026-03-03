import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentStatus } from '../../core/models/business.models';

@Pipe({
    name: 'appointmentStatus',
    standalone: true
})
export class AppointmentStatusPipe implements PipeTransform {
    transform(value: string | AppointmentStatus): string {
        switch (value) {
            case AppointmentStatus.SCHEDULED: return 'Agendado';
            case AppointmentStatus.COMPLETED: return 'Realizado';
            case AppointmentStatus.CANCELLED: return 'Cancelado';
            default: return value;
        }
    }
}

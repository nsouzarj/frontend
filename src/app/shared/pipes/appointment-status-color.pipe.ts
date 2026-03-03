import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentStatus } from '../../core/models/business.models';

@Pipe({
    name: 'appointmentStatusColor',
    standalone: true
})
export class AppointmentStatusColorPipe implements PipeTransform {
    transform(value: string | AppointmentStatus): string {
        switch (value) {
            case AppointmentStatus.SCHEDULED: return 'bg-yellow-200 text-yellow-900';
            case AppointmentStatus.COMPLETED: return 'bg-green-200 text-green-900';
            case AppointmentStatus.CANCELLED: return 'bg-red-200 text-red-900';
            default: return 'bg-gray-200 text-gray-900';
        }
    }
}

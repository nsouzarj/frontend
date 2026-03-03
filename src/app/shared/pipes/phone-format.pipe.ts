import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phoneFormat',
    standalone: true
})
export class PhoneFormatPipe implements PipeTransform {

    transform(value: string | undefined | null): string {
        if (!value) return '';

        // Remove non-digit characters
        const cleanValue = value.replace(/\D/g, '');

        // Check length
        if (cleanValue.length === 11) {
            // (99)-99999-9999
            return `(${cleanValue.substring(0, 2)})-${cleanValue.substring(2, 7)}-${cleanValue.substring(7)}`;
        } else if (cleanValue.length === 10) {
            // (99)-9999-9999
            return `(${cleanValue.substring(0, 2)})-${cleanValue.substring(2, 6)}-${cleanValue.substring(6)}`;
        }

        // Return original if doesn't match standard lengths
        return value;
    }
}

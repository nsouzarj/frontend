import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[appPhoneMask]',
    standalone: true
})
export class PhoneMaskDirective {

    constructor(private el: ElementRef, private control: NgControl) { }

    @HostListener('input', ['$event'])
    onInputChange(event: any) {
        let value = this.el.nativeElement.value.replace(/\D/g, '');

        // Limits (11 digits for mobile with DDD)
        if (value.length > 11) value = value.substring(0, 11);

        // Format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
        let formatted = '';

        if (value.length > 0) {
            formatted = '(' + value.substring(0, 2);
        }
        if (value.length > 2) {
            formatted += ') ' + value.substring(2, 7);
        }
        if (value.length > 7) {
            // Logic to handle 8 vs 9 digits
            // If 11 digits (mobile): (XX) XXXXX-XXXX
            // If 10 digits (landline): (XX) XXXX-XXXX

            // While typing, we usually just push characters. 
            // Let's standard format as we go.

            if (value.length === 11) {
                // (XX) XXXXX-XXXX
                formatted = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
            } else {
                // (XX) XXXXX-...
                if (value.length > 6) {
                    formatted = '(' + value.substring(0, 2) + ') ' + value.substring(2, 6) + '-' + value.substring(6, 10);
                    if (value.length > 10) {
                        // Adjust for 9 digits dynamically if user types more
                        formatted = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
                    }
                }
            }
        }

        // Simple iterative formatting for better UX while typing
        formatted = value;
        if (value.length > 0) {
            formatted = value.replace(/^(\d{0,2})/, '($1');
        }
        if (value.length > 2) {
            formatted = formatted.replace(/^(\(\d{2})(\d{0,5})/, '$1) $2');
        }
        if (value.length > 7) {
            // Mobile: (99) 99999-9999 (11 chars)
            // Landline: (99) 9999-9999 (10 chars)

            if (value.length <= 10) {
                formatted = formatted.replace(/^(\(\d{2}\) \d{4})(\d{0,4})/, '$1-$2');
            } else {
                // Re-format for 11 digits
                let ddd = value.substring(0, 2);
                let firstPart = value.substring(2, 7);
                let secondPart = value.substring(7, 11);
                formatted = `(${ddd}) ${firstPart}-${secondPart}`;
            }
        }


        this.control.control?.setValue(formatted, { emitEvent: false });
        this.el.nativeElement.value = formatted;
    }
}

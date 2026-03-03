import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[appDateMask]',
    standalone: true
})
export class DateMaskDirective {

    constructor(private el: ElementRef, private control: NgControl) { }

    @HostListener('input', ['$event'])
    onInputChange(event: any) {
        let value = this.el.nativeElement.value.replace(/\D/g, '');

        // Limits
        if (value.length > 12) value = value.substring(0, 12); // 8 digits (date) + 4 digits (time) = 12 nums

        // Format: MM/DD/YYYY HH:MM
        // Chars:  2  5    10  13

        let formatted = '';

        if (value.length > 0) {
            formatted = value.substring(0, 2);
        }
        if (value.length > 2) {
            formatted += '/' + value.substring(2, 4);
        }
        if (value.length > 4) {
            formatted += '/' + value.substring(4, 8);
        }
        if (value.length > 8) {
            formatted += ' ' + value.substring(8, 10);
        }
        if (value.length > 10) {
            formatted += ':' + value.substring(10, 12);
        }

        this.control.control?.setValue(formatted, { emitEvent: false });
        this.el.nativeElement.value = formatted;
    }
}

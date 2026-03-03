import { Directive, HostListener, ElementRef, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[appCurrencyMask]',
    standalone: true
})
export class CurrencyMaskDirective implements OnInit {

    constructor(private el: ElementRef, private control: NgControl) { }

    ngOnInit() {
        // Format initial value if exists
        if (this.control.value !== null && this.control.value !== undefined) {
            this.format(this.control.value);
        }

        // Subscribe to programmatic changes
        this.control.valueChanges?.subscribe(value => {
            // Only format if the value is a number (programmatic update)
            // If it's a string, it might be our own input event (though we suppress it)
            if (typeof value === 'number') {
                this.format(value);
            }
        });
    }

    @HostListener('input', ['$event'])
    onInputChange(event: any) {
        let value = this.el.nativeElement.value;

        // Remove non-digits
        value = value.replace(/\D/g, '');

        // If empty, set null
        if (value.length === 0) {
            this.control.control?.setValue(null, { emitEvent: false });
            this.el.nativeElement.value = '';
            return;
        }

        // Convert to decimal (last 2 digits are cents)
        const floatValue = parseFloat(value) / 100;

        // Update model with the actual number
        this.control.control?.setValue(floatValue, { emitEvent: false });

        // Format display immediately to give "shifting" effect
        // 1 -> 0,01
        // 12 -> 0,12
        // 123 -> 1,23
        this.format(floatValue);
    }

    @HostListener('blur')
    onBlur() {
        const value = this.control.value;
        this.format(value);
    }

    private format(value: number | null) {
        if (value === null || value === undefined) {
            this.el.nativeElement.value = '';
            return;
        }

        // BRL Format: 1.234,56
        const formatter = new Intl.NumberFormat('pt-BR', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        this.el.nativeElement.value = formatter.format(value);
    }
}

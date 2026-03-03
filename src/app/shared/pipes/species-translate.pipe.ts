import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'speciesTranslate',
    standalone: true
})
export class SpeciesTranslatePipe implements PipeTransform {

    transform(value: string | undefined | null): string {
        if (!value) return '';

        switch (value.toLowerCase()) {
            case 'dog': return 'Cachorro';
            case 'cat': return 'Gato';
            case 'bird': return 'Pássaro';
            case 'other': return 'Outro';
            default: return value;
        }
    }

}

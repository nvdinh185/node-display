import {Pipe, PipeTransform} from '@angular/core';
/*
 * Converts to string
*/
@Pipe({ name: 'strings' })
export class StringsConv implements PipeTransform {
    arr = [];
    transform(value: any, args: any): any {
        if (args === 'STATUS') {
            if (typeof value === 'undefined' || value === '0')
                return 'Chưa bảo dưỡng';
            else if (value === '1') {
                return 'Đang bảo dưỡng';
            }
        }
        
        if (args === 'JSON') {
            if(!value) return null;
            return JSON.parse(value);
        }

        if (args === 'DEFAULT') {
            // if(!value) return null;
            // this.arr = JSON.parse(value);
            return -1;
        }
    }
}
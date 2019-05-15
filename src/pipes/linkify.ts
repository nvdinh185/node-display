import { Pipe, PipeTransform } from '@angular/core';
/*
 * Converts linkify into html domain/http/ftp/email/phone
*/
@Pipe({ name: 'linkify' })
export class LinkifyPipe implements PipeTransform {
    transform(value: string, args: string[]): any {

        //URLs starting with http://, https://, or ftp://    
        value = value.replace(/(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim
            , "<a href='$1' target='_blank'>$1</a>");

        //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
        value = value.replace(/(^|[^\/])(www\.[\S]+(\b|$))/gim
            , "$1<a href='http://$2' target='_blank'>$2</a>");

        /* //domain xxx.yyy /(?:[\w-]+\.)+[\w-]+/
        value = value.replace(/(^|[^\/])([\w-]+\.[\S]+(\b|$))/gim
            , "$1<a href='http://$2' target='_blank'>$2</a>");
 */
        //Change email addresses to mailto:: links.
        value = value.replace(/(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim
            , "<a href='mailto:$1'>$1</a>");

        return value;

    }
}
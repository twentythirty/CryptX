import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  /**
   *
   * @param items
   * @param searchText search text string
   * @param objectKey Object property if you have complex data structure and need your text to search in some object property
   */
  transform(items: any[], searchText: string, objectKey: string): any[] {
    if(!items) return [];
    if(!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter( it => {
      if(objectKey) it = it[objectKey];
      return (it + '').toLowerCase().includes(searchText);
    });
  }
}

import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

//Custom Paginator to allow for internalization
@Injectable()
export class PaginatorIntlComponent extends MatPaginatorIntl {
  itemsPerPageLabel = $localize`Items per page:`;
  nextPageLabel = $localize`Next page`;
  previousPageLabel = $localize`Previous page`;
  firstPageLabel = $localize`First page`;
  lastPageLabel = $localize`Last page`;

  getRangeLabel=(page: number, pageSize: number, length: number) => {
    if(length === 0 || pageSize === 0){
      return $localize`0 of ${length}`
    }
  
    length = Math.max(length, 0);
    const startIndex = page*pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex+pageSize, length) : startIndex+pageSize;
    
    return $localize`${startIndex+1} - ${endIndex} of ${length}`;
  };
}
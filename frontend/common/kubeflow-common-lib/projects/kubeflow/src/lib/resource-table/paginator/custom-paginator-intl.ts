import { MatPaginatorIntl } from '@angular/material/paginator';

const getRangeLabel = (page: number, pageSize: number, length: number) => {
  if (length === 0) {
    return $localize`Page 1 of 1`;
  }
  const amountPages = Math.ceil(length / pageSize);
  return $localize`Page ${page + 1} of ${amountPages}`;
};

export function getCustomPaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.firstPageLabel = $localize`First page`;
  paginatorIntl.lastPageLabel = $localize`Last page`;
  paginatorIntl.previousPageLabel = $localize`Previous page`;
  paginatorIntl.nextPageLabel = $localize`Next page`;
  paginatorIntl.itemsPerPageLabel = $localize`Items per page:`;
  paginatorIntl.getRangeLabel = getRangeLabel;

  return paginatorIntl;
}

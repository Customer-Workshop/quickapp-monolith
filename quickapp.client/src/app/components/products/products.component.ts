// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { fadeInOut } from '../../services/animations';
import { AlertService, MessageSeverity } from '../../services/alert.service';
import { ProductService } from '../../services/product.service';
import { Utilities } from '../../services/utilities';
import { Product } from '../../models/product.model';
import { SearchBoxComponent } from '../controls/search-box.component';

type SortableColumn = 'name' | 'productCategoryName' | 'sellingPrice' | 'unitsInStock';

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrl: './products.component.scss',
    animations: [fadeInOut],
    imports: [CurrencyPipe, SearchBoxComponent, TranslateModule]
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private alertService = inject(AlertService);

  rows: Product[] = [];
  rowsCache: Product[] = [];
  loadingIndicator = false;
  sortColumn: SortableColumn = 'name';
  sortAscending = true;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loadingIndicator = true;

    this.productService.getProducts().subscribe({
      next: products => {
        this.loadingIndicator = false;
        this.rowsCache = [...products];
        this.rows = this.sortRows([...products]);
      },
      error: error => {
        this.loadingIndicator = false;
        this.alertService.showStickyMessage('Load Error',
          `Unable to retrieve products from the server.\r\nError: "${Utilities.getHttpResponseMessage(error)}"`,
          MessageSeverity.error, error);
      }
    });
  }

  onSearchChanged(value: string) {
    this.rows = this.sortRows(this.rowsCache.filter(r =>
      Utilities.searchArray(value, false, r.name, r.productCategoryName)));
  }

  sortBy(column: SortableColumn) {
    if (this.sortColumn === column) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortColumn = column;
      this.sortAscending = true;
    }

    this.rows = this.sortRows(this.rows);
  }

  private sortRows(rows: Product[]) {
    const direction = this.sortAscending ? 1 : -1;
    const column = this.sortColumn;

    return [...rows].sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB) * direction;
      }

      return ((valueA as number) - (valueB as number)) * direction;
    });
  }
}

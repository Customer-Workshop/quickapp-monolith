// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AlertService, MessageSeverity } from '../../services/alert.service';
import { fadeInOut } from '../../services/animations';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrl: './products.component.scss',
    animations: [fadeInOut],
    imports: [CurrencyPipe, FormsModule, NgClass, TranslateModule]
})
export class ProductsComponent implements OnInit {
  private alertService = inject(AlertService);
  private productService = inject(ProductService);

  rows: Product[] = [];
  rowsCache: Product[] = [];
  searchTerm = '';
  loadingIndicator = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadingIndicator = true;

    this.productService.getProductsEndpoint().subscribe({
      next: products => {
        this.rowsCache = [...products];
        this.rows = products;
        this.loadingIndicator = false;
      },
      error: error => {
        this.loadingIndicator = false;
        this.alertService.showStickyMessage(
          'Load Error',
          'Unable to retrieve products from the server.',
          MessageSeverity.error,
          error
        );
      }
    });
  }

  onSearchChanged() {
    const searchTerm = this.searchTerm.trim().toLowerCase();
    this.rows = searchTerm
      ? this.rowsCache.filter(product => product.name.toLowerCase().includes(searchTerm))
      : this.rowsCache;
  }
}

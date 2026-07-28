// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { fadeInOut } from '../../services/animations';
import { AlertService, MessageSeverity } from '../../services/alert.service';
import { AppTranslationService } from '../../services/app-translation.service';
import { ProductService } from '../../services/product.service';
import { Utilities } from '../../services/utilities';
import { Product } from '../../models/product.model';
import { SearchBoxComponent } from '../controls/search-box.component';

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrl: './products.component.scss',
    animations: [fadeInOut],
    imports: [SearchBoxComponent, DecimalPipe, TranslateModule]
})
export class ProductsComponent implements OnInit {
  private alertService = inject(AlertService);
  private translationService = inject(AppTranslationService);
  private productService = inject(ProductService);

  products: Product[] = [];
  productsCache: Product[] = [];
  loadingIndicator = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.alertService.startLoadingMessage();
    this.loadingIndicator = true;

    this.productService.getProducts()
      .subscribe({
        next: products => {
          this.alertService.stopLoadingMessage();
          this.loadingIndicator = false;

          this.productsCache = [...products];
          this.products = products;
        },
        error: error => {
          this.alertService.stopLoadingMessage();
          this.loadingIndicator = false;

          const gT = (key: string, params?: object) => this.translationService.getTranslation(key, params);

          this.alertService.showStickyMessage(gT('products.alerts.LoadError'),
            gT('products.alerts.RetrieveProductsFailed', { error: Utilities.getHttpResponseMessage(error) }),
            MessageSeverity.error, error);
        }
      });
  }

  onSearchChanged(value: string) {
    this.products = this.productsCache.filter(p => Utilities.searchArray(value, false,
      p.name, p.productCategoryName, p.buyingPrice, p.sellingPrice, p.unitsInStock));
  }
}

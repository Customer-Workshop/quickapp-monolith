// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductEndpoint } from './product-endpoint.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productEndpoint = inject(ProductEndpoint);

  getProducts(): Observable<Product[]> {
    return this.productEndpoint.getProductsEndpoint<Product[]>();
  }
}

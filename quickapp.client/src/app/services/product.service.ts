// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EndpointBase } from './endpoint-base.service';
import { ConfigurationService } from './configuration.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends EndpointBase {
  private http = inject(HttpClient);
  private configurations = inject(ConfigurationService);

  get productsUrl() { return this.configurations.baseUrl + '/api/product'; }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl, this.requestHeaders).pipe(
      catchError(error => {
        return this.handleError(error, () => this.getProducts());
      }));
  }
}

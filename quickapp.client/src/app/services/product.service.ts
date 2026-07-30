import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Product } from '../models/product.model';
import { ConfigurationService } from './configuration.service';
import { EndpointBase } from './endpoint-base.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends EndpointBase {
  private http = inject(HttpClient);
  private configurations = inject(ConfigurationService);

  get productsUrl() { return this.configurations.baseUrl + '/api/product'; }

  getProductsEndpoint(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl, this.requestHeaders).pipe(
      catchError(error => this.handleError(error, () => this.getProductsEndpoint()))
    );
  }
}

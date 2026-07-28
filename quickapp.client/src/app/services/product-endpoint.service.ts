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

@Injectable({
  providedIn: 'root'
})
export class ProductEndpoint extends EndpointBase {
  private http = inject(HttpClient);
  private configurations = inject(ConfigurationService);

  get productsUrl() { return this.configurations.baseUrl + '/api/product'; }

  getProductsEndpoint<T>(): Observable<T> {
    return this.http.get<T>(this.productsUrl, this.requestHeaders).pipe(
      catchError(error => {
        return this.handleError(error, () => this.getProductsEndpoint<T>());
      }));
  }
}

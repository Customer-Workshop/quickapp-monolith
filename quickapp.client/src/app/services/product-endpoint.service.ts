// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EndpointBase } from './endpoint-base.service';
import { ConfigurationService } from './configuration.service';
import { Product } from '../models/product.model';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'BMW M6',
    description: 'Luxury grand tourer with a 4.4L twin-turbo V8 engine',
    icon: null,
    buyingPrice: 109000,
    sellingPrice: 119000,
    unitsInStock: 12,
    isActive: true,
    isDiscontinued: false,
    productCategoryName: 'Cars'
  },
  {
    id: 2,
    name: 'Nissan Patrol',
    description: 'Full-size SUV built for rugged terrain and comfort',
    icon: null,
    buyingPrice: 56000,
    sellingPrice: 62500,
    unitsInStock: 2,
    isActive: true,
    isDiscontinued: false,
    productCategoryName: 'Cars'
  },
  {
    id: 3,
    name: 'Yamaha YZF-R1',
    description: 'High-performance supersport motorcycle',
    icon: null,
    buyingPrice: 15400,
    sellingPrice: 17999,
    unitsInStock: 8,
    isActive: true,
    isDiscontinued: false,
    productCategoryName: 'Motorcycles'
  },
  {
    id: 4,
    name: 'Caterpillar 320 Excavator',
    description: 'Medium hydraulic excavator for construction sites',
    icon: null,
    buyingPrice: 210000,
    sellingPrice: 235000,
    unitsInStock: 3,
    isActive: true,
    isDiscontinued: false,
    productCategoryName: 'Heavy Machinery'
  },
  {
    id: 5,
    name: 'Ford Model T',
    description: 'Classic vintage automobile, collector edition',
    icon: null,
    buyingPrice: 18000,
    sellingPrice: 24500,
    unitsInStock: 0,
    isActive: false,
    isDiscontinued: true,
    productCategoryName: 'Classic Cars'
  },
  {
    id: 6,
    name: 'Tesla Model S',
    description: 'All-electric luxury sedan with autopilot',
    icon: null,
    buyingPrice: 74000,
    sellingPrice: 82990,
    unitsInStock: 15,
    isActive: true,
    isDiscontinued: false,
    productCategoryName: 'Electric Vehicles'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ProductEndpoint extends EndpointBase {
  private http = inject(HttpClient);
  private configurations = inject(ConfigurationService);

  // TODO(DJ-63): remove mock once backend /api/product lands
  private readonly useMockData = true;

  get productsUrl() { return this.configurations.baseUrl + '/api/product'; }

  getProductsEndpoint<T>(): Observable<T> {
    // TODO(DJ-63): remove mock once backend /api/product lands
    if (this.useMockData) {
      return of(MOCK_PRODUCTS as T);
    }

    return this.http.get<T>(this.productsUrl, this.requestHeaders).pipe(
      catchError(error => {
        return this.handleError(error, () => this.getProductsEndpoint<T>());
      }));
  }
}

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

// TODO(DJ-63): remove mock once GET /api/product is live
const mockProducts: Product[] = [
  {
    id: 1, name: 'Ergonomic Office Chair', description: 'Adjustable mesh-back office chair with lumbar support', icon: null,
    buyingPrice: 120, sellingPrice: 249.99, unitsInStock: 42, isActive: true, isDiscontinued: false, productCategoryName: 'Furniture'
  },
  {
    id: 2, name: 'Mechanical Keyboard', description: 'Compact 87-key mechanical keyboard with backlight', icon: null,
    buyingPrice: 45.5, sellingPrice: 89.99, unitsInStock: 130, isActive: true, isDiscontinued: false, productCategoryName: 'Accessories'
  },
  {
    id: 3, name: '27" 4K Monitor', description: 'IPS panel monitor with USB-C hub', icon: null,
    buyingPrice: 210, sellingPrice: 379, unitsInStock: 18, isActive: true, isDiscontinued: false, productCategoryName: 'Displays'
  },
  {
    id: 4, name: 'Wireless Mouse', description: 'Silent-click wireless mouse with rechargeable battery', icon: null,
    buyingPrice: 12, sellingPrice: 29.95, unitsInStock: 0, isActive: false, isDiscontinued: false, productCategoryName: 'Accessories'
  },
  {
    id: 5, name: 'Laser Printer LP-200', description: 'Monochrome laser printer, 30 ppm', icon: null,
    buyingPrice: 95, sellingPrice: 179.5, unitsInStock: 7, isActive: false, isDiscontinued: true, productCategoryName: 'Printers'
  },
  {
    id: 6, name: 'USB-C Docking Station', description: 'Dual display docking station with 100W power delivery', icon: null,
    buyingPrice: 78.25, sellingPrice: 149, unitsInStock: 25, isActive: true, isDiscontinued: false, productCategoryName: 'Accessories'
  },
  {
    id: 7, name: 'Standing Desk', description: 'Electric height-adjustable standing desk', icon: null,
    buyingPrice: 330, sellingPrice: 599, unitsInStock: 5, isActive: true, isDiscontinued: false, productCategoryName: 'Furniture'
  },
  {
    id: 8, name: 'Noise Cancelling Headset', description: 'Over-ear headset with active noise cancellation', icon: null,
    buyingPrice: 88, sellingPrice: 169.99, unitsInStock: 61, isActive: true, isDiscontinued: false, productCategoryName: 'Audio'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ProductService extends EndpointBase {
  private http = inject(HttpClient);
  private configurations = inject(ConfigurationService);

  // TODO(DJ-63): remove mock once GET /api/product is live
  private readonly useMockData = true;

  get productsUrl() { return this.configurations.baseUrl + '/api/product'; }

  getProducts(): Observable<Product[]> {
    // TODO(DJ-63): remove mock once GET /api/product is live
    if (this.useMockData) {
      return of(mockProducts);
    }

    return this.http.get<Product[]>(this.productsUrl, this.requestHeaders).pipe(
      catchError(error => {
        return this.handleError(error, () => this.getProducts());
      }));
  }
}

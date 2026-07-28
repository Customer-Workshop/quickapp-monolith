// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

export interface Product {
  id: number;
  name: string | null;
  description: string | null;
  icon: string | null;
  buyingPrice: number;
  sellingPrice: number;
  unitsInStock: number;
  isActive: boolean;
  isDiscontinued: boolean;
  productCategoryName: string | null;
}

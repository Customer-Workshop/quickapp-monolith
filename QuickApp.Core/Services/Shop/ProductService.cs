// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

using Microsoft.EntityFrameworkCore;
using QuickApp.Core.Infrastructure;
using QuickApp.Core.Models.Shop;

namespace QuickApp.Core.Services.Shop
{
    public class ProductService(ApplicationDbContext dbContext) : IProductService
    {
        public IEnumerable<Product> GetAllProductsData() => dbContext.Products
                .Include(p => p.ProductCategory)
                .OrderBy(p => p.Name)
                .ToList();
    }
}

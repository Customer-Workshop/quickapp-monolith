// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

using QuickApp.Core.Models.Shop;

namespace QuickApp.Core.Services.Shop
{
    public interface IProductService
    {
        Task<IEnumerable<Product>> GetAllProductsDataAsync();
    }
}

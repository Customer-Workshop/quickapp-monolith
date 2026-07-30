// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickApp.Core.Services.Shop;
using QuickApp.Server.ViewModels.Shop;

namespace QuickApp.Server.Controllers
{
    [Authorize]
    public class ProductController : BaseApiController
    {
        private readonly IProductService _productService;

        public ProductController(ILogger<ProductController> logger, IMapper mapper,
            IProductService productService) : base(logger, mapper)
        {
            _productService = productService;
        }

        [HttpGet]
        [ProducesResponseType(200, Type = typeof(IEnumerable<ProductVM>))]
        public async Task<IActionResult> Get()
        {
            var allProducts = await _productService.GetAllProductsDataAsync();
            return Ok(_mapper.Map<IEnumerable<ProductVM>>(allProducts));
        }
    }
}

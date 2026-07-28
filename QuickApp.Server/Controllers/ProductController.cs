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
    [Route("api/[controller]")]
    public class ProductController : BaseApiController
    {
        private readonly IProductService _productService;

        public ProductController(ILogger<BaseApiController> logger, IMapper mapper,
            IProductService productService) : base(logger, mapper)
        {
            _productService = productService;
        }

        [HttpGet]
        [Authorize]
        [ProducesResponseType(200, Type = typeof(IEnumerable<ProductVM>))]
        public IActionResult Get()
        {
            return Ok(_mapper.Map<IEnumerable<ProductVM>>(_productService.GetAllProductsData()));
        }
    }
}

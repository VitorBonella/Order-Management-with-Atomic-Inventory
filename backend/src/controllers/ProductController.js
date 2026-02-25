const ProductService = require('../services/ProductService');

class ProductController {
  async index(req, res) {
    try {
      const products = await ProductService.listProducts();
      return res.json(products);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar produtos.' });
    }
  }

  async listInputs(req, res) {
    try {
      const inputs = await ProductService.listInputs();
      return res.json(inputs);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar insumos.' });
    }
  }
}

module.exports = new ProductController();

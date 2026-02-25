const { Product, Input, ProductInput } = require('../models');

class ProductService {
  async listProducts() {
    return Product.findAll({
      include: [
        {
          model: Input,
          as: 'inputs',
          through: { attributes: ['quantity_used'] },
        },
      ],
    });
  }

  async listInputs() {
    return Input.findAll({ order: [['name', 'ASC']] });
  }
}

module.exports = new ProductService();

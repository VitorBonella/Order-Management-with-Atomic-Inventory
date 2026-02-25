const OrderService = require('../services/OrderService');

class OrderController {
  async create(req, res) {
    try {
      const { items, table_number } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'items deve ser um array com ao menos um produto.' });
      }

      for (const item of items) {
        if (!item.product_id || !item.quantity || item.quantity < 1) {
          return res.status(400).json({ error: 'Cada item deve ter product_id e quantity válidos.' });
        }
      }

      const result = await OrderService.createOrder({ items, table_number });

      if (!result.success) {
        return res.status(422).json(result);
      }

      return res.status(201).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      console.error(err);
      return res.status(500).json({ error: 'Erro interno ao processar pedido.' });
    }
  }

  async index(req, res) {
    try {
      const orders = await OrderService.listOrders();
      return res.json(orders);
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao listar pedidos.' });
    }
  }
}

module.exports = new OrderController();

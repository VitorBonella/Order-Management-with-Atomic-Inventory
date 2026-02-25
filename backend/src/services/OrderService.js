const sequelize = require('../database/connection');
const { Product, Input, ProductInput, Order, OrderItem } = require('../models');

class OrderService {
  async createOrder({ items, table_number }) {
    // items: [{ product_id, quantity }]
    const transaction = await sequelize.transaction();
    try {
      // 1. Load all products with their inputs (ficha técnica)
      const productIds = items.map(i => i.product_id);
      const products = await Product.findAll({
        where: { id: productIds },
        include: [
          {
            model: ProductInput,
            as: 'productInputs',
            include: [{ model: Input, as: 'Input' }],
          },
        ],
        transaction,
      });

      if (products.length !== productIds.length) {
        throw { status: 404, message: 'Um ou mais produtos não foram encontrados.' };
      }

      // 2. Calculate total ingredient consumption
      const inputConsumption = {}; // { input_id: { quantity_needed, name } }

      for (const item of items) {
        const product = products.find(p => p.id === item.product_id);
        for (const pi of product.productInputs) {
          const inputId = pi.input_id;
          if (!inputConsumption[inputId]) {
            inputConsumption[inputId] = {
              quantity_needed: 0,
              name: pi.Input.name,
              input: pi.Input,
            };
          }
          inputConsumption[inputId].quantity_needed += parseFloat(pi.quantity_used) * item.quantity;
        }
      }

      // 3. Lock input rows for update and validate stock
      const stockErrors = [];
      for (const [inputId, { quantity_needed, name, input }] of Object.entries(inputConsumption)) {
        const lockedInput = await Input.findOne({
          where: { id: inputId },
          lock: transaction.LOCK.UPDATE,
          transaction,
        });

        if (parseFloat(lockedInput.stock_quantity) < quantity_needed) {
          stockErrors.push({
            input_id: parseInt(inputId),
            input_name: name,
            available: parseFloat(lockedInput.stock_quantity),
            needed: quantity_needed,
          });
        }
      }

      if (stockErrors.length > 0) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Estoque insuficiente para um ou mais ingredientes.',
          stock_errors: stockErrors,
        };
      }

      // 4. Decrement stock atomically
      for (const [inputId, { quantity_needed }] of Object.entries(inputConsumption)) {
        await Input.decrement('stock_quantity', {
          by: quantity_needed,
          where: { id: inputId },
          transaction,
        });
      }

      // 5. Create order
      const total = items.reduce((acc, item) => {
        const product = products.find(p => p.id === item.product_id);
        return acc + parseFloat(product.price) * item.quantity;
      }, 0);

      const order = await Order.create(
        { status: 'confirmed', total, table_number },
        { transaction }
      );

      // 6. Create order items
      const orderItemsData = items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: product.price,
        };
      });

      await OrderItem.bulkCreate(orderItemsData, { transaction });

      await transaction.commit();

      return {
        success: true,
        order: {
          id: order.id,
          status: order.status,
          total,
          table_number,
          items: items.map(item => ({
            product: products.find(p => p.id === item.product_id),
            quantity: item.quantity,
          })),
        },
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async listOrders() {
    return Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }
}

module.exports = new OrderService();

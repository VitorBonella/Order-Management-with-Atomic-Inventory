const Product = require('./Product');
const Input = require('./Input');
const ProductInput = require('./ProductInput');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Product <-> Input (N:N via ProductInput)
Product.belongsToMany(Input, { through: ProductInput, foreignKey: 'product_id', as: 'inputs' });
Input.belongsToMany(Product, { through: ProductInput, foreignKey: 'input_id', as: 'products' });

ProductInput.belongsTo(Product, { foreignKey: 'product_id' });
ProductInput.belongsTo(Input, { foreignKey: 'input_id' });
Product.hasMany(ProductInput, { foreignKey: 'product_id', as: 'productInputs' });
Input.hasMany(ProductInput, { foreignKey: 'input_id' });

// Order <-> Product (N:N via OrderItem)
Order.belongsToMany(Product, { through: OrderItem, foreignKey: 'order_id', as: 'products' });
Product.belongsToMany(Order, { through: OrderItem, foreignKey: 'product_id', as: 'orders' });

OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

module.exports = { Product, Input, ProductInput, Order, OrderItem };

require('dotenv').config();
const sequelize = require('./connection');
const { Product, Input, ProductInput } = require('../models');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('database synced');

    // Create inputs
    const inputs = await Input.bulkCreate([
      { name: 'Pão de Hambúrguer', unit: 'un', stock_quantity: 20 },
      { name: 'Carne Bovina 150g', unit: 'un', stock_quantity: 15 },
      { name: 'Queijo Cheddar', unit: 'fatia', stock_quantity: 30 },
      { name: 'Alface', unit: 'folha', stock_quantity: 40 },
      { name: 'Tomate', unit: 'fatia', stock_quantity: 35 },
      { name: 'Bacon', unit: 'tira', stock_quantity: 25 },
      { name: 'Frango Grelhado 120g', unit: 'un', stock_quantity: 10 },
      { name: 'Batata 200g', unit: 'porção', stock_quantity: 50 },
      { name: 'Refrigerante 350ml', unit: 'lata', stock_quantity: 60 },
      { name: 'Maionese', unit: 'colher', stock_quantity: 100 },
      { name: 'Pão de Brioche', unit: 'un', stock_quantity: 8 },
    ]);
    console.log('inputs created');

    const [
      pao, carne, queijo, alface, tomate, bacon,
      frango, batata, refri, maionese, paoBrioche
    ] = inputs;

    // Create products
    const products = await Product.bulkCreate([
      { name: 'Terminal de Vila Velha', price: 24.90, description: 'Clássico com carne, queijo e salada', image_emoji: '🍔' },
      { name: 'Terminal de Laranjeiras', price: 29.90, description: 'Com bacon crocante e queijo duplo', image_emoji: '🥓' },
      { name: 'Terminal de Carapina', price: 26.90, description: 'Frango grelhado com maionese especial', image_emoji: '🐔' },
      { name: 'Terminal de Campo Grande', price: 34.90, description: 'Leva tudo: carne, frango, bacon e queijo', image_emoji: '🏆' },
      { name: 'Batata Frita', price: 14.90, description: 'Porção de batata crocante', image_emoji: '🍟' },
      { name: 'Refrigerante', price: 6.90, description: 'Lata gelada 350ml', image_emoji: '🥤' },
      { name: 'Combo Grande Vitória', price: 36.90, description: 'X-Burger + Batata + Refri', image_emoji: '🎁' },
    ]);
    console.log('products created');

    const [xBurger, xBacon, xFrango, xTudo, batataFrita, refrigerante, combo] = products;

    // Fichas técnicas
    await ProductInput.bulkCreate([
      // X-Burger
      { product_id: xBurger.id, input_id: pao.id, quantity_used: 1 },
      { product_id: xBurger.id, input_id: carne.id, quantity_used: 1 },
      { product_id: xBurger.id, input_id: queijo.id, quantity_used: 1 },
      { product_id: xBurger.id, input_id: alface.id, quantity_used: 2 },
      { product_id: xBurger.id, input_id: tomate.id, quantity_used: 2 },
      { product_id: xBurger.id, input_id: maionese.id, quantity_used: 1 },

      // X-Bacon
      { product_id: xBacon.id, input_id: pao.id, quantity_used: 1 },
      { product_id: xBacon.id, input_id: carne.id, quantity_used: 1 },
      { product_id: xBacon.id, input_id: queijo.id, quantity_used: 2 },
      { product_id: xBacon.id, input_id: bacon.id, quantity_used: 3 },
      { product_id: xBacon.id, input_id: maionese.id, quantity_used: 1 },

      // X-Frango
      { product_id: xFrango.id, input_id: paoBrioche.id, quantity_used: 1 },
      { product_id: xFrango.id, input_id: frango.id, quantity_used: 1 },
      { product_id: xFrango.id, input_id: alface.id, quantity_used: 2 },
      { product_id: xFrango.id, input_id: tomate.id, quantity_used: 1 },
      { product_id: xFrango.id, input_id: maionese.id, quantity_used: 2 },

      // X-Tudo
      { product_id: xTudo.id, input_id: paoBrioche.id, quantity_used: 1 },
      { product_id: xTudo.id, input_id: carne.id, quantity_used: 1 },
      { product_id: xTudo.id, input_id: frango.id, quantity_used: 1 },
      { product_id: xTudo.id, input_id: queijo.id, quantity_used: 2 },
      { product_id: xTudo.id, input_id: bacon.id, quantity_used: 2 },
      { product_id: xTudo.id, input_id: alface.id, quantity_used: 2 },
      { product_id: xTudo.id, input_id: tomate.id, quantity_used: 2 },
      { product_id: xTudo.id, input_id: maionese.id, quantity_used: 2 },

      // Batata Frita
      { product_id: batataFrita.id, input_id: batata.id, quantity_used: 1 },

      // Refrigerante
      { product_id: refrigerante.id, input_id: refri.id, quantity_used: 1 },

      // Combo X-Burger (X-Burger + Batata + Refri)
      { product_id: combo.id, input_id: pao.id, quantity_used: 1 },
      { product_id: combo.id, input_id: carne.id, quantity_used: 1 },
      { product_id: combo.id, input_id: queijo.id, quantity_used: 1 },
      { product_id: combo.id, input_id: alface.id, quantity_used: 2 },
      { product_id: combo.id, input_id: tomate.id, quantity_used: 2 },
      { product_id: combo.id, input_id: maionese.id, quantity_used: 1 },
      { product_id: combo.id, input_id: batata.id, quantity_used: 1 },
      { product_id: combo.id, input_id: refri.id, quantity_used: 1 },
    ]);
    console.log('fichas técnicas created');

    console.log('\nseed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('seed failed:', err);
    process.exit(1);
  }
}

seed();

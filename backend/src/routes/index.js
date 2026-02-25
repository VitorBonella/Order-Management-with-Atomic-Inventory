const { Router } = require('express');
const ProductController = require('../controllers/ProductController');
const OrderController = require('../controllers/OrderController');

const router = Router();

router.get('/products', ProductController.index.bind(ProductController));
router.get('/inputs', ProductController.listInputs.bind(ProductController));

router.post('/orders', OrderController.create.bind(OrderController));
router.get('/orders', OrderController.index.bind(OrderController));

module.exports = router;

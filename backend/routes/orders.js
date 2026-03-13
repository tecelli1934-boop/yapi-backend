const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');

const router = express.Router();

const { body } = require('express-validator');

// router.use(protect); // All routes require authentication - Handled in controller if needed

const orderValidation = [
  body('orderItems').isArray({ min: 1 }).withMessage('Sipariş sepeti boş olamaz'),
  body('orderItems.*.id').notEmpty().withMessage('Ürün ID geçersiz'),
  body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Ürün adedi en az 1 olmalıdır'),
  body('orderItems.*.price').isFloat({ min: 0 }).withMessage('Ürün fiyatı negatif olamaz'),
  body('shippingAddress').notEmpty().withMessage('Teslimat adresi zorunludur'),
  body('paymentMethod').isIn(['credit_card', 'bank_transfer']).withMessage('Geçersiz ödeme yöntemi'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Toplam tutar geçersiz')
];

router.route('/')
  .post(orderValidation, createOrder);

router.route('/myorders')
  .get(getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.patch('/:id/status', restrictTo('admin'), updateOrderStatus);
router.get('/', restrictTo('admin'), getAllOrders);

module.exports = router;
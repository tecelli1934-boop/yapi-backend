const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

const { body } = require('express-validator');
const { protect } = require('../controllers/authController');

const paymentValidation = [
  body('amount').isFloat({ min: 1 }).withMessage('Geçersiz ödeme tutarı'),
  body('cardHolder').trim().notEmpty().withMessage('Kart sahibi ismi zorunludur'),
  body('cardNumber').matches(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/).withMessage('Geçersiz kart numarası formatı'),
  body('orderId').notEmpty().withMessage('Sipariş ID gerekli')
];

// POST /api/payment/process
router.post('/process', protect, paymentValidation, paymentController.processPayment);

module.exports = router;

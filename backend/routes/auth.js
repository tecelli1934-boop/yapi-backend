const express = require('express');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// Validation middleware
const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('İsim 2-50 karakter arasında olmalıdır'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi girin'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir'),
  body('phone')
    .matches(/^(\+90|0)?\s*5\d{2}\s*\d{3}\s*\d{4}$/)
    .withMessage('Geçerli bir Türk telefon numarası girin')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi girin'),
  body('password')
    .notEmpty()
    .withMessage('Şifre alanı zorunludur')
];

const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi girin')
];

const validateResetPassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir')
];

const validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mevcut şifre alanı zorunludur'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Yeni şifre en az 6 karakter olmalıdır')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Yeni şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir')
];

const validateResendVerification = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi girin')
];

// Routes
router.post('/kayit', validateSignup, authController.signup);
router.post('/giris', validateLogin, authController.login);
router.post('/cikis', authController.logout);

// Email verification
router.get('/email-dogrula/:token', authController.verifyEmail);

// Resend email verification
router.post('/email-dogrula-yeniden-gonder', validateResendVerification, authController.resendEmailVerification);

// Forgot password
router.post('/sifremi-unuttum', validateForgotPassword, authController.forgotPassword);

// Reset password
router.patch('/sifre-sifirlama/:token', validateResetPassword, authController.resetPassword);

router.patch('/sifre-guncelle', authController.protect, validateUpdatePassword, authController.updatePassword);

// Save FCM token for notifications
router.post('/fcm-token', authController.protect, authController.updateFCMToken);

// Admin login (backward compatibility)
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const payload = { email, role: 'admin' };
    // Token süresini 7 gün yapalım
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: 'admin', message: 'Giriş başarılı' });
  } else {
    res.status(401).json({ message: 'E-posta veya şifre hatalı' });
  }
});

module.exports = router;
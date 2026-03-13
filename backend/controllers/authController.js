const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmailVerification, sendPasswordResetEmail, generateVerificationToken, generatePasswordResetToken } = require('../services/emailService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    data: {
      user
    }
  });
};

// Register
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // Email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Bu email adresi zaten kayıtlı', 400));
  }

  // Create user
  const newUser = await User.create({
    name,
    email,
    password,
    phone
  });

  // Generate email verification token
  const verificationToken = generateVerificationToken();
  newUser.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  newUser.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await newUser.save({ validateBeforeSave: false });

  // Send verification email
  try {
    // Email göndermeyi atla, doğrudan console'a bas
    console.log('📧 Gmail SMTP atlandı - Console linki kullanılıyor');
    console.log('🔗 Verification URL:', `${process.env.FRONTEND_URL}/email-dogrula/${verificationToken}`);
    console.log('📧 Email gönderilecek:', newUser.email);

    res.status(201).json({
      status: 'success',
      message: 'Kayıt başarılı! Lütfen email adresinizi doğrulayın.',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          emailVerified: false
        }
      }
    });
  } catch (err) {
    // If email fails, remove verification token
    newUser.emailVerificationToken = undefined;
    newUser.emailVerificationExpires = undefined;
    await newUser.save({ validateBeforeSave: false });
    
    return next(new AppError('Email gönderilemedi. Lütfen daha sonra tekrar deneyin.', 500));
  }
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Lütfen email ve şifrenizi girin', 400));
  }

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password +active');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email veya şifre hatalı', 401));
  }

  // Check if user is active
  if (!user.active) {
    return next(new AppError('Hesabınız deaktive edilmiş', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // If everything ok, send token to client
  createSendToken(user, 200, res, 'Giriş başarılı');
});

// Email Verification
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  // Hash token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user by token
  const user = await User.findByEmailVerificationToken(hashedToken);

  if (!user) {
    return next(new AppError('Geçersiz veya süresi dolmuş doğrulama linki', 400));
  }

  // Verify email
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Send welcome email
  try {
    await new Email(user, `${process.env.FRONTEND_URL}/giris`).sendWelcome();
  } catch (err) {
    console.log('Welcome email gönderilemedi:', err);
  }

  res.status(200).json({
    status: 'success',
    message: 'Email adresiniz başarıyla doğrulandı! Giriş yapabilirsiniz.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: true
      }
    }
  });
});

// Resend Verification Email
exports.resendVerificationEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Bu email adresi bulunamadı', 404));
  }

  if (user.emailVerified) {
    return next(new AppError('Email adresiniz zaten doğrulanmış', 400));
  }

  // Generate new verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    const verificationURL = `${process.env.FRONTEND_URL}/email-dogrula/${verificationToken}`;
    await new Email(user, verificationURL).sendEmailVerification();

    res.status(200).json({
      status: 'success',
      message: 'Doğrulama emaili yeniden gönderildi'
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email gönderilemedi. Lütfen daha sonra tekrar deneyin.', 500));
  }
});

// Forgot Password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Bu email adresi bulunamadı', 404));
  }

  // Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${process.env.FRONTEND_URL}/sifre-sifirla/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Şifre sıfırlama linki email adresinize gönderildi'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email gönderilemedi. Lütfen daha sonra tekrar deneyin.', 500));
  }
});

// Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user by token
  const user = await User.findByPasswordResetToken(hashedToken);

  if (!user) {
    return next(new AppError('Geçersiz veya süresi dolmuş token', 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Log the user in
  createSendToken(user, 200, res, 'Şifreniz başarıyla güncellendi');
});

// Update Password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // Check if current password is correct
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('Mevcut şifreniz hatalı', 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Log user in with new password
  createSendToken(user, 200, res, 'Şifreniz başarıyla güncellendi');
});

// Logout
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Çıkış yapıldı'
  });
};

// Protect middleware - Check if user is logged in
exports.protect = catchAsync(async (req, res, next) => {
  // Get token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Bu işlem için giriş yapmanız gerekiyor', 401));
  }

  // Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('Bu token\'a sahip kullanıcı artık mevcut değil', 401));
  }

  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Kullanıcı şifresi değiştiği için tekrar giriş yapın', 401));
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

// Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Bu işlem için yetkiniz yok', 403));
    }
    next();
  };
};

// Update FCM Token
exports.updateFCMToken = catchAsync(async (req, res, next) => {
  const { fcmToken } = req.body;

  if (!fcmToken) {
    return next(new AppError('FCM Token alanı zorunludur', 400));
  }

  // Add the token if it doesn't exist
  await User.findByIdAndUpdate(req.user.id, {
    $addToSet: { fcmTokens: fcmToken }
  });

  res.status(200).json({
    status: 'success',
    message: 'FCM Token başarıyla güncellendi'
  });
});

// Resend Email Verification
exports.resendEmailVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Bu email adresi bulunamadı', 404));
  }

  if (user.emailVerified) {
    return next(new AppError('Bu email adresi zaten doğrulanmış', 400));
  }

  // Generate new verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    await sendEmailVerification(user, verificationToken);

    res.status(200).json({
      status: 'success',
      message: 'Doğrulama emaili yeniden gönderildi!'
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    return next(new AppError('Email gönderilemedi. Lütfen daha sonra tekrar deneyin.', 500));
  }
});

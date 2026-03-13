const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = catchAsync(async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod
  } = req.body;

  // Check if order items exist
  if (!orderItems || orderItems.length === 0) {
    return next(new AppError('Siparişte ürün bulunamadı', 400));
  }

  // Get product details and check stock
  let itemsPrice = 0;
  const processedOrderItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.id);
    
    if (!product) {
      return next(new AppError(`${item.name} ürünü bulunamadı`, 404));
    }

    if (product.stock < item.quantity) {
      return next(new AppError(`${product.name} için yeterli stok yok. Mevcut stok: ${product.stock}`, 400));
    }

    // Update stock
    product.stock -= item.quantity;
    await product.save();

    const itemTotal = item.price * item.quantity;
    itemsPrice += itemTotal;

    processedOrderItems.push({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      totalPrice: itemTotal,
      variationText: item.variationText || '',
      variationKey: item.variationKey || ''
    });
  }

  // Calculate prices
  const shippingPrice = itemsPrice > 500 ? 0 : 29.99;
  const kdv = Math.round(itemsPrice * 0.18 * 100) / 100;
  const total = itemsPrice + shippingPrice + kdv;

  // Generate order ID
  const lastOrder = await Order.findOne().sort({ id: -1 });
  const orderId = lastOrder ? lastOrder.id + 1 : 1;

  // Create order
  // User info (formdan gelen verileri önceliklendir, yoksa req.user kullan)
  const customerName = req.body.customerName || (req.user ? req.user.name : 'Misafir Müşteri');
  const customerEmail = req.body.customerEmail || (req.user ? req.user.email : null);
  const customerPhone = req.body.customerPhone || (req.user ? req.user.phone : null);

  if (!customerEmail) {
    return res.status(400).json({ status: 'fail', message: 'E-posta adresi zorunludur' });
  }

  const order = await Order.create({
    id: orderId,
    customerName,
    customerEmail,
    customerPhone,
    address: `${shippingAddress.street}, ${shippingAddress.district}, ${shippingAddress.city} ${shippingAddress.zipCode}`,
    items: processedOrderItems,
    subtotal: itemsPrice,
    kdv: kdv,
    total: total,
    paymentMethod: paymentMethod || 'cash',
    status: 'pending'
  });

  // Send Notifications (Email & Push)
  try {
    // 1. Email (Siparişteki e-posta adresine gönder)
    await new Email({ email: order.customerEmail, name: order.customerName }, '').sendOrderConfirmation(order);
    
    // 2. Push Notification
    const user = await User.findOne({ email: order.customerEmail });
    if (user && user.fcmTokens && user.fcmTokens.length > 0) {
      await fcmService.sendOrderConfirmationPush(user.fcmTokens, order.id);
    }
    
    // 3. Admin Notification (Banka havalesi için)
    if (paymentMethod === 'bank_transfer') {
      const adminUsers = await User.find({ role: 'admin' });
      for (const admin of adminUsers) {
        if (admin.fcmTokens && admin.fcmTokens.length > 0) {
          await fcmService.sendNewOrderNotification(admin.fcmTokens, {
            title: 'Yeni Sipariş!',
            body: `${order.customerName} banka havalesi ile yeni sipariş verdi: #${order.id}`,
            data: {
              orderId: order.id.toString(),
              customerName: order.customerName,
              paymentMethod: 'bank_transfer',
              amount: total
            }
          });
        }
      }
    }
  } catch (err) {
    console.error('Bildirim gönderim hatası (Sipariş Onayı):', err);
  }

  res.status(201).json({
    status: 'success',
    message: 'Sipariş başarıyla oluşturuldu',
    data: {
      order
    }
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ customerEmail: req.user.email })
    .sort({ date: -1 });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ 
    id: req.params.id,
    customerEmail: req.user.email 
  });

  if (!order) {
    return next(new AppError('Sipariş bulunamadı', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  const order = await Order.findOne({ id: req.params.id });

  if (!order) {
    return next(new AppError('Sipariş bulunamadı', 404));
  }

  order.status = status;
  
  if (status === 'completed') {
    order.completedAt = Date.now();
  }

  await order.save();

  // Send Notifications (Email & Push)
  try {
    const user = await User.findOne({ email: order.customerEmail });
    
    // 1. Email
    await new Email(user, '').sendOrderStatusUpdate(order);
    
    // 2. Push Notification
    if (user && user.fcmTokens && user.fcmTokens.length > 0) {
      await fcmService.sendOrderStatusUpdatePush(user.fcmTokens, order.id, status);
    }
  } catch (err) {
    console.log('Notification error (Status Update):', err.message);
  }

  res.status(200).json({
    status: 'success',
    message: 'Sipariş durumu güncellendi',
    data: {
      order
    }
  });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find().sort({ date: -1 });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders
    }
  });
});

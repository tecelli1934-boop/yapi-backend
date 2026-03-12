const kuveytPay = require('../services/kuveytPay');

/**
 * Ödeme İşlemlerini Yöneten Controller
 */
exports.processPayment = async (req, res, next) => {
  try {
    const { orderData, cardData } = req.body;

    // 1. Temel Doğrulamalar
    if (!orderData || !cardData) {
      return res.status(400).json({ success: false, error: 'Eksik bilgi gönderildi.' });
    }

    // 2. Bankaya Gönder (Kart bilgilerini sadece bu fonksiyona paslıyoruz, kaydetmiyoruz!)
    const result = await kuveytPay.processPayment(orderData, cardData);

    // 3. Yanıtı Döndür
    if (result.success) {
      res.status(200).json({
        success: true,
        transactionId: result.transactionId,
        message: 'Ödeme onaylandı.'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || 'Ödeme banka tarafından reddedildi.'
      });
    }
  } catch (error) {
    next(error);
  }
};

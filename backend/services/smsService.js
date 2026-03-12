const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client;

if (accountSid && authToken && accountSid.startsWith('AC')) {
  try {
    client = twilio(accountSid, authToken);
  } catch (err) {
    console.error('Twilio initialization failed:', err.message);
  }
} else {
  console.log('Twilio credentials missing or invalid. SMS service will run in log-only mode.');
}

/**
 * SMS Gönderme Fonksiyonu
 * @param {string} to - Alıcı telefon numarası
 * @param {string} message - Mesaj içeriği
 */
const sendSMS = async (to, message) => {
  if (!client) {
    console.log('Twilio credentials not configured. SMS not sent:', message);
    return;
  }

  try {
    // Telefon numarasını düzenle (E.164 formatı)
    let formattedTo = to.replace(/\s/g, '');
    if (!formattedTo.startsWith('+')) {
      if (formattedTo.startsWith('0')) {
        formattedTo = '+90' + formattedTo.substring(1);
      } else if (formattedTo.startsWith('90')) {
        formattedTo = '+' + formattedTo;
      } else if (formattedTo.startsWith('5')) {
        formattedTo = '+90' + formattedTo;
      }
    }

    const response = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedTo
    });

    console.log(`SMS sent successfully to ${formattedTo}. SID: ${response.sid}`);
    return response;
  } catch (error) {
    console.error('Error sending SMS via Twilio:', error);
  }
};

/**
 * Sipariş Onay Mesajı
 */
const sendOrderConfirmationSMS = async (phone, orderId) => {
  const message = `Sn. Müşterimiz, siparişiniz başarıyla alındı! Sipariş Kodunuz: #${orderId}. Siparişinizi şu adresten takip edebilirsiniz: https://ramazan-seven.web.app/profil`;
  await sendSMS(phone, message);
};

/**
 * Sipariş Durum Güncelleme Mesajı
 */
const sendOrderStatusUpdateSMS = async (phone, orderId, status) => {
  let statusText = '';
  switch (status) {
    case 'processing': statusText = 'hazırlanıyor'; break;
    case 'shipped': statusText = 'kargoya verildi 🚚'; break;
    case 'delivered': statusText = 'teslim edildi ✅'; break;
    case 'cancelled': statusText = 'iptal edildi'; break;
    default: statusText = status;
  }

  const message = `Sn. Müşterimiz, #${orderId} nolu siparişinizin durumu güncellendi: ${statusText}.`;
  await sendSMS(phone, message);
};

module.exports = {
  sendSMS,
  sendOrderConfirmationSMS,
  sendOrderStatusUpdateSMS
};

const admin = require('firebase-admin');

// Service account key is required for Admin SDK.
// Since we are using the project ID 'ramazan-seven', we'll rely on ADC (Application Default Credentials)
// OR the user can provide a serviceAccountKey.json later.
// For now, we'll initialize with minimal config if possible or use environment variables.

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(), // This will look for GOOGLE_APPLICATION_CREDENTIALS env var
      projectId: 'ramazan-seven'
    });
  }
} catch (error) {
  console.log('Firebase Admin initialization skipped or failed:', error.message);
  console.log('To enable Push Notifications, please set GOOGLE_APPLICATION_CREDENTIALS in .env');
}

/**
 * Send Push Notification to specific FCM tokens
 * @param {Array<string>} tokens - List of FCM tokens
 * @param {Object} payload - Notification data (title, body, icon, click_action)
 */
const sendPushNotification = async (tokens, payload) => {
  if (!tokens || tokens.length === 0) return;
  
  if (!admin.apps.length) {
    console.log('Push Notification log-only mode:', payload);
    return;
  }

  const message = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    webpush: {
      notification: {
        icon: '/vite.svg',
        click_action: payload.click_action || 'https://ramazan-seven.web.app/profil',
      },
    },
    tokens: tokens,
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log(`Push notifications sent successfully: ${response.successCount} success, ${response.failureCount} failure`);
    
    // Potentially cleanup failed tokens (invalidated by Firebase)
    if (response.failureCount > 0) {
      // This part would require passing the User object to cleanup tokens
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

/**
 * Send Order Confirmation Push
 */
const sendOrderConfirmationPush = async (tokens, orderId) => {
  const payload = {
    title: 'Siparişiniz Alındı! 🏗️',
    body: `#${orderId} nolu siparişiniz başarıyla oluşturuldu. Teşekkür ederiz!`,
    click_action: 'https://ramazan-seven.web.app/profil'
  };
  await sendPushNotification(tokens, payload);
};

/**
 * Send Order Status Update Push
 */
const sendOrderStatusUpdatePush = async (tokens, orderId, status) => {
  let statusText = '';
  switch (status) {
    case 'processing': statusText = 'hazırlanıyor 🛠️'; break;
    case 'shipped': statusText = 'kargoya verildi 🚚'; break;
    case 'delivered': statusText = 'teslim edildi ✅'; break;
    case 'cancelled': statusText = 'iptal edildi ❌'; break;
    default: statusText = status;
  }

  const payload = {
    title: 'Sipariş Durumu Güncellendi',
    body: `#${orderId} nolu siparişinizin durumu: ${statusText}`,
    click_action: 'https://ramazan-seven.web.app/profil'
  };
  await sendPushNotification(tokens, payload);
};

module.exports = {
  sendPushNotification,
  sendOrderConfirmationPush,
  sendOrderStatusUpdatePush
};

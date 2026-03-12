const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const smsService = require('../services/smsService');

async function testSMS() {
  console.log('--- SMS Servis Testi Başlatılıyor ---');
  
  const testPhone = '905389327380';
  const testOrderId = 'TEST-2024-001';

  console.log('\n1. Sipariş Onay Mesajı Test Ediliyor...');
  try {
    await smsService.sendOrderConfirmationSMS(testPhone, testOrderId);
    console.log('Sipariş onay fonksiyonu başarıyla tetiklendi (Credentials yoksa loga yazacaktır).');
  } catch (err) {
    console.error('Sipariş onay hatası:', err.message);
  }

  console.log('\n2. Durum Güncelleme Mesajı Test Ediliyor (Kargo)...');
  try {
    await smsService.sendOrderStatusUpdateSMS(testPhone, testOrderId, 'shipped');
    console.log('Durum güncelleme fonksiyonu başarıyla tetiklendi.');
  } catch (err) {
    console.error('Durum güncelleme hatası:', err.message);
  }

  console.log('\n--- Test Tamamlandı ---');
}

testSMS();

require('dotenv').config({ path: './backend/.env' });
const nodemailer = require('nodemailer');

const testSMTP = async () => {
    console.log('--- SMTP Bağlantı Testi Başlatılıyor ---');
    console.log('Host:', process.env.EMAIL_HOST);
    console.log('Port:', process.env.EMAIL_PORT);
    console.log('User:', process.env.EMAIL_USER);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false // Dev ortamında SSL sertifika hatalarını yok say
        }
    });

    try {
        console.log('Sunucuya bağlanılıyor...');
        await transporter.verify();
        console.log('✅ SMTP Bağlantısı Başarılı! Sunucu mesaj göndermeye hazır.');
        
        console.log('Test e-postası gönderiliyor...');
        const info = await transporter.sendMail({
            from: `"Test Servisi" <${process.env.EMAIL_FROM}>`,
            to: process.env.EMAIL_USER, // Kendine gönder
            subject: 'SMTP Test Mesajı',
            text: 'Merhaba, bu e-posta sistemin çalışıp çalışmadığını anlamak için otomatik gönderilmiştir.',
            html: '<b>E-posta sistemi başarıyla çalışıyor!</b>'
        });
        console.log('✅ Test e-postası gönderildi! Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ HATA OLUŞTU:');
        console.error('Hata Kodu:', error.code);
        console.error('Hata Mesajı:', error.message);
        if (error.code === 'EAUTH') {
            console.error('👉 İpucu: Gmail "Uygulama Şifresi" geçersiz olabilir veya iki adımlı doğrulama ayarları SMTP\'yi engelliyor olabilir.');
        }
    }
};

testSMTP();

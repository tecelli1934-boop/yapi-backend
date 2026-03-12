const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate password reset token
const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send email verification
const sendEmailVerification = async (user, verificationToken) => {
  const transporter = createTransporter();
  
  const verificationUrl = `${process.env.FRONTEND_URL}/email-dogrula/${verificationToken}`;
  
  const mailOptions = {
    from: `"Yapı Malzemesi" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Email Adresinizi Doğrulayın',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Doğrulama</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏗️ Yapı Malzemesi</div>
          <h1>Hoş Geldiniz!</h1>
        </div>
        
        <div class="content">
          <h2>Merhaba ${user.name},</h2>
          <p>Yapı Malzemesi platformuna kaydolduğunuz için teşekkür ederiz!</p>
          
          <p>Hesabınızı aktive etmek ve alışverişe başlamak için lütfen aşağıdaki butona tıklayarak email adresinizi doğrulayın:</p>
          
          <a href="${verificationUrl}" class="button">Email Adresimi Doğrula</a>
          
          <p>Veya aşağıdaki linki kopyalayıp tarayıcınıza yapıştırın:</p>
          <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
          
          <p><strong>Önemli Bilgiler:</strong></p>
          <ul>
            <li>🔒 Bu link 24 saat boyunca geçerlidir</li>
            <li>🛒 Doğrulama sonrası binlerce ürüne erişim</li>
            <li>💳 Güvenli ödeme seçenekleri</li>
            <li>📦 Hızlı teslimat</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Bu email size Yapı Malzemesi platformu tarafından gönderilmiştir.</p>
          <p>Sorularınız için: destek@yapimalzemesi.com</p>
          <p>© 2024 Yapı Malzemesi. Tüm hakları saklıdır.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email verification sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending email verification:', error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL}/sifre-sifirlama/${resetToken}`;
  
  const mailOptions = {
    from: `"Yapı Malzemesi" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Şifre Sıfırlama Talebi',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Şifre Sıfırlama</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 40px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏗️ Yapı Malzemesi</div>
          <h1>Şifre Sıfırlama</h1>
        </div>
        
        <div class="content">
          <h2>Merhaba ${user.name},</h2>
          <p>Şifrenizi sıfırlama talebinde bulundunuz.</p>
          
          <div class="warning">
            <strong>⚠️ Güvenlik Uyarısı:</strong><br>
            Eğer siz bu talebi oluşturmadıysanız, lütfen bu emaili dikkate almayın ve hesabınızın güvende olduğundan emin olun.
          </div>
          
          <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          
          <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
          
          <p>Veya aşağıdaki linki kopyalayıp tarayıcınıza yapıştırın:</p>
          <p style="word-break: break-all; color: #dc2626;">${resetUrl}</p>
          
          <p><strong>Önemli Bilgiler:</strong></p>
          <ul>
            <li>⏰ Bu link 1 saat boyunca geçerlidir</li>
            <li>🔒 Güvenliğiniz için linki kimseyle paylaşmayın</li>
            <li>📱 Mobil cihazınızda da çalışır</li>
          </ul>
          
          <p><strong>Şifre Güvenliği İçin İpuçları:</strong></p>
          <ul>
            <li>En az 8 karakter kullanın</li>
            <li>Büyük ve küçük harf kombinasyonu</li>
            <li>Rakam ve özel karakter ekleyin</li>
            <li>Kişisel bilgi kullanmayın</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Bu email size Yapı Malzemesi platformu tarafından gönderilmiştir.</p>
          <p>Sorularınız için: destek@yapimalzemesi.com</p>
          <p>© 2024 Yapı Malzemesi. Tüm hakları saklıdır.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

module.exports = {
  createTransporter,
  generateVerificationToken,
  generatePasswordResetToken,
  sendEmailVerification,
  sendPasswordResetEmail,
  testEmailConfig,
};

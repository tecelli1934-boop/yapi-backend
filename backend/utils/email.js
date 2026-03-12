const nodemailer = require('nodemailer');

class Email {
  constructor(data, url) {
    this.to = data.email || data.customerEmail;
    const name = data.name || data.customerName || 'Değerli Müşterimiz';
    this.firstName = name.split(' ')[0];
    this.url = url;
    this.from = `Yapı Malzemesi <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid veya başka bir production email servisi
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    // Development için Ethereal test hesabı
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async send(template, subject) {
    // HTML template oluştur
    const html = this.generateHTMLTemplate(template, subject);

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Yapı Malzemesine Hoş Geldiniz!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Şifre Sıfırlama Talebiniz (10 dakika geçerli)'
    );
  }

  async sendEmailVerification() {
    await this.send(
      'emailVerification',
      'Email Adresinizi Doğrulayın'
    );
  }

  async sendOrderConfirmation(order) {
    this.order = order;
    await this.send('orderConfirmation', `Siparişiniz Alındı! #${order.id}`);
  }

  async sendOrderStatusUpdate(order) {
    this.order = order;
    let statusText = '';
    switch (order.status) {
      case 'processing': statusText = 'Hazırlanıyor'; break;
      case 'shipped': statusText = 'Kargoya Verildi'; break;
      case 'delivered': statusText = 'Teslim Edildi'; break;
      case 'cancelled': statusText = 'İptal Edildi'; break;
      default: statusText = order.status;
    }
    await this.send('orderStatusUpdate', `Siparişinizin Durumu Güncellendi: ${statusText}`);
  }

  generateHTMLTemplate(template, subject) {
    const commonStyles = `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    `;

    switch (template) {
      case 'welcome':
        return `
          <!DOCTYPE html>
          <html>
          <head>${commonStyles}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏗️ Yapı Malzemesi</h1>
              </div>
              <div class="content">
                <h2>Hoş Geldiniz ${this.firstName}!</h2>
                <p>Yapı Malzemesi ailesine katıldığınız için mutluyuz. Hesabınız başarıyla oluşturuldu.</p>
                <p>Binlerce yapı malzemesi arasından seçim yapabilir, güvenli alışverişin tadını çıkarabilirsiniz.</p>
                <a href="${process.env.FRONTEND_URL}/urunler" class="button">Alışverişe Başla</a>
                <p>Eğer bu hesabı siz oluşturmadıysanız, lütfen bu email'i dikkate almayın.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Yapı Malzemesi. Tüm hakları saklıdır.</p>
              </div>
            </div>
          </body>
          </html>
        `;

      case 'emailVerification':
        return `
          <!DOCTYPE html>
          <html>
          <head>${commonStyles}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏗️ Yapı Malzemesi</h1>
              </div>
              <div class="content">
                <h2>Email Doğrulama</h2>
                <p>Merhaba ${this.firstName},</p>
                <p>Hesabınızı doğrulamak için aşağıdaki butona tıklayın:</p>
                <a href="${this.url}" class="button">Email Adresimi Doğrula</a>
                <p>Bu link 24 saat boyunca geçerlidir.</p>
                <p>Eğer bu işlemi siz yapmadıysanız, lütfen bu email'i dikkate almayın.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Yapı Malzemesi. Tüm hakları saklıdır.</p>
              </div>
            </div>
          </body>
          </html>
        `;

      case 'passwordReset':
        return `
          <!DOCTYPE html>
          <html>
          <head>${commonStyles}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏗️ Yapı Malzemesi</h1>
              </div>
              <div class="content">
                <h2>Şifre Sıfırlama</h2>
                <p>Merhaba ${this.firstName},</p>
                <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
                <a href="${this.url}" class="button">Şifremi Sıfırla</a>
                <p>Bu link 10 dakika boyunca geçerlidir.</p>
                <p>Eğer şifre sıfırlama talebinde bulunmadıysanız, lütfen bu email'i dikkate almayın ve şifrenizi değiştirmeyin.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Yapı Malzemesi. Tüm hakları saklıdır.</p>
              </div>
            </div>
          </body>
          </html>
        `;

      case 'orderConfirmation':
        return `
          <!DOCTYPE html>
          <html>
          <head>${commonStyles}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Siparişiniz İçin Teşekkürler!</h1>
              </div>
              <div class="content">
                <h2>Merhaba ${this.firstName},</h2>
                <p>#${this.order.id} nolu siparişinizi başarıyla aldık ve hazırlamaya başladık.</p>
                <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3>Sipariş Özeti:</h3>
                  <p><strong>Toplam Tutar:</strong> ${this.order.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                  <p><strong>Teslimat Adresi:</strong> ${this.order.address}</p>
                </div>
                <a href="${process.env.FRONTEND_URL}/profil" class="button">Siparişimi Takip Et</a>
              </div>
              <div class="footer">
                <p>&copy; 2024 Yapı Malzemesi. Tüm hakları saklıdır.</p>
              </div>
            </div>
          </body>
          </html>
        `;

      case 'orderStatusUpdate':
        let statusEmoji = '🔔';
        let statusMsg = '';
        if (this.order.status === 'shipped') { statusEmoji = '🚚'; statusMsg = 'Siparişiniz yola çıktı!'; }
        if (this.order.status === 'delivered') { statusEmoji = '✅'; statusMsg = 'Siparişiniz teslim edildi. Gözünüz aydın!'; }
        
        return `
          <!DOCTYPE html>
          <html>
          <head>${commonStyles}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${statusEmoji} Sipariş Durumu</h1>
              </div>
              <div class="content">
                <h2>Merhaba ${this.firstName},</h2>
                <p>#${this.order.id} nolu siparişinizin durumu güncellendi.</p>
                <p style="font-size: 18px; font-weight: bold; color: #2563eb;">${statusMsg || this.order.status}</p>
                <a href="${process.env.FRONTEND_URL}/profil" class="button">Detayları Gör</a>
              </div>
              <div class="footer">
                <p>&copy; 2024 Yapı Malzemesi. Tüm hakları saklıdır.</p>
              </div>
            </div>
          </body>
          </html>
        `;

      default:
        return `
          <!DOCTYPE html>
          <html>
          <head>${commonStyles}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏗️ Yapı Malzemesi</h1>
              </div>
              <div class="content">
                <h2>${subject}</h2>
                <p>Merhaba ${this.firstName},</p>
                <p>Bu otomatik bir bildirimdir.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Yapı Malzemesi. Tüm hakları saklıdır.</p>
              </div>
            </div>
          </body>
          </html>
        `;
    }
  }
}

module.exports = Email;

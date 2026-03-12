const axios = require('axios');
const crypto = require('crypto');
const xml2js = require('xml2js');

/**
 * Kuveyt Türk Sanal POS Servisi
 */
class KuveytPayService {
  constructor() {
    this.apiUrl = process.env.KUVEYT_API_URL || 'https://boa.kuveytturk.com.tr/sanalpos/pay/';
    this.merchantId = process.env.KUVEYT_MERCHANT_ID;
    this.apiUser = process.env.KUVEYT_API_USER;
    this.apiPass = process.env.KUVEYT_API_PASS;
    this.terminalId = process.env.KUVEYT_TERMINAL_ID;
  }

  /**
   * Kuveyt Türk Hash Hesaplama
   */
  generateHash(orderId, amount, okUrl, failUrl) {
    // Kuveyt Türk standardı: MerchantId + OrderId + Amount + OkUrl + FailUrl + ApiUser + SHA256(ApiPass)
    const hashedPass = crypto.createHash('sha256').update(this.apiPass).digest('base64');
    const rawData = this.merchantId + orderId + amount + okUrl + failUrl + this.apiUser + hashedPass;
    return crypto.createHash('sha256').update(rawData).digest('base64');
  }

  /**
   * Ödeme İsteği Gönder (Simülasyon/Taslak)
   */
  async processPayment(orderData, cardData) {
    try {
      const { amount, orderId, okUrl, failUrl } = orderData;
      const amountInCents = Math.round(amount * 100); // Kuruş cinsinden

      const xmlRequest = `
        <KuveytTurkVPOSRequest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
          <APIVersion>1.0.0</APIVersion>
          <OkUrl>${okUrl}</OkUrl>
          <FailUrl>${failUrl}</FailUrl>
          <HashData>${this.generateHash(orderId, amountInCents, okUrl, failUrl)}</HashData>
          <MerchantId>${this.merchantId}</MerchantId>
          <CustomerId>${this.merchantId}</CustomerId>
          <UserName>${this.apiUser}</UserName>
          <TransactionType>Sale</TransactionType>
          <InstallmentCount>0</InstallmentCount>
          <Amount>${amountInCents}</Amount>
          <DisplayAmount>${amountInCents}</DisplayAmount>
          <CurrencyCode>0949</CurrencyCode>
          <MerchantOrderId>${orderId}</MerchantOrderId>
          <TransactionSecurity>3</TransactionSecurity>
          <KVPOSCCWRequestData>
            <CardNumber>${cardData.cardNumber.replace(/\s/g, '')}</CardNumber>
            <CardExpireDateMonth>${cardData.expiryDate.split('/')[0]}</CardExpireDateMonth>
            <CardExpireDateYear>${cardData.expiryDate.split('/')[1]}</CardExpireDateYear>
            <CardCVV2>${cardData.cvc}</CardCVV2>
            <CardHolderName>${cardData.holderName}</CardHolderName>
          </KVPOSCCWRequestData>
        </KuveytTurkVPOSRequest>
      `;

      // Gerçek implementasyonda burası Kuveyt Türk'e POST edilir
      /*
      const response = await axios.post(this.apiUrl, xmlRequest, {
        headers: { 'Content-Type': 'application/xml' }
      });
      return await xml2js.parseStringPromise(response.data);
      */

      // Geliştirme aşamasında başarılı simülasyon döndürüyor
      console.log("Kuveyt Türk XML İsteği Hazırlandı (Gizlilik nedeniyle loglanmadı)");
      return {
        success: true,
        transactionId: "SIMULATED_" + Date.now(),
        message: "Başarılı (Simüle Edildi)"
      };
    } catch (error) {
      console.error("Kuveyt Türk Servis Hatası:", error);
      throw new Error("Banka bağlantısı kurulamadı.");
    }
  }
}

module.exports = new KuveytPayService();

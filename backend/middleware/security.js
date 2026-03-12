const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const slowDown = require('express-slow-down');

// Rate Limiting (Kaba kuvvet saldırılarını engeller)
const limiter = rateLimit({
  max: 100, // Her IP için 15 dakikada maks 100 istek
  windowMs: 15 * 60 * 1000, 
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz, lütfen 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Speed Limiting (Şüpheli IP'leri yavaşlatır, DDoS koruması)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50, // 50 istekten sonra gecikme başlat
  delayMs: (hits) => hits * 100, // Her ek istekte gecikmeyi 100ms artır
});

// Auth Rate Limiting (Daha sıkı - Giriş/Kayıt için)
const authLimiter = rateLimit({
  max: 10, 
  windowMs: 60 * 60 * 1000, // 1 saatte 10 deneme
  message: {
    success: false,
    message: 'Çok fazla deneme yaptınız, lütfen 1 saat sonra tekrar deneyin.'
  },
  skipSuccessfulRequests: true,
});

const securityMiddleware = (app) => {
  // 1. Helmet (HTTP Güvenlik Başlıkları)
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://*.firebaseio.com", "https://*.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }));

  // 2. HTTP Parameter Pollution (Parametre manipülasyonu koruması)
  app.use(hpp());

  // 3. Rate & Speed Limiting
  app.use('/api/', speedLimiter);
  app.use('/api/', limiter);
  app.use('/api/auth/giris', authLimiter);
  app.use('/api/auth/kayit', authLimiter);

  // 4. NoSQL injection protection (Input sanitizasyonu)
  app.use(mongoSanitize());

  // 5. XSS protection
  app.use(xss());

  // 6. CORS configuration (Güvenli köken yönetimi)
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://ramazan-seven.web.app',
    'https://ramazan-seven.firebaseapp.com',
    'http://localhost:5173'
  ].filter(origin => origin);

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // 7. Clickjacking Protection
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
};

module.exports = { securityMiddleware, limiter, authLimiter, speedLimiter };

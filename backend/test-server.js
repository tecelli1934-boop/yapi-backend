const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API çalışıyor',
    timestamp: new Date().toISOString(),
    environment: 'test'
  });
});

// Test products endpoint
app.get('/api/products', (req, res) => {
  res.status(200).json({
    success: true,
    count: 2,
    data: [
      {
        _id: '1',
        name: 'Test Alüminyum Profil',
        category: 'aluminyum',
        basePrice: 100
      },
      {
        _id: '2', 
        name: 'Test PVC Kapı',
        category: 'pvc',
        basePrice: 200
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Test sunucu ${PORT} portunda çalışıyor`);
  console.log(`Test için: http://localhost:${PORT}/api/health`);
});

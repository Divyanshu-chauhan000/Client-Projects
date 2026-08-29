const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://client-projects-frontend.onrender.com',
    'https://client-projects-admin.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/enquiries', require('./routes/enquiry'));

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Auto-seed logic if DB is empty
  try {
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Database is empty. Automatically seeding products...');
      const frontendDomain = 'https://client-projects-frontend.onrender.com';
      const dummyProducts = [
        { name: 'Premium Makana', category: 'Dry Fruits', description: 'High quality premium makana sourced directly from our finest farms.', price: 500, images: [`${frontendDomain}/products/WBEAL.jpg`] },
        { name: 'Authentic Cumin Seeds', category: 'Spices', description: 'Fresh and highly aromatic cumin seeds for your daily cooking.', price: 300, images: [`${frontendDomain}/products/c1JvG.jpg`] },
        { name: 'Rich Cashews', category: 'Dry Fruits', description: 'Crunchy, delicious, and perfectly roasted whole cashews.', price: 1200, images: [`${frontendDomain}/products/43f5c05a-8d86-4f59-844c-71b9cd473d15.jpg`] },
        { name: 'Pure Turmeric Powder', category: 'Spices', description: '100% Organic turmeric powder with high natural curcumin content.', price: 250, images: [`${frontendDomain}/products/ef3de192-9456-48cc-aaff-6d99786263d2.jpg`] },
        { name: 'California Almonds', category: 'Dry Fruits', description: 'Premium imported California almonds packed with essential nutrients.', price: 900, images: [`${frontendDomain}/products/cd7c3b96-af97-4055-9bad-fdc5f0c8aa11.jpg`] },
        { name: 'Black Pepper Whole', category: 'Spices', description: 'Strong and extremely pungent black pepper from Kerala estates.', price: 600, images: [] }
      ];
      await Product.insertMany(dummyProducts);
      console.log('Successfully seeded 6 products into the database!');
    }
  } catch (seedErr) {
    console.error('Error during auto-seed:', seedErr);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

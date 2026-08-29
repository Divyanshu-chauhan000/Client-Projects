const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB for seeding');
    
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log('Clearing existing products...');
      await Product.deleteMany({});
    }

    const dataDir = path.join(__dirname, '../frontend/public/products');
    const files = fs.readdirSync(dataDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));

    const dummyProducts = [
      { name: 'Premium Makana', category: 'Dry Fruits', description: 'High quality premium makana sourced directly from our finest farms.', price: 500 },
      { name: 'Authentic Cumin Seeds', category: 'Spices', description: 'Fresh and highly aromatic cumin seeds for your daily cooking.', price: 300 },
      { name: 'Rich Cashews', category: 'Dry Fruits', description: 'Crunchy, delicious, and perfectly roasted whole cashews.', price: 1200 },
      { name: 'Pure Turmeric Powder', category: 'Spices', description: '100% Organic turmeric powder with high natural curcumin content.', price: 250 },
      { name: 'California Almonds', category: 'Dry Fruits', description: 'Premium imported California almonds packed with essential nutrients.', price: 900 },
      { name: 'Black Pepper Whole', category: 'Spices', description: 'Strong and extremely pungent black pepper from Kerala estates.', price: 600 }
    ];

    const frontendDomain = 'https://client-projects-frontend.onrender.com';

    const productsToSave = dummyProducts.map((p, i) => {
      // Pick 2 images per product from the available copied files
      const imageSubset = files.slice(i * 2, (i * 2) + 2).map(f => `${frontendDomain}/products/${encodeURIComponent(f)}`);
      return {
        ...p,
        images: imageSubset.length > 0 ? imageSubset : []
      };
    });

    await Product.insertMany(productsToSave);
    console.log(`Successfully seeded ${productsToSave.length} products!`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

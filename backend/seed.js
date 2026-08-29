const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
  { name: 'shyam kamal (250grm)', description: 'Premium Makana', category: 'Makana', image: '/uploads/default.jpg' },
  { name: 'regular jawali', description: 'Regular Jawali', category: 'Jawali', image: '/uploads/default.jpg' },
  { name: 'double ladi jawali', description: 'Double ladi Jawali', category: 'Jawali', image: '/uploads/default.jpg' },
  { name: 'dry fruits jawali', description: 'Dry fruits Jawali', category: 'Jawali', image: '/uploads/default.jpg' },
  { name: 'premium jawali', description: 'Premium Jawali', category: 'Jawali', image: '/uploads/default.jpg' },
  { name: 'manglam (aprox 100 grm)', description: 'Manglam Saatdhan', category: 'Saatdhan', image: '/uploads/default.jpg' },
  { name: 'Tiptur gold (small gola) 15kg beg', description: 'Small gola Nariyal', category: 'Nariyal', image: '/uploads/default.jpg' },
  { name: 'ramdev (medium size gola 15 kg)', description: 'Medium size Nariyal', category: 'Nariyal', image: '/uploads/default.jpg' },
  { name: 'mama- bhanja( aprox medium size gola) 25 kg beg', description: 'Medium size gola 25kg', category: 'Nariyal', image: '/uploads/default.jpg' },
  { name: 'double hathi (Big size gola) 25 kg', description: 'Big size gola 25kg', category: 'Nariyal', image: '/uploads/default.jpg' },
  { name: 'cartoon (15kg all size available)', description: 'Cartoon 15kg all size', category: 'Nariyal', image: '/uploads/default.jpg' },
  { name: 'khopra 25 kg beg', description: 'Khopra 25kg', category: 'Nariyal', image: '/uploads/default.jpg' },
  { name: 'Vivah 500grm 200grm', description: 'Vivah Peethi/ubtan', category: 'Peethi/ubtan', image: '/uploads/default.jpg' },
  { name: 'shyam 500grm 200 grm', description: 'Shyam Peethi/ubtan', category: 'Peethi/ubtan', image: '/uploads/default.jpg' },
  { name: 'dulhan 500grm', description: 'Dulhan Peethi/ubtan', category: 'Peethi/ubtan', image: '/uploads/default.jpg' },
  { name: 'manglam 500grm 200grm 100grm', description: 'Manglam Peethi/ubtan', category: 'Peethi/ubtan', image: '/uploads/default.jpg' },
  { name: 'lal mirch powder', description: 'Lal mirch powder Masala', category: 'Masala', image: '/uploads/default.jpg' },
  { name: 'haldi powder', description: 'Haldi powder Masala', category: 'Masala', image: '/uploads/default.jpg' },
  { name: 'dhaniya powder', description: 'Dhaniya powder Masala', category: 'Masala', image: '/uploads/default.jpg' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    await Product.deleteMany({});
    console.log('Products removed');
    await Product.insertMany(products);
    console.log('Products seeded');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();

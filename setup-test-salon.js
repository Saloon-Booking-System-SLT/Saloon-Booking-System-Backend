const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Salon = require('./models/Salon');
require('dotenv').config();

const createTestSalon = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if test salon already exists
    const existingSalon = await Salon.findOne({ email: 'test@salon.com' });
    
    if (existingSalon) {
      console.log('Test salon already exists');
      console.log('Email: test@salon.com');
      console.log('Password: test123');
      console.log('Salon ID:', existingSalon._id);
      process.exit(0);
    }

    // Create test salon
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const testSalon = new Salon({
      name: 'Test Salon',
      email: 'test@salon.com',
      password: hashedPassword,
      phone: '+94712345678',
      location: 'Colombo, Sri Lanka',
      workingHours: '09:00 - 18:00',
      services: ['Hair Cut', 'Hair Wash', 'Styling'],
      salonType: 'Hair Salon',
      coordinates: { lat: 6.9271, lng: 79.8612 },
      isActive: true,
      isVerified: true
    });

    await testSalon.save();

    console.log('✅ Test salon created successfully!');
    console.log('📧 Email: test@salon.com');
    console.log('🔑 Password: test123');
    console.log('🆔 Salon ID:', testSalon._id);
    console.log('📍 Location: Colombo, Sri Lanka');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test salon:', error);
    process.exit(1);
  }
};

createTestSalon();
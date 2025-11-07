const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

const createDefaultAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@salon.com' });
    
    if (existingAdmin) {
      console.log('Default admin already exists');
      console.log('Email: admin@salon.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Create default admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const defaultAdmin = new Admin({
      name: 'System Administrator',
      email: 'admin@salon.com',
      password: hashedPassword,
      role: 'super_admin',
      permissions: ['users', 'salons', 'appointments', 'services', 'professionals', 'analytics', 'system'],
      phone: '+94712345678',
      isActive: true
    });

    await defaultAdmin.save();

    console.log('✅ Default admin created successfully!');
    console.log('📧 Email: admin@salon.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
    process.exit(1);
  }
};

createDefaultAdmin();
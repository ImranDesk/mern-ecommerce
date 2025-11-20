const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

// Script to create an admin user or update existing user to admin
const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin User';

    let user = await User.findOne({ email });

    if (user) {
      // Update existing user to admin
      user.role = 'admin';
      user.password = password; // Will be hashed by pre-save hook
      await user.save();
      console.log(`✅ User ${email} updated to admin role`);
    } else {
      // Create new admin user
      user = new User({
        name,
        email,
        password,
        role: 'admin'
      });
      await user.save();
      console.log(`✅ Admin user created: ${email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();


const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

// Admin Registration (for initial setup)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      phone,
      permissions: ['users', 'salons', 'appointments', 'services', 'professionals', 'analytics', 'system'] // Full permissions
    });

    await newAdmin.save();

    res.status(201).json({ 
      message: "Admin registered successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        permissions: newAdmin.permissions
      }
    });
  } catch (err) {
    console.error("Admin registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({ message: "Admin account is deactivated" });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    res.json({
      message: "Login successful",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        phone: admin.phone,
        photoURL: admin.photoURL,
        lastLogin: admin.lastLogin
      }
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Google login for admin
router.post('/google-login', async (req, res) => {
  const { name, email, photoURL } = req.body;

  if (!email) return res.status(400).json({ message: 'Missing email' });

  try {
    let admin = await Admin.findOne({ email });
    if (!admin) {
      // Create new admin with Google auth
      admin = new Admin({ 
        name, 
        email, 
        photoURL,
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for Google auth
        permissions: ['users', 'salons', 'appointments', 'services', 'professionals', 'analytics']
      });
      await admin.save();
    }
    
    // Update last login and photo
    admin.lastLogin = new Date();
    admin.photoURL = photoURL;
    await admin.save();

    res.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      photoURL: admin.photoURL,
      lastLogin: admin.lastLogin
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all admins (for super admin)
router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find({}).select('-password');
    res.json(admins);
  } catch (err) {
    console.error("Get admins error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get admin by ID
router.get("/:id", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (err) {
    console.error("Get admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update admin
router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (err) {
    console.error("Update admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete admin
router.delete("/:id", async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error("Delete admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
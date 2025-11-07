const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Google login - Save or return user
router.post('/google-login', async (req, res) => {
  const { name, email, photoURL } = req.body;

  if (!email) return res.status(400).json({ message: 'Missing email' });

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, photoURL });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Phone login - Save or return user
router.post('/phone-login', async (req, res) => {
  const { phone, name } = req.body;

  if (!phone) return res.status(400).json({ message: 'Missing phone number' });

  try {
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ 
        name: name || 'Phone User', 
        phone, 
        email: '',
        photoURL: ''
      });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Guest login - Create temporary user session
router.post('/guest-login', async (req, res) => {
  try {
    const guestUser = {
      _id: 'guest_' + Date.now(),
      name: 'Guest User',
      email: '',
      phone: '',
      photoURL: '',
      isGuest: true
    };
    res.json(guestUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Error updating user" });
  }
});

module.exports = router;

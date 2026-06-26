const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
 
// Create an Express router.
const router = express.Router();
 
// Helper function to generate a JWT.
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h'
    }
  );
};
 
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password.'
      });
    }
 
    
    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email already exists.'
      });
    }
 

    const hashedPassword = await bcrypt.hash(password, 10);
 
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword
    });
 
    const token = generateToken(newUser);
 
  
    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error during registration.',
      error: error.message
    });
  }
});
 
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
 
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password.'
      });
    }
 

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }
 
    const passwordMatches = await bcrypt.compare(password, user.password);
 
    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }
 
    const token = generateToken(user);
 
    res.json({
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error during login.',
      error: error.message
    });
  }
});
 
module.exports = router;

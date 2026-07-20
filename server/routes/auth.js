//const bcrypt = require('bcryptjs');
const auth = require('../middleware/authMiddleware');
const jwt=require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const bcrypt = require('bcryptjs');

// REGISTER ROUTE
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save User
        user = new User({ username, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ msg: "User registered successfully!" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

//login rout

// @route    GET api/auth/user
// @desc     Get logged in user data
// @access   Private
router.get('/user', auth, async (req, res) => {
    try {
        // Find user by ID but don't return the password
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Login Route (Sirf Fix Admin ke liye)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // .env se details check karna
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            
            // Ek fake ID de dete hain kyunki hum DB use nahi kar rahe admin ke liye
            const token = jwt.sign({ id: 'admin_id', role: 'admin' }, 'secretkey123', { expiresIn: '2h' });

            return res.json({
                msg: "Welcome Admin! Login Successful.",
                token: token
            });
        } else {
            return res.status(401).json({ msg: "Invalid Admin Credentials!" });
        }
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// ==================== STUDENT LOGIN ====================
router.post("/student-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "User not found!"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Invalid Password!"
      });
    }

    // Success
    res.json({
      success: true,
      msg: "Login Successful!",
      username: user.username,
      email: user.email
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      msg: "Server Error"
    });
  }
});
module.exports = router;
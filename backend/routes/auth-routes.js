// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
        return res.json({ success: false, message: 'Please enter all fields' });
    }

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists. Please login.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.json({ success: true, message: 'Registration successful' });
    } catch (err) {
        console.error('Registration error:', err);
        res.json({ success: false, message: 'Server error' });
    }
});

// Login Route
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return res.json({ success: false, message: 'Server error' }); }
        if (!user) { return res.json({ success: false, message: info.message }); }
        req.logIn(user, (err) => {
            if (err) { return res.json({ success: false, message: 'Server error' }); }
            return res.json({ success: true, message: 'Login successful' });
        });
    })(req, res, next);
});

// Logout Route
router.post('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return res.json({ success: false, message: 'Error logging out' }); }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Check Authentication Status
router.get('/check', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ authenticated: true, user: req.user });
    } else {
        res.json({ authenticated: false });
    }
});

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: 'https://beatmiles.azurewebsites.net/login.html' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('https://beatmiles.azurewebsites.net/index.html');
    }
);

// Facebook OAuth Routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: 'https://beatmiles.azurewebsites.net/login.html' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('https://beatmiles.azurewebsites.net/index.html');
    }
);

// GitHub OAuth Routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: 'https://beatmiles.azurewebsites.net/login.html' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('https://beatmiles.azurewebsites.net/index.html');
    }
);

module.exports = router;


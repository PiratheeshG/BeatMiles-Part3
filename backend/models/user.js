// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        sparse: true // Allows multiple docs without email (for OAuth)
    },
    password: {
        type: String
    },
    googleId: {
        type: String
    },
    facebookId: {
        type: String
    },
    githubId: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

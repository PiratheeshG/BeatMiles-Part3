// controllers/authController.js
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports = function(passport) {
    // Serialize User
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize User
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    // Local Strategy
    passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        // Match User
        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'That email is not registered' });
                }

                // Match Password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;

                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password incorrect' });
                    }
                });
            })
            .catch(err => console.log(err));
    }));

    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
        // Find or Create User
        User.findOne({ googleId: profile.id })
            .then(user => {
                if (user) {
                    return done(null, user);
                } else {
                    const newUser = new User({
                        googleId: profile.id,
                        email: profile.emails[0].value
                    });

                    newUser.save()
                        .then(user => done(null, user))
                        .catch(err => console.log(err));
                }
            })
            .catch(err => console.log(err));
    }));

    // Facebook Strategy
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: '/api/auth/facebook/callback',
        profileFields: ['id', 'emails', 'name'] // Request email field
    },
    (accessToken, refreshToken, profile, done) => {
        // Find or Create User
        User.findOne({ facebookId: profile.id })
            .then(user => {
                if (user) {
                    return done(null, user);
                } else {
                    const email = profile.emails ? profile.emails[0].value : undefined;
                    const newUser = new User({
                        facebookId: profile.id,
                        email: email
                    });

                    newUser.save()
                        .then(user => done(null, user))
                        .catch(err => console.log(err));
                }
            })
            .catch(err => console.log(err));
    }));

    // GitHub Strategy
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
        scope: [ 'user:email' ]
    },
    (accessToken, refreshToken, profile, done) => {
        // Find or Create User
        User.findOne({ githubId: profile.id })
            .then(user => {
                if (user) {
                    return done(null, user);
                } else {
                    const email = profile.emails ? profile.emails[0].value : undefined;
                    const newUser = new User({
                        githubId: profile.id,
                        email: email
                    });

                    newUser.save()
                        .then(user => done(null, user))
                        .catch(err => console.log(err));
                }
            })
            .catch(err => console.log(err));
    }));
};



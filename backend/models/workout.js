// models/Workout.js
const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, required: true },
    type: { type: String, required: true },
    duration: { type: Number, required: true }, // in minutes
    distance: { type: Number }, // in km
    avgSpeed: { type: Number }, // in km/h
    avgHeartRate: { type: Number }, // in bpm
    calories: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Workout', WorkoutSchema);

// routes/workoutRoutes.js
const express = require('express');
const router = express.Router();
const WorkoutModel = require('../models/workout');
const { ensureAuthenticated } = require('../utils/auth');

// Get all workouts for the authenticated user
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const workouts = await WorkoutModel.find({ user: req.user.id }).sort({ date: -1 });
        res.json({ success: true, workouts });
    } catch (err) {
        console.error('Error fetching workouts:', err);
        res.json({ success: false, message: 'Server error' });
    }
});

// Get single workout by ID
router.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const workout = await WorkoutModel.findById(req.params.id);
        if (!workout) {
            return res.json({ success: false, message: 'Workout not found' });
        }
        if (workout.user.toString() !== req.user.id) {
            return res.json({ success: false, message: 'Unauthorized' });
        }
        res.json({ success: true, workout });
    } catch (err) {
        console.error('Error fetching workout:', err);
        res.json({ success: false, message: 'Server error' });
    }
});

// Add a new workout
router.post('/', ensureAuthenticated, async (req, res) => {
    const { date, type, duration, distance, avgSpeed, avgHeartRate, calories } = req.body;

    if (!date || !type || !duration) {
        return res.json({ success: false, message: 'Please fill out the required fields' });
    }

    try {
        const newWorkout = new WorkoutModel({
            user: req.user.id,
            date,
            type,
            duration,
            distance,
            avgSpeed,
            avgHeartRate,
            calories
        });

        await newWorkout.save();
        res.json({ success: true, message: 'Workout added successfully' });
    } catch (err) {
        console.error('Error adding workout:', err);
        res.json({ success: false, message: 'Server error' });
    }
});

// Delete a workout
router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const workout = await WorkoutModel.findById(req.params.id);

        if (!workout) {
            return res.json({ success: false, message: 'Workout not found' });
        }

        if (workout.user.toString() !== req.user.id) {
            return res.json({ success: false, message: 'Unauthorized' });
        }

        await workout.remove();
        res.json({ success: true, message: 'Workout deleted successfully' });
    } catch (err) {
        console.error('Error deleting workout:', err);
        res.json({ success: false, message: 'Server error' });
    }
});

// Edit a workout
router.put('/:id', ensureAuthenticated, async (req, res) => {
    const { date, type, duration, distance, avgSpeed, avgHeartRate, calories } = req.body;

    try {
        let workout = await WorkoutModel.findById(req.params.id);

        if (!workout) {
            return res.json({ success: false, message: 'Workout not found' });
        }

        if (workout.user.toString() !== req.user.id) {
            return res.json({ success: false, message: 'Unauthorized' });
        }

        workout.date = date || workout.date;
        workout.type = type || workout.type;
        workout.duration = duration || workout.duration;
        workout.distance = distance || workout.distance;
        workout.avgSpeed = avgSpeed || workout.avgSpeed;
        workout.avgHeartRate = avgHeartRate || workout.avgHeartRate;
        workout.calories = calories || workout.calories;

        await workout.save();
        res.json({ success: true, message: 'Workout updated successfully' });
    } catch (err) {
        console.error('Error updating workout:', err);
        res.json({ success: false, message: 'Server error' });
    }
});

module.exports = router;


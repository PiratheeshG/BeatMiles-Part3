// script.js

// ==================== Authentication Functions ====================

// Check authentication status and update navigation links
async function checkAuth() {
    try {
        const response = await fetch('https://beatmiles-backend.azurewebsites.net/api/auth/check', {
            credentials: 'include'
        });
        const data = await response.json();
        const loginLink = document.getElementById("login-link");
        const registerLink = document.getElementById("register-link");
        const logoutLink = document.getElementById("logout-link");

        if (data.authenticated) {
            loginLink.style.display = "none";
            registerLink.style.display = "none";
            logoutLink.style.display = "inline";
        } else {
            loginLink.style.display = "inline";
            registerLink.style.display = "inline";
            logoutLink.style.display = "none";
        }
    } catch (error) {
        console.error('Error checking auth:', error);
    }
}

// Logout the user
async function logout() {
    try {
        const response = await fetch('https://beatmiles-backend.azurewebsites.net/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            alert("You have been logged out.");
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

// ==================== Registration Function ====================

// Register a new user
async function registerUser() {
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();

    if (!email || !password) {
        alert("Please fill out all fields.");
        return;
    }

    try {
        const response = await fetch('https://beatmiles-backend.azurewebsites.net/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            alert("Registration successful! Redirecting to login...");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Registration failed.");
        }
    } catch (error) {
        console.error('Error during registration:', error);
    }
}

// ==================== Login Function ====================

// Login the user
async function loginUser() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
        alert("Please fill out all fields.");
        return;
    }

    try {
        const response = await fetch('https://beatmiles-backend.azurewebsites.net/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            alert("Login successful!");
            window.location.href = "index.html";
        } else {
            alert(data.message || "Login failed.");
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

// ==================== Workout Management Functions ====================

let editWorkoutId = null;

// Add or Update a workout
async function addOrUpdateWorkout() {
    const date = document.getElementById("date").value;
    const type = document.getElementById("type").value;
    const duration = document.getElementById("duration").value;
    const distance = document.getElementById("distance").value;
    const avgSpeed = document.getElementById("avg-speed").value;
    const avgHeartRate = document.getElementById("avg-heart-rate").value;
    const calories = document.getElementById("calories").value;

    if (!date || !type || !duration) {
        alert("Please fill out the required fields (date, type, duration).");
        return;
    }

    const workout = { date, type, duration, distance, avgSpeed, avgHeartRate, calories };

    try {
        let response, data;
        if (editWorkoutId) {
            // Update existing workout
            response = await fetch(`https://beatmiles-backend.azurewebsites.net/api/workouts/${editWorkoutId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(workout)
            });
            data = await response.json();
            if (data.success) {
                alert("Workout updated successfully!");
            } else {
                alert(data.message || "Failed to update workout.");
            }
            editWorkoutId = null;
            document.getElementById("add-button").textContent = "Log Workout";
        } else {
            // Add new workout
            response = await fetch('https://beatmiles-backend.azurewebsites.net/api/workouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(workout)
            });
            data = await response.json();
            if (data.success) {
                alert("Workout logged successfully!");
            } else {
                alert(data.message || "Failed to log workout.");
            }
        }
        document.getElementById("cardio-log-form").reset();
        fetchWorkouts();
    } catch (error) {
        console.error('Error adding/updating workout:', error);
    }
}

// Fetch all workouts for the authenticated user
async function fetchWorkouts() {
    try {
        const response = await fetch('https://beatmiles-backend.azurewebsites.net/api/workouts', {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            displayWorkouts(data.workouts);
        } else {
            alert(data.message || "Failed to fetch workouts.");
        }
    } catch (error) {
        console.error('Error fetching workouts:', error);
    }
}

// Display workouts in the table
function displayWorkouts(workouts) {
    const workoutTableBody = document.getElementById("workout-table").getElementsByTagName("tbody")[0];
    workoutTableBody.innerHTML = "";

    workouts.forEach(workout => {
        const row = workoutTableBody.insertRow();
        row.innerHTML = `
            <td>${new Date(workout.date).toLocaleDateString()}</td>
            <td>${workout.type}</td>
            <td>${workout.duration} min</td>
            <td>${workout.distance || "-"}</td>
            <td>${workout.avgSpeed || "-"}</td>
            <td>${workout.avgHeartRate || "-"}</td>
            <td>${workout.calories || "-"}</td>
            <td>
                <button onclick="populateEditWorkout('${workout._id}')">Edit</button>
                <button onclick="deleteWorkout('${workout._id}')">Delete</button>
            </td>
        `;
    });
}

// Populate the form with workout data for editing
async function populateEditWorkout(id) {
    try {
        const response = await fetch(`https://beatmiles-backend.azurewebsites.net/api/workouts/${id}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success && data.workout) {
            const workout = data.workout;
            document.getElementById("date").value = workout.date.split('T')[0];
            document.getElementById("type").value = workout.type;
            document.getElementById("duration").value = workout.duration;
            document.getElementById("distance").value = workout.distance || '';
            document.getElementById("avg-speed").value = workout.avgSpeed || '';
            document.getElementById("avg-heart-rate").value = workout.avgHeartRate || '';
            document.getElementById("calories").value = workout.calories || '';

            editWorkoutId = id;
            document.getElementById("add-button").textContent = "Save Changes";
        } else {
            alert(data.message || "Failed to fetch workout details.");
        }
    } catch (error) {
        console.error('Error fetching workout for edit:', error);
    }
}

// Delete a workout
async function deleteWorkout(id) {
    if (!confirm("Are you sure you want to delete this workout?")) return;

    try {
        const response = await fetch(`https://beatmiles-backend.azurewebsites.net/api/workouts/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            alert("Workout deleted successfully!");
            fetchWorkouts();
        } else {
            alert(data.message || "Failed to delete workout.");
        }
    } catch (error) {
        console.error('Error deleting workout:', error);
    }
}

// ==================== OAuth Redirection Functions ====================

// Redirect to OAuth provider
function redirectToOAuth(provider) {
    window.location.href = `https://beatmiles-backend.azurewebsites.net/api/auth/${provider}`;
}

// ==================== Page Initialization ====================

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'index.html' || currentPage === '') {
        checkAuth();
    }

    if (currentPage === 'login.html') {
        // Event listeners for OAuth buttons
        document.querySelectorAll('.oauth-button').forEach(button => {
            button.addEventListener('click', () => {
                const provider = button.getAttribute('data-provider');
                redirectToOAuth(provider);
            });
        });
    }

    if (currentPage === 'workout_log.html') {
        document.getElementById("add-button").addEventListener('click', addOrUpdateWorkout);
    }
});

// ==================== Protect Workout Log Page ====================

// Ensure the user is authenticated before accessing the workout log
async function checkAndProtectPage() {
    try {
        const response = await fetch('https://beatmiles-backend.azurewebsites.net/api/auth/check', {
            credentials: 'include'
        });
        const data = await response.json();

        if (!data.authenticated) {
            alert("You must be logged in to access this page.");
            window.location.href = "login.html";
        } else {
            checkAuth();
            fetchWorkouts();
        }
    } catch (error) {
        console.error('Error checking auth:', error);
    }
}



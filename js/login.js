// ===== BACKEND API BASE URL =====
// This is where your Flask server is running (must be running for login/signup to work).
const API_BASE = 'http://127.0.0.1:5000';

// ===== LOGIN FORM =====
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        if (!email || !password) {
            errorMessage.textContent = 'Please fill in all fields.';
            return;
        }

        errorMessage.textContent = '';

        try {
            const response = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                errorMessage.textContent = data.error || 'Login failed. Please try again.';
                return;
            }

            localStorage.setItem('ecotrack_user', JSON.stringify({
                user_id: data.user_id,
                name: data.name,
                email: data.email
            }));

            window.location.href = 'dashboard.html';

        } catch (error) {
            errorMessage.textContent = 'Could not connect to server. Make sure the backend is running.';
            console.error('Login error:', error);
        }
    });
}

// ===== SIGNUP FORM =====
const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorMessage = document.getElementById('errorMessage');

        if (!name || !email || !password || !confirmPassword) {
            errorMessage.textContent = 'Please fill in all fields.';
            return;
        }

        if (password.length < 6) {
            errorMessage.textContent = 'Password must be at least 6 characters.';
            return;
        }

        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match.';
            return;
        }

        errorMessage.textContent = '';

        try {
            const response = await fetch(`${API_BASE}/api/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                errorMessage.textContent = data.error || 'Signup failed. Please try again.';
                return;
            }

            alert('Account created successfully! Please log in.');
            window.location.href = 'login.html';

        } catch (error) {
            errorMessage.textContent = 'Could not connect to server. Make sure the backend is running.';
            console.error('Signup error:', error);
        }
    });
}
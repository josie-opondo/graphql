import { login, getToken } from './auth.js';
import { showProfilePage, showError } from './ui.js';

const loginForm = document.getElementById('login-form');
const loginPage = document.getElementById('login-page');
const profilePage = document.getElementById('profile-page');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.textContent = '';

    const usernameOrEmail = document.getElementById('usernameOrEmail').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!usernameOrEmail || !password) {
        errorMessage.textContent = 'Please fill in all fields.';
        return;
    }

    try {
        await login(usernameOrEmail, password);
        loginPage.style.display = 'none';
        await showProfilePage();
    } catch (err) {
        errorMessage.textContent = `Login failed: ${err.message}`;
        console.error(err);
    }
});

// Auto-login if JWT exists
if (getToken()) {
    loginPage.style.display = 'none';
    showProfilePage();
} else {
    loginPage.style.display = 'block';
    profilePage.style.display = 'none';
}

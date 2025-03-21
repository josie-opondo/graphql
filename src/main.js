import { login, getToken } from './auth.js';
import { showProfilePage, showError } from './ui.js';

const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn')
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

    showLoadingSpinner(loginBtn, 'Signing in...');

    try {
        await login(usernameOrEmail, password);
        loginPage.style.display = 'none';
        await showProfilePage();
    } catch (err) {
        errorMessage.textContent = `Login failed: ${err.message}`;
        console.error(err);
    } finally {
        hideLoadingSpinner(loginBtn, 'Log In');
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

function showLoadingSpinner(button, loadingText = 'Signing in...') {
    button.disabled = true;
    button.innerHTML = `
        <span style="display: inline-flex; align-items: center;">
            <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ${loadingText}
        </span>`;
}


function hideLoadingSpinner(button, originalText = 'Log In') {
    button.disabled = false;
    button.textContent = originalText;
}

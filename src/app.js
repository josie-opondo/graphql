import { AuthManager } from './authManager.js';
import { ProfileManager } from './profileManager.js';
import { UIHelper } from './uiHelper.js';

export class App {
    static init() {
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameOrEmail = document.getElementById('usernameOrEmail').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!usernameOrEmail || !password) {
                document.getElementById('error-message').textContent = 'Please fill in all fields.';
                return;
            }

            UIHelper.showLoadingSpinner(document.getElementById('login-btn'), 'Signing in...');

            try {
                await AuthManager.login(usernameOrEmail, password);
                UIHelper.showProfilePage();
                await ProfileManager.renderProfile();
            } catch (err) {
                document.getElementById('error-message').textContent = `Login failed: ${err.message}`;
                console.error(err);
            } finally {
                UIHelper.hideLoadingSpinner(document.getElementById('login-btn'), 'Log In');
            }
        });

        // Auto-login if JWT exists
        if (AuthManager.getToken() && !AuthManager.isTokenExpired(AuthManager.getToken())) {
            UIHelper.showProfilePage();
            ProfileManager.renderProfile();
        } else {
            UIHelper.showLoginPage();
        }
    }
}

// Initialize the app
App.init();
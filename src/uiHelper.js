export class UIHelper {
    static showLoading(message = 'Loading...') {
        document.getElementById('profile-page').innerHTML = `<p>${message}</p>`;
    }

    static showError(message) {
        document.getElementById('profile-page').innerHTML = `<p style="color:red;">${message}</p>`;
    }

    static showLoginPage() {
        document.getElementById('login-page').style.display = 'block';
        document.getElementById('profile-page').style.display = 'none';
    }

    static showProfilePage() {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('profile-page').style.display = 'block';
    }

    static showLoadingSpinner(button, loadingText = 'Signing in...') {
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

    static hideLoadingSpinner(button, originalText = 'Log In') {
        button.disabled = false;
        button.textContent = originalText;
    }
}
import { getUserData, getXpByProject, getPassFailRatio } from './graphql.js';
import { renderXpProgressChart, renderPassFailPieChart } from './charts.js';
import { logout } from './auth.js';

// Selectors
const loginPage = document.getElementById('login-page');
const profilePage = document.getElementById('profile-page');

const userIdSpan = document.getElementById('user-id');
const userLoginSpan = document.getElementById('user-login');
const userXpSpan = document.getElementById('user-xp');
const xpGraphContainer = document.getElementById('xp-graph');
const passFailChartContainer = document.getElementById('pass-fail-chart');
const logoutBtn = document.getElementById('logout-btn');

export function showLoading(message = 'Loading...') {
    profilePage.innerHTML = `<p>${message}</p>`;
}

export function showError(message) {
    profilePage.innerHTML = `<p style="color:red;">${message}</p>`;
}

export async function showProfilePage() {
    loginPage.style.display = 'none';
    profilePage.style.display = 'block';

    try {
        const userData = await getUserData();
        const user = userData.user[0];

        const totalXp = user.transactions.reduce((sum, tx) => sum + tx.amount, 0);

        userIdSpan.textContent = user.id;
        userLoginSpan.textContent = user.login;
        userXpSpan.textContent = totalXp;

        // Fetch XP by project and render bar chart
        const xpData = await getXpByProject();
        renderXpProgressChart(xpData.transaction, xpGraphContainer);

        // Fetch pass/fail ratio and render pie chart
        const passFailData = await getPassFailRatio();
        renderPassFailPieChart(passFailData.result, passFailChartContainer);
    } catch (err) {
        showError('Error loading profile: ' + err.message);
        console.error(err);
    }
}

logoutBtn.addEventListener('click', () => {
    logout();
    profilePage.style.display = 'none';
    loginPage.style.display = 'block';
});

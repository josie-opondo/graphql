import { renderXpProgressChart, renderAuditRatioBarChart } from './charts.js';
import { logout } from './auth.js';
import { renderSkillPieChart } from './skills.js';
import {fetchGraphQL, formatXP, getTopUniqueSkills, isJwtExpired} from './utils.js';
import { USER_DATA_QUERY } from "./queries.js";

// Selectors
const loginPage = document.getElementById('login-page');
const profilePage = document.getElementById('profile-page');
const xpGraphContainer = document.getElementById('xp-graph');
const logoutBtn = document.getElementById('logout-btn');
const auditRatioBar = document.getElementById('audit-ratio-graph');

export function showLoading(message = 'Loading...') {
    profilePage.innerHTML = `<p>${message}</p>`;
}

export function showError(message) {
    profilePage.innerHTML = `<p style="color:red;">${message}</p>`;
}

export async function showProfilePage() {
    const jwt = localStorage.getItem('jwt');

    if (!jwt || isJwtExpired(jwt)) {
        console.warn('JWT expired or missing, redirecting to login.');
        logout();
        loginPage.style.display = 'block';
        profilePage.style.display = 'none';
        return;
    }

    loginPage.style.display = 'none';
    profilePage.style.display = 'block';

    try {
        const jwt = localStorage.getItem('jwt');
        const userData = await fetchGraphQL(USER_DATA_QUERY, jwt);
        const user = userData.user[0];
        const transactions = userData.transaction;
        const xpTransactions = userData.transaction.filter(
            (tx) => tx.type === "xp"
        );
        const totalXp = xpTransactions.reduce((sum, tx) => sum + tx.amount, 0);

        document.getElementById('greeting-username').textContent = user.attrs.firstName
        document.getElementById('summary-xp').textContent = formatXP(totalXp);
        document.getElementById('summary-audit-ratio').textContent = user.auditRatio.toFixed(1);
        document.getElementById('summary-level').textContent = user.events[0]?.level ?? 'N/A';


        // Render XP Progress Chart
        renderXpProgressChart(xpTransactions, xpGraphContainer);

        // Render Audit Ratio Chart
        renderAuditRatioBarChart({ auditRatio: user.auditRatio, transactions }, auditRatioBar);

        // Render Skills
        const skills = user.skills;
        const topSkills = getTopUniqueSkills(skills);
        const skillsGrid = document.getElementById('skills-grid');
        skillsGrid.innerHTML = "";
        topSkills.forEach(skill => {
            const card = document.createElement('div');
            card.classList.add('skill-card');
            renderSkillPieChart(skill, card);
            const name = document.createElement('h4');
            name.textContent = skill.name;
            card.appendChild(name);
            skillsGrid.appendChild(card);
        });
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

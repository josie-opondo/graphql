import { getUserData, getXpByProject } from './graphql.js';
import { renderXpProgressChart } from './charts.js';
import { logout } from './auth.js';
import { renderSkillPieChart } from './skills.js';
import { fetchGraphQL, getTopUniqueSkills } from './utils.js';
import { USER_SKILLS_QUERY } from './queries.js';

// Selectors
const loginPage = document.getElementById('login-page');
const profilePage = document.getElementById('profile-page');

const userIdSpan = document.getElementById('user-id');
const userLoginSpan = document.getElementById('user-login');
const userXpSpan = document.getElementById('user-xp');
const xpGraphContainer = document.getElementById('xp-graph');
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

        // Fetch and render skills
        const jwt = localStorage.getItem('jwt');
        const skillsData = await fetchGraphQL(USER_SKILLS_QUERY, jwt);
        const skills = skillsData?.user[0].skills;
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

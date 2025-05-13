import { renderXpProgressChart, renderAuditRatioBarChart } from './charts.js';
import { renderSkillPieChart } from './skills.js';
import { USER_DATA_QUERY } from './queries.js';
import {AuthManager} from "./authManager.js";
import {GraphQLClient} from "./graphClient.js";
import {UIHelper} from "./uiHelper.js";

export class ProfileManager {
    static async renderProfile() {
        const jwt = AuthManager.getToken();
        if (!jwt || AuthManager.isTokenExpired(jwt)) {
            console.warn('JWT expired or missing, redirecting to login.');
            AuthManager.logout();
            UIHelper.showLoginPage();
            return;
        }

        UIHelper.showProfilePage();

        try {
            const userData = await GraphQLClient.fetch(USER_DATA_QUERY);
            const user = userData.user[0];
            const transactions = userData.transaction;
            const xpTransactions = transactions.filter((tx) => tx.type === 'xp');
            const totalXp = xpTransactions.reduce((sum, tx) => sum + tx.amount, 0);

            // Update user info
            setElementTextContent('greeting-username', user.attrs.firstName);
            setElementTextContent('summary-xp', formatXP(totalXp));
            setElementTextContent('summary-audit-ratio', user.auditRatio.toFixed(1));
            setElementTextContent('summary-level', user.events[0]?.level ?? 'N/A');

            // Render charts
            renderXpProgressChart(xpTransactions, document.getElementById('xp-graph'));
            renderAuditRatioBarChart({ auditRatio: user.auditRatio, transactions }, document.getElementById('audit-ratio-graph'));

            // Render skills
            const skills = user.skills;
            const topSkills = getTopUniqueSkills(skills);
            const skillsGrid = document.getElementById('skills-grid');
            skillsGrid.innerHTML = '';
            topSkills.forEach((skill) => {
                const card = document.createElement('div');
                card.classList.add('skill-card');
                renderSkillPieChart(skill, card);
                const name = document.createElement('h4');
                name.textContent = skill.name;
                card.appendChild(name);
                skillsGrid.appendChild(card);
            });
        } catch (err) {
            UIHelper.showError('Error loading profile: ' + err.message);
            console.error(err);
        }
    }
}

export function getTopUniqueSkills(skills, limit = 8) {
    const skillMap = new Map();

    skills.forEach((skill) => {
        const existingAmount = skillMap.get(skill.type) || 0;
        if (skill.amount > existingAmount) {
            skillMap.set(skill.type, skill.amount);
        }
    });

    return [...skillMap.entries()]
        .map(([type, amount]) => ({
            name: type.replace("skill_", ""),
            level: amount / 100, // convert to decimal if amounts are out of 100
        }))
        .sort((a, b) => b.level - a.level)
        .slice(0, limit);
}

export function formatXP(amount) {
    if (amount < 1000) return `${amount} XP`;
    if (amount < 1000000) return `${(amount / 1000).toFixed(2)} KB`;
    return `${(amount / 1000000).toFixed(2)} MB`;
}

function setElementTextContent(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`Element with ID ${id} not found.`);
    }
}
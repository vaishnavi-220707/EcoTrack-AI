// ===== BACKEND API BASE URL =====
const API_BASE = 'http://127.0.0.1:5000';

// ===== CHECK LOGIN =====
const loggedInUser = JSON.parse(localStorage.getItem('ecotrack_user'));

if (!loggedInUser) {
    window.location.href = 'login.html';
}

// ===== GAME DATA =====
const LEVELS = [
    { name: '🌱 Beginner', minXp: 0 },
    { name: '🌿 Green Explorer', minXp: 100 },
    { name: '🌳 Eco Warrior', minXp: 300 },
    { name: '🌍 Earth Protector', minXp: 600 },
    { name: '♻️ Sustainability Master', minXp: 1000 }
];

const BADGES = [
    { id: 'first_step', icon: '👣', name: 'First Step', condition: (s) => s.challenges_completed >= 1 },
    { id: 'week_streak', icon: '🔥', name: '7 Day Streak', condition: (s) => s.streak >= 7 },
    { id: 'ten_challenges', icon: '🏅', name: '10 Challenges', condition: (s) => s.challenges_completed >= 10 },
    { id: 'calculator_used', icon: '🧮', name: 'Footprint Checked', condition: (s) => s.calculators_used >= 1 },
    { id: 'level_up', icon: '⭐', name: 'Leveled Up', condition: (s) => s.xp >= 100 },
    { id: 'eco_master', icon: '👑', name: 'Eco Master', condition: (s) => s.xp >= 1000 }
];

const DAILY_CHALLENGES = [
    'Carry a reusable bottle instead of buying plastic.',
    'Turn off lights when leaving a room today.',
    'Walk or cycle instead of driving for one trip.',
    'Unplug devices that are not in use.',
    'Take a shower under 5 minutes today.',
    'Eat one plant-based meal today.',
    'Say no to a plastic bag today.'
];

let stats = null;

async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE}/api/stats/${loggedInUser.user_id}`);
        stats = await response.json();
        renderAll();
    } catch (error) {
        console.error('Could not load stats from backend:', error);
    }
}

async function saveStats() {
    try {
        await fetch(`${API_BASE}/api/stats/${loggedInUser.user_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stats)
        });
    } catch (error) {
        console.error('Could not save stats to backend:', error);
    }
}

function getCurrentLevel(xp) {
    let current = LEVELS[0];
    let next = LEVELS[1];
    for (let i = 0; i < LEVELS.length; i++) {
        if (xp >= LEVELS[i].minXp) {
            current = LEVELS[i];
            next = LEVELS[i + 1] || null;
        }
    }
    return { current, next };
}

function renderWelcome() {
    const heading = document.querySelector('.dashboard-header h1');
    if (heading && loggedInUser) {
        heading.textContent = `Welcome back, ${loggedInUser.name} 👋`;
    }
}

function renderLevel() {
    const { current, next } = getCurrentLevel(stats.xp);
    const levelTitle = document.getElementById('levelTitle');
    const xpText = document.getElementById('xpText');
    const xpBarFill = document.getElementById('xpBarFill');
    if (!levelTitle) return;

    levelTitle.textContent = current.name;

    if (next) {
        const progressInLevel = stats.xp - current.minXp;
        const levelSpan = next.minXp - current.minXp;
        const percent = Math.min(100, (progressInLevel / levelSpan) * 100);
        xpText.textContent = `${stats.xp} / ${next.minXp} XP`;
        xpBarFill.style.width = percent + '%';
    } else {
        xpText.textContent = `${stats.xp} XP — Max Level!`;
        xpBarFill.style.width = '100%';
    }
}

function renderBadges() {
    const badgesGrid = document.getElementById('badgesGrid');
    if (!badgesGrid) return;

    badgesGrid.innerHTML = BADGES.map(badge => {
        const unlocked = badge.condition(stats);
        return `
            <div class="badge-item ${unlocked ? 'unlocked' : ''}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
            </div>
        `;
    }).join('');
}

function renderChallenge() {
    const challengeText = document.getElementById('challengeText');
    const completeBtn = document.getElementById('completeChallenge');
    if (!challengeText) return;

    const challengeIndex = stats.challenges_completed % DAILY_CHALLENGES.length;
    challengeText.textContent = DAILY_CHALLENGES[challengeIndex];

    const today = new Date().toDateString();
    if (stats.last_challenge_date === today) {
        completeBtn.textContent = '✅ Completed Today';
        completeBtn.disabled = true;
    } else {
        completeBtn.textContent = 'Mark Complete';
        completeBtn.disabled = false;
    }
}

function updateEcoScore() {
    const ecoScoreEl = document.getElementById('ecoScore');
    if (!ecoScoreEl) return;
    const score = Math.min(100, 50 + Math.floor(stats.xp / 10));
    ecoScoreEl.textContent = score;
}

function renderAll() {
    renderWelcome();
    renderLevel();
    renderBadges();
    renderChallenge();
    updateEcoScore();
}

async function completeChallenge() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (stats.last_challenge_date === today) return;

    if (stats.last_challenge_date === yesterday) {
        stats.streak += 1;
    } else {
        stats.streak = 1;
    }

    stats.xp += 20;
    stats.challenges_completed += 1;
    stats.last_challenge_date = today;

    await saveStats();
    renderAll();
}

document.addEventListener('DOMContentLoaded', () => {
    if (!loggedInUser) return;

    fetchStats();

    const completeChallengeBtn = document.getElementById('completeChallenge');
    if (completeChallengeBtn) {
        completeChallengeBtn.addEventListener('click', completeChallenge);
    }

    const logoutLink = document.querySelector('.logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', () => {
            localStorage.removeItem('ecotrack_user');
        });
    }
});

const weeklyCarbonData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [18, 22, 15, 25, 20, 12, 30]
};

const usageBreakdownData = {
    labels: ['Transport', 'Electricity', 'Food', 'Water'],
    values: [40, 25, 20, 15]
};

const carbonCtx = document.getElementById('carbonChart');
if (carbonCtx) {
    new Chart(carbonCtx, {
        type: 'line',
        data: {
            labels: weeklyCarbonData.labels,
            datasets: [{
                label: 'CO₂ (kg)',
                data: weeklyCarbonData.values,
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.15)',
                tension: 0.4,
                fill: true
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

const usageCtx = document.getElementById('usageChart');
if (usageCtx) {
    new Chart(usageCtx, {
        type: 'doughnut',
        data: {
            labels: usageBreakdownData.labels,
            datasets: [{
                data: usageBreakdownData.values,
                backgroundColor: ['#2ecc71', '#27ae60', '#a8e6cf', '#58c99b']
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}
// ===== EMISSION FACTORS =====
// These are simplified average estimates (kg CO2 per unit), commonly used for basic calculators.
const FACTORS = {
    carPerKm: 0.192,          // kg CO2 per km driven
    flightPerHour: 90,        // kg CO2 per flight hour
    electricityPerKwh: 0.475, // kg CO2 per kWh
    diet: {
        meat: 3.3,        // kg CO2 per day
        mixed: 2.5,
        vegetarian: 1.7,
        vegan: 1.5
    }
};

const calcForm = document.getElementById('calcForm');
const calcResult = document.getElementById('calcResult');

if (calcForm) {
    calcForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // ===== GET INPUT VALUES =====
        const carKm = parseFloat(document.getElementById('carKm').value) || 0;
        const flightHours = parseFloat(document.getElementById('flightHours').value) || 0;
        const electricity = parseFloat(document.getElementById('electricity').value) || 0;
        const dietType = document.getElementById('dietType').value;

        // ===== CALCULATE MONTHLY EMISSIONS (kg CO2) =====
        const carEmissions = carKm * FACTORS.carPerKm;
        const flightEmissions = (flightHours * FACTORS.flightPerHour) / 12; // spread yearly flights across months
        const electricityEmissions = electricity * FACTORS.electricityPerKwh;
        const dietEmissions = (FACTORS.diet[dietType] || FACTORS.diet.mixed) * 30;

        const monthlyTotal = carEmissions + flightEmissions + electricityEmissions + dietEmissions;
        const annualTotal = monthlyTotal * 12;

        // ===== DETERMINE GRADE =====
        let grade, gradeClass, tip;

        if (annualTotal < 2000) {
            grade = 'A — Excellent';
            gradeClass = 'grade-A';
            tip = 'Great job! Your footprint is well below average. Keep it up by maintaining these habits.';
        } else if (annualTotal < 4000) {
            grade = 'B — Good';
            gradeClass = 'grade-B';
            tip = 'You are doing well. Try reducing car travel or switching to renewable electricity where possible.';
        } else if (annualTotal < 6000) {
            grade = 'C — Average';
            gradeClass = 'grade-C';
            tip = 'Consider using public transport more often and reducing flight travel to lower your footprint.';
        } else {
            grade = 'D — High';
            gradeClass = 'grade-D';
            tip = 'Your footprint is above average. Small changes like carpooling, reducing flights, and eating less meat can make a big difference.';
        }

        // ===== DISPLAY RESULT =====
        calcResult.innerHTML = `
            <div class="result-box">
                <h3>${monthlyTotal.toFixed(1)} kg CO₂ / month</h3>
                <p>Estimated annual footprint: ${annualTotal.toFixed(0)} kg CO₂</p>
                <span class="result-grade ${gradeClass}">${grade}</span>
            </div>
            <div class="result-tip">
                💡 <strong>Suggestion:</strong> ${tip}
            </div>
        `;
        calcResult.classList.add('show');

        // ===== AWARD XP FOR USING THE CALCULATOR (shared with dashboard gamification) =====
        const saved = localStorage.getItem('ecotrack_state');
        const gamestate = saved ? JSON.parse(saved) : {
            xp: 0, challengesCompleted: 0, calculatorsUsed: 0, streak: 0, lastChallengeDate: null, challengeIndex: 0
        };
        if (!gamestate.calculatorsUsed) gamestate.calculatorsUsed = 0;
        gamestate.calculatorsUsed += 1;
        gamestate.xp += 10;
        localStorage.setItem('ecotrack_state', JSON.stringify(gamestate));
    });
}
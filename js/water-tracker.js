// ===== WATER USAGE FACTORS =====
// Simplified average estimates (liters per unit)
const WATER_FACTORS = {
    showerPerMinute: 9,      // liters per minute of shower
    laundryPerLoad: 65,      // liters per laundry load
    dishwashingPerMinute: 8  // liters per minute of dishwashing
};

const waterForm = document.getElementById('waterForm');
const calcResult = document.getElementById('calcResult');

if (waterForm) {
    waterForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // ===== GET INPUT VALUES =====
        const shower = parseFloat(document.getElementById('shower').value) || 0;
        const laundryLoads = parseFloat(document.getElementById('laundryLoads').value) || 0;
        const dishwashing = parseFloat(document.getElementById('dishwashing').value) || 0;
        const drinking = parseFloat(document.getElementById('drinking').value) || 0;

        // ===== CALCULATE DAILY USAGE (liters) =====
        const showerUsage = shower * WATER_FACTORS.showerPerMinute;
        const laundryUsage = (laundryLoads * WATER_FACTORS.laundryPerLoad) / 7; // spread weekly loads across days
        const dishwashingUsage = dishwashing * WATER_FACTORS.dishwashingPerMinute;

        const dailyTotal = showerUsage + laundryUsage + dishwashingUsage + drinking;
        const monthlyTotal = dailyTotal * 30;

        // ===== DETERMINE RATING =====
        let grade, gradeClass, tip;

        if (dailyTotal < 100) {
            grade = 'A — Excellent';
            gradeClass = 'grade-A';
            tip = 'Great water efficiency! You are well below the average daily usage.';
        } else if (dailyTotal < 150) {
            grade = 'B — Good';
            gradeClass = 'grade-B';
            tip = 'Solid usage. Try shortening showers by a couple of minutes to save even more.';
        } else if (dailyTotal < 200) {
            grade = 'C — Average';
            gradeClass = 'grade-C';
            tip = 'Consider running laundry only with full loads and reducing shower time.';
        } else {
            grade = 'D — High';
            gradeClass = 'grade-D';
            tip = 'Your usage is above average. Shorter showers and fewer, fuller laundry loads can help a lot.';
        }

        // ===== DISPLAY RESULT =====
        calcResult.innerHTML = `
            <div class="result-box">
                <h3>${dailyTotal.toFixed(0)} L / day</h3>
                <p>Estimated monthly usage: ${monthlyTotal.toFixed(0)} L</p>
                <span class="result-grade ${gradeClass}">${grade}</span>
            </div>
            <div class="result-tip">
                💡 <strong>Suggestion:</strong> ${tip}
            </div>
        `;
        calcResult.classList.add('show');
    });
}
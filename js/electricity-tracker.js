// ===== APPLIANCE POWER RATINGS (kW) =====
// Simplified average power draw per appliance
const APPLIANCE_POWER = {
    ac: 1.5,       // kW
    fan: 0.075,    // kW
    tv: 0.1,       // kW
    laptop: 0.065, // kW
    fridge: 0.15   // kW (runs ~24 hrs, always on if present)
};

const CO2_PER_KWH = 0.475; // kg CO2 per kWh (same factor as carbon calculator)

const electricityForm = document.getElementById('electricityForm');
const calcResult = document.getElementById('calcResult');

if (electricityForm) {
    electricityForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // ===== GET INPUT VALUES =====
        const acHours = parseFloat(document.getElementById('ac').value) || 0;
        const fanHours = parseFloat(document.getElementById('fan').value) || 0;
        const tvHours = parseFloat(document.getElementById('tv').value) || 0;
        const laptopHours = parseFloat(document.getElementById('laptop').value) || 0;
        const hasFridge = parseInt(document.getElementById('fridge').value) || 0;
        const rate = parseFloat(document.getElementById('rate').value) || 0;

        // ===== CALCULATE DAILY USAGE (kWh) =====
        const acUsage = acHours * APPLIANCE_POWER.ac;
        const fanUsage = fanHours * APPLIANCE_POWER.fan;
        const tvUsage = tvHours * APPLIANCE_POWER.tv;
        const laptopUsage = laptopHours * APPLIANCE_POWER.laptop;
        const fridgeUsage = hasFridge ? 24 * APPLIANCE_POWER.fridge : 0;

        const dailyKwh = acUsage + fanUsage + tvUsage + laptopUsage + fridgeUsage;
        const monthlyKwh = dailyKwh * 30;
        const monthlyBill = monthlyKwh * rate;
        const monthlyCO2 = monthlyKwh * CO2_PER_KWH;

        // ===== DETERMINE RATING =====
        let grade, gradeClass, tip;

        if (dailyKwh < 4) {
            grade = 'A — Excellent';
            gradeClass = 'grade-A';
            tip = 'Very efficient usage! Keep using appliances mindfully.';
        } else if (dailyKwh < 7) {
            grade = 'B — Good';
            gradeClass = 'grade-B';
            tip = 'Good usage. Try reducing AC hours slightly or switching to LED lighting.';
        } else if (dailyKwh < 10) {
            grade = 'C — Average';
            gradeClass = 'grade-C';
            tip = 'Consider using a fan instead of AC when possible, and unplug devices not in use.';
        } else {
            grade = 'D — High';
            gradeClass = 'grade-D';
            tip = 'Usage is high. Reducing AC hours and switching to energy-efficient appliances can lower this significantly.';
        }

        // ===== DISPLAY RESULT =====
        calcResult.innerHTML = `
            <div class="result-box">
                <h3>${dailyKwh.toFixed(1)} kWh / day</h3>
                <p>Estimated monthly usage: ${monthlyKwh.toFixed(0)} kWh — Bill: ₹${monthlyBill.toFixed(0)}</p>
                <p>Estimated monthly CO₂: ${monthlyCO2.toFixed(1)} kg</p>
                <span class="result-grade ${gradeClass}">${grade}</span>
            </div>
            <div class="result-tip">
                💡 <strong>Suggestion:</strong> ${tip}
            </div>
        `;
        calcResult.classList.add('show');
    });
}
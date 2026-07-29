// ===== DARK MODE TOGGLE =====
const themeToggle = document.getElementById('themeToggle');

// Check if user already chose a theme before (saved in this browser session)
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.textContent = '☀️';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// ===== MOBILE HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
const navButtons = document.querySelector('.nav-buttons');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('show');
        navButtons.classList.toggle('show');
    });
}

// ===== SMOOTH SCROLL FOR NAV LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== CONTACT FORM (basic front-end only for now) =====
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Thanks for reaching out! We will get back to you soon.');
        contactForm.reset();
    });
}
# 🌍 EcoTrack AI

EcoTrack AI is a full-stack sustainability tracking web app that helps users monitor their carbon footprint, track daily eco-habits, and get AI-powered guidance on living more sustainably — all while earning XP and badges for good habits.

## ✨ Features

- 🔐 **User Accounts** — Secure signup/login with hashed passwords, backed by a SQLite database
- 🌱 **Carbon Footprint Calculator** — Estimates monthly carbon footprint based on travel, electricity use, and diet
- 💧 **Water Usage Tracker** — Log and monitor daily water consumption
- ⚡ **Electricity Usage Tracker** — Log and monitor daily electricity consumption
- ♻️ **AI Waste Classifier** — Upload a photo of an item and get instant AI-powered guidance on how to dispose of it (recyclable, organic, hazardous, or general waste), powered by Google's Gemini API
- 💬 **EcoBot AI Assistant** — A friendly chatbot (also powered by Gemini) that answers sustainability questions and gives practical eco-tips
- 🏆 **Gamification** — Earn XP, level up, maintain streaks, unlock badges, and complete daily eco-challenges
- 📊 **Dashboard** — Visual charts and stats summarizing your weekly environmental impact
- 🌗 **Dark Mode** — Full dark mode support across the site

## 🛠️ Tech Stack

**Frontend:** HTML, CSS, JavaScript, Chart.js
**Backend:** Python (Flask), Flask-CORS
**Database:** SQLite
**AI:** Google Gemini API (`gemini-flash-latest`) for the chatbot and image classification

## 📁 Project Structure


EcoTrack-AI/
├── backend/
│ ├── app.py # Flask backend & API routes
│ ├── requirements.txt # Python dependencies
│ └── ecotrack.db # SQLite database
├── css/ # Stylesheets for each page
├── js/ # JavaScript for each page/feature
├── index.html # Landing page
├── login.html / signup.html # Auth pages
├── dashboard.html # Main dashboard
├── calculator.html # Carbon footprint calculator
├── water-tracker.html # Water usage tracker
├── electricity-tracker.html # Electricity usage tracker
├── waste-classifier.html # AI waste image classifier
└── README.md

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Setup

1. Clone the repo:
```bash
git clone https://github.com/vaishnavi-220707/EcoTrack-AI.git
cd EcoTrack-AI
```

2. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Create a `.env` file inside the `backend` folder with your Gemini API key:GEMINI_API_KEY=your-api-key-here

4. Run the backend:
```bash
python app.py
```
The backend will start on `http://127.0.0.1:5000`.

5. Open `index.html` in your browser (or serve the frontend with a tool like VS Code's Live Server extension).

## 🔒 Environment Variables

This project requires a `.env` file (not committed to the repo) containing:

GEMINI_API_KEY=your-gemini-api-key



## 📄 License

This project is for educational purposes.

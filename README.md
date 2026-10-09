# City Life — Smart City Explorer

> A modern, professional, and responsive web application built for Prompt Wars Hackathon.

![City Life Smart Explorer](https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80)

## 🌆 About The Project

**City Life — Smart City Explorer** helps citizens and travelers explore cities with confidence, discover top tourist attractions, authentic street food, and hotels, understand local culture, compare places side-by-side, and access real-time safety & city advisories.

### ✨ Key Features

1. **Home Dashboard & City Picker**: Quick city selection for Mumbai, Pune, Delhi, Bengaluru, London, and Tokyo.
2. **Interactive Leaflet Map**: Custom category pins with popups detailing ratings, safety scores, and wheelchair accessibility.
3. **Categorized Cards & Places**: Attractions, Food & Dining, Hotels, Historical Landmarks, and Budget Spots.
4. **Smart Filters**: Filter by category, price level (`$` to `$$$$`), minimum rating, wheelchair accessibility, and verified high-safety rating.
5. **Side-by-Side Comparison Matrix**: Compare 2 or more places across ratings, price estimates, safety indices, night lighting, step-free access, and police station distance.
6. **AI City Assistant**: Connected to Express backend API supporting **Google Gemini 1.5 Flash** (`@google/generative-ai`) with intelligent local fallback mode.
7. **City Alerts & Advisories**: Traffic, Weather, and Safety updates clearly tagged with `[Sample Data / Simulated Alert]` vs `[Community Reported]`.
8. **Citizen Reporting Form**: Submit city issues with location, description, urgency, and optional photo upload.
9. **Trilingual Support**: Full i18n support for **English**, **मराठी (Marathi)**, and **हिंदी (Hindi)**.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet & React-Leaflet
- **Backend**: Node.js, Express, Cors, Dotenv
- **AI Integration**: `@google/generative-ai` (Gemini 1.5 Flash)
- **Design Style**: Premium Travel-Tech dark navy theme (`#070a12`), blue & purple accents, glassmorphism cards.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation

```bash
# Clone the repository
git clone https://github.com/vaishurathod2410-creator/PROMPT-WAR.git
cd PROMPT-WAR

# Install dependencies
npm install
```

### Running the Application

```bash
# Start backend Express server (Port 5000)
npm run server

# Start frontend Vite server (Port 3000)
npm run dev
```

Open `http://localhost:3000/` in your browser.

---

## 🔑 Environment Setup (Google Gemini API)

Create a `.env` file in the project root:

```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

Get a free key from [Google AI Studio](https://aistudio.google.com/).

---

## 📜 License

Distributed under the MIT License. Built for **Prompt Wars Hackathon**.

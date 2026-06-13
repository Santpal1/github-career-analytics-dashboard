# DevMetrics AI: GitHub Career Analytics Dashboard

[![Vite](https://img.shields.io/badge/Vite-8.0.0-blue.svg)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.5-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-purple.svg)](https://aistudio.google.com/)

A premium full-stack portfolio-grade web application that acts as a **"Fitbit for Software Developers."** It scans public GitHub profiles and repository structures to output recruiter-friendly dossiers, technical skill allocations, codebase diagnostics, and AI-powered career recommendations.

---

## 🚀 Key Features

* **GitHub Profile Analysis**: Scans public bio, location, followers, following, and repository metrics.
* **Repository Analytics**: Calculates popularity, activity, documentation density, and maintenance rating indexes for all repositories.
* **Skill Detection Engine**: Scans configuration files (`package.json`, `requirements.txt`, etc.) to automatically map backend, frontend, database, and cloud allocations.
* **Career Path Recommender**: Map confidence ratings for software developer roles (Backend, Frontend, Full Stack, DevOps, AI/ML, Data).
* **Project Quality Analyzer**: Modal-based diagnostics showing strengths, weaknesses, and direct suggestions to improve code documentation and hygiene.
* **Resume Project Selector**: Ranks repositories to recommend the top 3 projects to highlight on a resume and projects to keep off.
* **RecruiterSnapshot (Print PDF)**: Compact, print-optimized one-page dossier with technical rating bars and a recommendation summary.
* **Heatmap & Streak Tracker**: Groups daily contribution frequencies into a 53-week columns grid.
* **Gemini AI Career Reviews**: Summarizes telemetry data using Google Gemini (`gemini-2.5-flash`) to generate structured developer evaluations and hiring probability estimates.

---

## 🛠 Tech Stack

### Frontend
* **Core**: React, Vite
* **Routing**: React Router (v6)
* **Styling**: Tailwind CSS (v3) with dynamic glassmorphism and custom dark-mode variables
* **Charts**: Recharts
* **HTTP Client**: Axios

### Backend
* **Server**: Node.js, Express.js
* **Auth**: JSON Web Tokens (JWT)
* **Database Driver**: MySQL2

### Database
* **Database**: MySQL (automatically creates and configures schemas on startup)

### AI Core
* **Model**: Google Gemini 2.5 Flash

---

## 📂 Database Design

The application uses **MySQL** to cache and index profile telemetry:

* **`users`**: Stores avatar, bio, location, followers, and overall metrics (Career Score, Consistency, OS Readiness).
* **`repositories`**: Stores stars, forks, and sub-score metrics (Activity, Quality, Documentation, Maintenance, Popularity).
* **`skills`**: Maps programming languages and category focuses (Frontend, Backend, etc.).
* **`career_recommendations`**: Stores recommended engineering tracks and confidence levels.
* **`ai_reviews`**: Caches Gemini-generated recruiter summaries and suggestion telemetry.

---

## ⚙️ Local Setup Instructions

### Prerequisites
* **Node.js** (v18+)
* **MySQL / XAMPP MySQL** (Running on port `3306` with `root` and no password by default)

### 1. Clone the repository
```bash
git clone https://github.com/Santpal1/github-career-analytics-dashboard.git
cd github-career-analytics-dashboard
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=github_career_analytics
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_key
```

### 3. Install Dependencies
Install all package dependencies concurrently:
```bash
npm run install:all
```

### 4. Launch the Application
Run the frontend and backend concurrently in development mode:
```bash
npm run dev
```

* Express API will launch on: `http://localhost:5000`
* React-Vite web server will launch on: `http://localhost:5173`

---

## 🧑‍💻 Usage
1. Open `http://localhost:5173` in your browser.
2. Enter any GitHub username (e.g. `gaearon`) or click **"🚀 View standard recruiter demo profile"** to load the pre-configured recruiter dashboard immediately.
3. Toggle tabs to explore repositories, skill radar charts, and recruiter snapshots. Click **Print or Save PDF** on the dossier page to export a professional resume summary.

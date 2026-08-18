# AI Resume & Mock Interview Coach

An intelligent, full-stack application designed to help job seekers build ATS-optimized resumes, receive instant AI feedback, practice mock interviews with real-time evaluation, and monitor system-wide resume analytics.

---

## 🌟 Overview

The **AI Resume & Mock Interview Coach** combines interactive resume authoring, server-side PDF ingestion, AI-driven ATS (Applicant Tracking System) scoring, role-tailored mock interview simulation, and a hardened security-audited analytics portal.

### Key Highlights
- **Interactive Resume Builder**: Real-time A4 page preview, multi-template styling, automatic page boundary detection, dynamic field improvement, and client-side multi-page PDF export (`html2pdf.js`).
- **PDF Resume Ingestion**: Server-side document extraction powered by **Apache PDFBox** to automatically map uploaded resumes into editable builder structures.
- **AI ATS Scoring & Analysis**: Uses Groq's **GPT OSS 120B / Qwen3.6 27B** models to analyze resumes against target Job Descriptions, extracting keyword match percentages, missing core competencies, and section-by-section improvement strategies.
- **AI Mock Interview Coach**: Generates dynamic technical and behavioral interview questions tailored to the candidate's background and target job description, rating user responses on clarity, relevancy, and STAR methodology.
- **Hardened Admin Analytics**: Secured administrative dashboard visualizing ATS trends over time, top missing skill gaps, and in-demand keywords across analyzed job descriptions.

---

## 📸 Screenshots

![Resume Builder with real-time A4 preview](https://raw.githubusercontent.com/Ramu9047/ai-resume-mock-interview-coach/main/docs/screenshots/builder.png?v=3)
*Figure 1: Resume Builder with real-time A4 preview, dynamic page-break indicators, and multi-page PDF export.*

![AI ATS Analysis View](https://raw.githubusercontent.com/Ramu9047/ai-resume-mock-interview-coach/main/docs/screenshots/ats_analysis.png?v=3)
*Figure 2: AI ATS Analysis displaying match scores, keyword gaps, and actionable recommendations.*

![Hardened Admin Analytics Dashboard](https://raw.githubusercontent.com/Ramu9047/ai-resume-mock-interview-coach/main/docs/screenshots/admin_dashboard.png?v=3)
*Figure 3: Hardened Admin Analytics Dashboard showing aggregate metrics, ATS score distribution, and top skill gap charts.*

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Custom CSS Design System (dark-mode glassmorphism, responsive grid, dynamic micro-animations)
- **Icons**: Lucide React
- **PDF Export**: `html2pdf.js` & `html2canvas` (with print-budget layout protection and break-inside prevention)

### Backend
- **Framework**: Spring Boot 3.4 (Java 21 / 17+)
- **Database**: MongoDB (Spring Data MongoDB)
- **AI Engine**: Groq REST API (`openai/gpt-oss-20b`)
- **PDF Processing**: Apache PDFBox 3.0
- **Logging**: Logback with dedicated isolated security audit logger (`logs/admin_audit.log`)

---

## 🔐 Security & Hardening Features

The Admin Analytics portal incorporates multi-layered security protections:
1. **Unlisted Access**: Admin routes are unlisted from public navigation and require explicit credential authentication.
2. **Constant-Time Comparison**: Credential validation uses `MessageDigest.isEqual` to prevent timing side-channel attacks.
3. **IP Rate-Limiting**: Enforces a sliding window rate-limit (maximum 5 failed attempts per 15 minutes per IP).
4. **Token Security at Rest**: Active session tokens are stored in memory and on disk exclusively as **SHA-256 cryptographic hashes**.
5. **Disk State Persistence**: Lockout state and token expiration timestamps survive application restarts (`logs/admin_security_state.json`).
6. **Isolated Audit Log**: Security audit events (`[ADMIN AUDIT]`) are routed to a dedicated Logback appender (`logs/admin_audit.log`) with zero application log pollution.

---

## 🐳 Docker Containerization

The repository includes complete multi-stage Dockerfiles and a `docker-compose.yml` stack orchestrating MongoDB, Spring Boot Backend, and Nginx Frontend.

### Quick Start with Docker Compose

1. Copy `.env.example` to `.env` and fill in your `GROQ_API_KEY`:
   ```bash
   cp .env.example .env
   ```

2. Build and launch the entire stack:
   ```bash
   docker compose up --build -d
   ```

3. Access the services:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8080/api/health
   - **MongoDB**: localhost:27017

---

### 📦 Docker Hub Build & Push Commands

To build and publish standalone images to your Docker Hub repository:

#### 1. Login to Docker Hub
```bash
docker login
```

#### 2. Build & Push Backend Image
```bash
# Build backend image with tag
docker build -t <your-dockerhub-username>/resume-coach-backend:latest ./backend

# Push backend image to Docker Hub
docker push <your-dockerhub-username>/resume-coach-backend:latest
```

#### 3. Build & Push Frontend Image
```bash
# Build frontend image (optionally pass VITE_API_BASE_URL)
docker build --build-arg VITE_API_BASE_URL=https://your-render-backend.onrender.com \
  -t <your-dockerhub-username>/resume-coach-frontend:latest ./frontend

# Push frontend image to Docker Hub
docker push <your-dockerhub-username>/resume-coach-frontend:latest
```

---

## 🌐 Production Deployment Guide

### Option 1: Deploy Backend on Render & Frontend on Vercel

#### A. Backend Deployment (Render)

1. Sign in to [Render](https://render.com/).
2. Create a new **Web Service** and connect your repository (or use the included `render.yaml` Blueprint).
3. Set the build parameters:
   - **Root Directory**: `backend`
   - **Environment**: Docker (or Java Web Service)
   - **Dockerfile Path**: `Dockerfile`
   - **Health Check Path**: `/api/health`
4. Set the Environment Variables:
   - `GROQ_API_KEY`: Your Groq API key from console.groq.com
   - `MONGODB_URI`: Your MongoDB Atlas URI (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/resume_coach`)
   - `ADMIN_ANALYTICS_SECRET`: Secret key for Admin Analytics dashboard
   - `ALLOWED_ORIGINS`: `https://ai-resume-mock-interview-coach.vercel.app`
5. Click **Deploy Web Service**. Render will expose a public backend URL (e.g., `https://resume-coach-backend.onrender.com`).

#### B. Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New Project** and import your repository.
3. Set the project configuration:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://resume-coach-backend.onrender.com` (Your Render backend URL)
5. Click **Deploy**. Vercel will build and host your frontend globally.

---

## 🚀 Local Development Setup

### Prerequisites
- **Java 17/21**
- **Maven 3.8+**
- **Node.js 20+** & npm
- **MongoDB** running locally on default port `27017`
- **Groq API Key** ([console.groq.com](https://console.groq.com/keys))

### Step 1: Run the Backend

```bash
cd backend
mvn spring-boot:run
```
Backend starts on **http://localhost:8080**.

### Step 2: Run the Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend starts on **http://localhost:5173**.

---

## 📂 Project Structure

```text
AI Resume & Mock Interview Coach/
├── backend/
│   ├── src/main/java/com/resumecoach/
│   │   ├── config/          # Web & Security CORS configurations
│   │   ├── controller/      # REST Controllers (Resume, Interview, Builder, Admin, Health)
│   │   ├── model/           # MongoDB Entities & DTO Data Models
│   │   ├── repository/      # Spring Data Mongo Repositories
│   │   └── service/         # Business Logic (Groq AI, PDFBox Parsing, Admin Auth)
│   ├── src/main/resources/  # application.properties & logback-spring.xml
│   ├── Dockerfile           # Multi-stage Maven + Temurin JRE Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Centralized Axios API client
│   │   ├── components/      # Navigation, Resume Preview, Hardened Lockscreen
│   │   ├── pages/           # Builder, Upload, Feedback, Interview, Admin Analytics
│   │   └── index.css        # Core Design System & A4 Print Budget CSS
│   ├── Dockerfile           # Multi-stage Node + Nginx Dockerfile
│   ├── nginx.conf           # SPA Nginx Routing Configuration
│   ├── vercel.json          # Vercel Deployment & Rewrites
│   └── package.json
│
├── docker-compose.yml       # Full-stack orchestrator (MongoDB + Backend + Frontend)
├── render.yaml              # Render Cloud Infrastructure Blueprint
├── .env.example
├── .gitignore
└── README.md
```

---

## 📄 License

This showcase project is open source and available under the [MIT License](LICENSE).

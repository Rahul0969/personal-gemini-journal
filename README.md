🧠 Personal Gemini Journal

«Write. Understand. Track. Reflect.»

Personal Gemini Journal is an AI-powered private journaling companion that transforms everyday journal entries into meaningful reflections, emotional insights, mood patterns, and practical actions.

Instead of simply storing journal entries, the application helps users understand what they write and recognize patterns in their thoughts and emotions over time.

Built for the Google AI Academy APAC Ideathon 2026.

---

✨ Why Personal Gemini Journal?

Journaling can help people reflect, but reviewing weeks or months of entries manually can make it difficult to identify recurring emotions, themes, and behavioral patterns.

Personal Gemini Journal adds an AI-powered reflection layer to journaling.

The core idea

Write → Understand → Track → Reflect

Users write naturally, while Gemini helps transform their entry into structured insights.

---

🚀 Features

📝 AI Journal Analysis

Write a journal entry and receive an AI-generated analysis including:

- Concise summary
- Overall mood
- Mood score
- Detected emotions
- Key themes
- Personal reflection
- Helpful insight
- Suggested action

---

💭 Emotional Insights

Gemini identifies the emotions expressed in an entry and presents them in an easy-to-understand format.

The system uses supportive, non-clinical language and does not attempt to diagnose mental health conditions.

---

📊 Mood Tracking

The dashboard helps users understand their mood over time through:

- Total journal entries
- Average mood score
- Latest mood
- Mood history
- Mood trends

---

📚 Journal History

Users can:

- Save analyzed journal entries
- Review previous reflections
- Revisit AI-generated insights
- Delete individual entries

Journal data is associated with the authenticated user's account.

---

🔐 Private User Data

Authentication is handled through Firebase Authentication.

Firestore security rules ensure that users can access only their own journal documents.

---

🤖 How Gemini Is Used

Gemini is the core intelligence layer of the application.

For every journal entry, the backend sends a structured prompt to Gemini asking it to produce a consistent analysis.

The AI response is structured around:

Journal Entry
      ↓
Gemini Analysis
      ↓
Summary
Mood
Mood Score
Emotions
Key Themes
Reflection
Helpful Insight
Suggested Action

This makes the output useful not only as a chatbot response, but also as structured data that can power the application's dashboard.

---

🏗️ System Architecture

                    ┌─────────────────────┐
                    │      User           │
                    │   Journal Entry     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React + Vite      │
                    │     Frontend        │
                    │      Vercel         │
                    └──────────┬──────────┘
                               │
                         REST API Request
                               │
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │      Backend        │
                    │       Render        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Gemini API       │
                    │   AI Analysis       │
                    └──────────┬──────────┘
                               │
                         Structured Insight
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Firestore       │
                    │   Journal Storage   │
                    └─────────────────────┘

---

🧩 Technology Stack

Frontend

- React
- Vite
- JavaScript
- CSS
- Firebase Authentication
- Firebase Firestore

Backend

- Python
- FastAPI
- Uvicorn
- Python-dotenv
- Google Gen AI SDK

AI

- Google Gemini API
- Gemini Flash model

Database & Authentication

- Firebase Authentication
- Cloud Firestore

Deployment

- Vercel — Frontend
- Render — Backend
- Firebase — Authentication & Database

---

🔄 Application Workflow

1. Authentication

The user signs up or logs in using email and password.

2. Journal Entry

The user writes a personal reflection.

3. AI Analysis

The frontend sends the journal text to the FastAPI backend.

4. Gemini Processing

The backend sends the journal entry to Gemini with a structured analysis prompt.

5. Insight Generation

Gemini returns:

- Mood
- Mood score
- Emotions
- Themes
- Reflection
- Insight
- Suggested action

6. Persistence

The journal entry and generated analysis are stored in the user's Firestore collection.

7. Reflection Dashboard

The user can review their history and observe mood patterns over time.

---

🔐 Security & Privacy

Personal journaling data can be sensitive, so the application follows a separation-of-responsibilities architecture.

Gemini API Key

The Gemini API key is stored only on the backend.

Frontend
   │
   │ Journal text
   ▼
Backend
   │
   │ Gemini API Key
   ▼
Gemini

The Gemini API key is never exposed through the React frontend.

Firestore Security

Journal documents are organized by authenticated user:

users/{userId}/journals/{journalId}

Firestore rules restrict access so that an authenticated user can read and write only their own journal entries.

---

🌐 Deployment

The application is deployed as two independent services.

Frontend

React + Vite
        ↓
      Vercel

Backend

FastAPI
   ↓
Render
   ↓
Gemini API

Database

Firebase Authentication
        +
Cloud Firestore

---

⚙️ Local Development

Prerequisites

- Python 3.12+
- Node.js
- npm
- Firebase project
- Gemini API key

---

Clone the repository

git clone https://github.com/YOUR_USERNAME/personal-gemini-journal.git
cd personal-gemini-journal

---

🐍 Backend Setup

Move into the backend directory:

cd backend

Create a virtual environment:

python -m venv .venv

Activate it on Windows:

.venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Create:

backend/.env

Add:

GEMINI_API_KEY=your_gemini_api_key

Start the backend:

uvicorn app.main:app --reload

The API will be available at:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs

---

⚛️ Frontend Setup

Open another terminal and move into the frontend:

cd frontend

Install dependencies:

npm install

Create:

frontend/.env

Add your Firebase configuration and backend URL:

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_API_URL=http://127.0.0.1:8000

Start the development server:

npm run dev

The frontend will be available at:

http://localhost:5173

---

📁 Project Structure

personal-gemini-journal/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .gitignore
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── firebase.js
│   │   ├── gemini.js
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
│
├── .gitignore
└── README.md

---

🔑 Environment Variables

Frontend

The frontend uses:

VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_API_URL

Backend

The backend uses:

GEMINI_API_KEY

Never commit ".env" files or secret API keys to GitHub.

---

💰 Zero-Cost Deployment Goal

Personal Gemini Journal was designed with a ₹0 / $0 production and deployment goal, using free-tier services where available.

The architecture avoids introducing unnecessary paid infrastructure.

Core services:

- Firebase Spark plan
- Vercel
- Render free tier where available
- Gemini API within available usage limits

«Free-tier limits and provider policies may change. The project is designed to minimize infrastructure cost rather than depend on paid services.»

---

🧠 AI Design Principles

Personal Gemini Journal is designed around several principles:

Supportive, not clinical

The AI provides reflections and general insights rather than medical or psychological diagnoses.

Structured AI output

The Gemini prompt requests a consistent schema so that the application can transform natural-language journal entries into useful dashboard data.

Action-oriented reflection

The system does not stop at identifying emotions. It also generates practical suggested actions.

Long-term reflection

Individual journal analyses become more useful when viewed together through mood history and recurring themes.

---

🔮 Future Improvements

Potential future enhancements include:

- Weekly AI reflection summaries
- Recurring theme detection
- Long-term emotional trend analysis
- Personalized reflection prompts
- Calendar-based journal visualization
- Voice journaling
- Multilingual journaling
- Local-first/private processing options
- Exportable personal insight reports
- More advanced Gemini-powered personal reflection

---

🎯 Ideathon Relevance

Personal Gemini Journal demonstrates how generative AI can be integrated into an everyday productivity and self-reflection workflow.

The project combines:

Generative AI + Personal Data + Structured Insights + Visualization + Secure Storage

Instead of using Gemini only as a conversational chatbot, the project uses Gemini as an intelligence layer inside a complete user-facing product.

---

👨‍💻 Built With

Built using Google's Gemini AI technology along with modern web technologies and Firebase services.

Project

Personal Gemini Journal

Concept

AI-powered personal reflection and mood intelligence

Development Focus

Generative AI
Full-Stack Development
Firebase
Cloud Deployment
Data Visualization
Privacy-Aware Design

---

📄 License

This project is available for educational and demonstration purposes.
# Personal Gemini Journal

A security-first AI journaling and brainstorming application powered by Gemini.

## Core Requirements

- Firebase Authentication
- Multi-turn Gemini conversations
- User-isolated Cloud Firestore storage
- Secure secret management
- Automatic conversation summarization

## Security Principles

- No hardcoded API keys
- No committed credentials
- Every authenticated request is associated with a verified user
- User data is isolated by Firebase UID
- Secrets are retrieved server-side
- Input validation and authorization are enforced at the backend

## Zero-Cost Development Goal

This project is being developed with a ₹0 intended-cost constraint.

No paid resource should be enabled or deployed without checking its billing implications first.

## Architecture

```text
User
│
▼
React Frontend
│
│ Firebase Authentication
▼
FastAPI Backend
│
├── Verify Firebase ID Token
│
├── Gemini
│
├── Firestore
│
└── Secret Manager

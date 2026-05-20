# 🛡️ UITS IT Club Web Platform

[![Node.js Version](https://img.shields.ly/badge/node-%3E%3D%2016.0.0-blue.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Database Mode](https://img.shields.ly/badge/Database-Mongoose%20%2F%20JSON%20Fallback-success.svg?style=for-the-badge&logo=mongodb)](docs/ARCHITECTURE.md)
[![License: ISC](https://img.shields.ly/badge/License-ISC-purple.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)
[![Cybersecurity Theme](https://img.shields.ly/badge/Theme-Premium%20Cybersecurity-neon.svg?style=for-the-badge)](public/style.css)

Welcome to the **UITS IT Club Web Platform** repository! This application is a fully functional web platform that connects students with learning roadmaps, events, contact forms, and a secure admin management portal.

The platform is powered by a **Node.js/Express** backend and features a **dual-mode database architecture** that automatically falls back to a local JSON database if MongoDB Atlas is offline or blocked.

---

## 🧭 Documentation Portal

To make the codebase accessible and maintainable, we have created a comprehensive, modular documentation suite. Select a guide below to explore specific components:

| Guide | Description | Key Topics |
| :--- | :--- | :--- |
| [**🏛️ System Architecture**](docs/ARCHITECTURE.md) | Technical blueprint & design patterns | Dual-DB fallback details, JWT auth pipeline, UI/UX system tokens |
| [**📡 API Reference**](docs/API_REFERENCE.md) | Full backend REST specification | Endpoint inputs/outputs, schemas, authorization headers |
| [**🛠️ Installation & Setup**](docs/SETUP_GUIDE.md) | Local and production onboarding | Quick start, MongoDB Atlas whitelisting, Formspree setup, `.env` config |
| [**🤝 Contribution Guidelines**](docs/CONTRIBUTING.md) | Development standards | Creating custom schemas, CommonJS patterns, CSS rules, local testing |

---

## 🚀 Key Features

*   **Premium Cybersecurity Theme**: Glowing CSS borders, custom typography (`Outfit` / Monospace), modern glassmorphism panels, dynamic hover animations, and fully responsive layouts.
*   **Study Roadmaps**: Curated learning portals for **Frontend Development**, **General Programming**, and **Cybersecurity** (with user submission support).
*   **Dynamic Event Management**: Live, admin-moderated events served dynamically to the homepage.
*   **Dual Database Architecture (MongoDB Atlas ↔ Local JSON Fallback)**:
    *   Attempts connection to MongoDB Atlas cluster with a 3-second timeout at boot.
    *   Automatically falls back to a local file-based JSON database (`data/*.json`) if connection fails (e.g., due to IP whitelisting or firewall blocks).
    *   Guarantees 100% out-of-the-box local developer functionality without any external database installation.
*   **JWT-Based Authentication**: Secure registration and login with automatic role configuration (`Admin` vs. `General Member`).
*   **Admin Moderation Dashboard**: Advanced control panel for managing members, viewing contact messages, creating/deleting events, and approving or rejecting user-submitted roadmaps.
*   **Dual Contact Routing**: Form submissions are written to the database (remote or local) *and* forwarded to **Formspree** for automated email alerts.

---

## 📁 Project Structure

```plain
uits-it-club-website/
├── data/                  # Local JSON database files (created automatically on fallback)
│   └── User.json          # Seeded admin and local user accounts
├── docs/                  # Modular technical documentation suite [NEW]
│   ├── ARCHITECTURE.md    # System design, fallback engine, and CSS design system
│   ├── API_REFERENCE.md   # Endpoint request headers, parameters, and payloads
│   ├── SETUP_GUIDE.md     # Quick starts, Atlas configuration, and variables
│   └── CONTRIBUTING.md    # Extending models, styling rules, and tests protocol
├── public/                # Frontend static assets
│   ├── css/
│   ├── images/
│   ├── admin.html         # Admin dashboard view
│   ├── frontend.html      # Frontend development roadmaps view
│   ├── index.html         # Main portal landing page
│   ├── programming.html   # Programming roadmaps view
│   ├── script.js          # Client-side API interactions and animations
│   ├── security.html      # Cybersecurity roadmaps view
│   └── style.css          # Core design system stylesheet
├── server/                # Backend code
│   ├── middleware/
│   │   └── auth.js        # JWT verification and Admin-only filters
│   ├── models/
│   │   ├── Event.js       # Event schema rules
│   │   ├── Message.js     # Contact message schema rules
│   │   ├── Roadmap.js     # Learning resource schema rules
│   │   └── User.js        # User credentials & password hashing hooks
│   ├── routes/
│   │   ├── api.js         # Core application routers (Events, Roadmaps, Messages)
│   │   └── auth.js        # Authentication router (Register, Login)
│   └── db.js              # Database wrapper with local fallback
├── .env                   # Environment configuration variables
├── server.js              # Application entry point
├── test_db.js             # Database validation test script
├── package.json           # Project dependencies and script configurations
└── README.md              # Project documentation gateway
```

---

## 🏎️ Running the Application Locally

For detailed setup instructions, including cloud cluster whitelisting, review the [**Installation & Setup Guide**](docs/SETUP_GUIDE.md). Below is the quick-start block:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```ini
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
FORMSPREE_URL=https://formspree.io/f/xlgaoabv
```

### 3. Run Integration Tests
Verify database and wrapper operations:
```bash
node test_db.js
```

### 4. Boot the Server
```bash
# Run in development mode (with nodemon reload)
npm run dev

# Run in production mode
npm start
```
Once active, navigate to: **`http://localhost:5000`**

---

## 🔑 Default Credentials

When running in fallback mode, the database wrapper seeds a default Admin account:
*   **Email**: `04324205191008@uits.edu.bd`
*   **Password**: `password123`

---

## 🛡️ License

This project is configured under the **ISC License**. Designed for the **UITS IT Club**.

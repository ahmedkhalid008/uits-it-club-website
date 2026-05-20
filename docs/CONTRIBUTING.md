# 🤝 Contributing to UITS IT Club Platform

We are excited that you want to contribute to the **UITS IT Club Web Platform**! 

To maintain high code quality, security, and developer experience, please follow these guidelines when adding features, extending database models, or modifying frontend styles.

---

## 🏗️ Folder Conventions

Always maintain the existing modular architecture:
```plain
uits-it-club-website/
├── data/                  # DO NOT commit generated JSON files to git!
├── docs/                  # Project documentation markdown resources
├── public/                # Static frontend assets (HTML, CSS, JS, Images)
├── server/                # Server backend
│   ├── middleware/        # Express route request filters (auth, roles)
│   ├── models/            # Database schema representations
│   └── routes/            # REST API routers (API, Auth)
└── server.js              # Server entry point
```

---

## 💾 Extending Database Models

When creating a new database model, you must use our custom Mongoose wrapper [server/db.js](file:///e:/club%20update%2020%20april%202026/server/db.js) rather than the standard Mongoose package directly. This guarantees 100% database fallback functionality!

### How to Create a New Model

1.  Create a file under `server/models/` (e.g., `server/models/Project.js`).
2.  Import `../db` (the custom driver).
3.  Define the schema using `new mongoose.Schema(...)`.
4.  Export the model compiled via `mongoose.model('ModelName', schema)`.

### Code Example: `server/models/Project.js`
```javascript
const mongoose = require('../db');

const projectSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    githubLink: { 
        type: String, 
        trim: true 
    },
    deployedLink: { 
        type: String, 
        trim: true 
    },
    category: {
        type: String,
        enum: ['Web', 'App', 'AI', 'Cybersecurity'],
        required: true
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Compile and export
module.exports = mongoose.model('Project', projectSchema);
```

---

## 🎨 Coding Standards

### Backend (Node.js & Express)
*   **Module System**: Use CommonJS (`require` and `module.exports`) rather than ES Modules (`import/export`).
*   **Asynchronous Code**: Prefer `async/await` syntax for database and filesystem IO over nested promise chains (`.then()`).
*   **Error Handling**: Wrap all asynchronous operations in `try/catch` blocks and return appropriate status codes (e.g., `400 Bad Request` for validation failures, `404 Not Found` for missing resources, and `500 Internal Server Error`).
*   **Authentication**: Secure sensitive endpoints using `auth` and `adminOnly` middlewares.

### Frontend (HTML, CSS, JS)
*   **Vanilla First**: Do not add bulky UI frameworks (e.g., Tailwind, React, Bootstrap) unless explicitly discussed. Modern vanilla CSS is powerful enough for our custom design system.
*   **Design System Integrity**: When adding elements, always consume the existing CSS variables in [public/style.css](file:///e:/club%20update%2020%20april%202026/public/style.css) (e.g., `var(--primary)`, `var(--card-bg)`, etc.).
*   **Responsiveness**: Design mobile-first. Use modern CSS Grid and Flexbox layouts.
*   **Micro-interactions**: Ensure links and buttons have active transitions and hover scale states.

---

## 🧪 Testing Protocol

Before submitting a Pull Request, you **MUST** run the automated database integration tests to ensure that you have not broken local JSON database fallback or Atlas database schemas:

```bash
node test_db.js
```

### Extending Integration Tests
If you add a new model or API route:
1.  Open [test_db.js](file:///e:/club%20update%2020%20april%202026/test_db.js).
2.  Add a test block to verify that:
    *   The model can be instantiated and saved locally.
    *   Querying matches database expectations.
    *   Relationships can be populated.
3.  Ensure your test data is completely cleaned up in the **Cleanup** phase of the script.

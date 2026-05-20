# 📡 API Reference Specification

This document provides a comprehensive technical specification of all backend REST endpoints on the **UITS IT Club Web Platform**. 

All API endpoints are prefixed with `/api`. Protected routes require a JSON Web Token (JWT) provided in the HTTP `Authorization` header as a `Bearer` token.

---

## 🔒 Authentication Routes (`/api/auth`)

All authentication routes include pre-route middleware that verifies the active database connection. If the database is completely offline or unavailable, the endpoint returns a `503 Service Unavailable` error:
```json
{
  "error": "Database not connected. Please check your MongoDB URI and Atlas Network Access (Whitelist IP)."
}
```

### 1. Register a New Account
Registers a new general member or admin account.

*   **Endpoint**: `POST /api/auth/register`
*   **Authentication**: None
*   **Headers**: 
    *   `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "name": "Alex Mercer",
      "email": "alex.mercer@example.com",
      "password": "securepassword123"
    }
    ```
    > [!NOTE]
    > If the email used is exactly `04324205191008@uits.edu.bd`, the role will automatically be assigned as `Admin`. All other emails are assigned `General Member`.

*   **Success Response (`201 Created`)**:
    ```json
    {
      "user": {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "Alex Mercer",
        "email": "alex.mercer@example.com",
        "role": "General Member",
        "createdAt": "2026-05-21T03:12:35.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
*   **Error Response (`400 Bad Request`)**:
    ```json
    {
      "error": "ValidationError: Email already exists"
    }
    ```

---

### 2. User Login
Authenticates user credentials and returns a secure JWT token.

*   **Endpoint**: `POST /api/auth/login`
*   **Authentication**: None
*   **Headers**:
    *   `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "email": "alex.mercer@example.com",
      "password": "securepassword123"
    }
    ```
*   **Success Response (`200 OK`)**:
    ```json
    {
      "user": {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "Alex Mercer",
        "email": "alex.mercer@example.com",
        "role": "General Member",
        "createdAt": "2026-05-21T03:12:35.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
*   **Error Response (`401 Unauthorized`)**:
    ```json
    {
      "error": "Invalid login credentials"
    }
    ```

---

## 📅 Event Management Routes (`/api/events`)

### 1. Retrieve Events
Fetches a list of all events, sorted by date in ascending order.

*   **Endpoint**: `GET /api/events`
*   **Authentication**: None
*   **Success Response (`200 OK`)**:
    ```json
    [
      {
        "_id": "60d0fe4f5311236168a109cb",
        "title": "Intro to Ethical Hacking",
        "description": "Learn the basics of penetration testing and ethical hacking tools.",
        "date": "2026-06-15T09:00:00.000Z",
        "location": "Lab 4, UITS Campus",
        "image": "/images/hacking-workshop.jpg",
        "category": "Workshop",
        "createdBy": "60d0fe4f5311236168a109ca",
        "createdAt": "2026-05-21T03:12:35.000Z"
      }
    ]
    ```

---

### 2. Create Event
Publishes a new event.

*   **Endpoint**: `POST /api/events`
*   **Authentication**: Admin Only
*   **Headers**:
    *   `Authorization: Bearer <JWT_TOKEN>`
    *   `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "title": "AI & Deep Learning Symposium",
      "description": "Discover the latest advancements in neural networks.",
      "date": "2026-07-22T10:00:00.000Z",
      "location": "Auditorium",
      "image": "/images/ai-symposium.jpg",
      "category": "Seminar"
    }
    ```
*   **Success Response (`211 Created`)**:
    ```json
    {
      "_id": "60d0fe4f5311236168a109cc",
      "title": "AI & Deep Learning Symposium",
      "description": "Discover the latest advancements in neural networks.",
      "date": "2026-07-22T10:00:00.000Z",
      "location": "Auditorium",
      "image": "/images/ai-symposium.jpg",
      "category": "Seminar",
      "createdBy": "admin_user_id_2026",
      "createdAt": "2026-05-21T03:14:00.000Z"
    }
    ```

---

### 3. Delete Event
Deletes an event by ID.

*   **Endpoint**: `DELETE /api/events/:id`
*   **Authentication**: Admin Only
*   **Headers**:
    *   `Authorization: Bearer <JWT_TOKEN>`
*   **Success Response (`200 OK`)**:
    ```json
    {
      "_id": "60d0fe4f5311236168a109cc",
      "title": "AI & Deep Learning Symposium",
      "description": "Discover the latest advancements in neural networks.",
      "date": "2026-07-22T10:00:00.000Z",
      "location": "Auditorium",
      "image": "/images/ai-symposium.jpg",
      "category": "Seminar",
      "createdBy": "admin_user_id_2026",
      "createdAt": "2026-05-21T03:14:00.000Z"
    }
    ```
*   **Error Response (`404 Not Found`)**: Empty body.

---

## 👥 Member Management Routes (`/api/members`)

### 1. List Members
Fetches a list of all registered users holding the `General Member` role.

*   **Endpoint**: `GET /api/members`
*   **Authentication**: Admin Only
*   **Headers**:
    *   `Authorization: Bearer <JWT_TOKEN>`
*   **Success Response (`200 OK`)**:
    ```json
    [
      {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "Alex Mercer",
        "email": "alex.mercer@example.com",
        "role": "General Member",
        "createdAt": "2026-05-21T03:12:35.000Z"
      }
    ]
    ```
    > [!IMPORTANT]
    > For security, the `.select('-password')` modifier is automatically applied to hide bcrypt hashes.

---

### 2. Delete Member
Deletes a member's account.

*   **Endpoint**: `DELETE /api/members/:id`
*   **Authentication**: Admin Only
*   **Headers**:
    *   `Authorization: Bearer <JWT_TOKEN>`
*   **Success Response (`200 OK`)**:
    ```json
    {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "Alex Mercer",
      "email": "alex.mercer@example.com",
      "role": "General Member",
      "createdAt": "2026-05-21T03:12:35.000Z"
    }
    ```
*   **Error Response (`404 Not Found`)**: Empty body.

---

## 🗺️ Learning Roadmap Routes (`/api/roadmaps`)

### 1. Submit a Roadmap Resource
Submits a learning roadmap or helpful tutorial resource for Admin review.

*   **Endpoint**: `POST /api/roadmaps`
*   **Authentication**: Authenticated User (Any role)
*   **Headers**:
    *   `Authorization: Bearer <JWT_TOKEN>`
    *   `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "title": "MDN Web Docs - CSS Layouts",
      "link": "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout",
      "description": "Essential CSS styling guide covering Grid, Flexbox, and floats.",
      "category": "frontend"
    }
    ```
    > [!NOTE]
    > Category must be one of: `frontend`, `programming`, or `security`.
    > Newly submitted roadmaps default to `status: "pending"`.

*   **Success Response (`201 Created`)**:
    ```json
    {
      "_id": "60d0fe4f5311236168a109cd",
      "title": "MDN Web Docs - CSS Layouts",
      "link": "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout",
      "description": "Essential CSS styling guide covering Grid, Flexbox, and floats.",
      "category": "frontend",
      "submittedBy": "60d0fe4f5311236168a109ca",
      "status": "pending",
      "createdAt": "2026-05-21T03:14:10.000Z"
    }
    ```

---

### 2. Fetch Category Roadmaps (Public)
Fetches approved roadmaps under a specific category, sorted by date in descending order.

*   **Endpoint**: `GET /api/roadmaps/:category`
*   **Authentication**: None
*   **URL Parameter**: `category` - must be `frontend`, `programming`, or `security`.
*   **Success Response (`200 OK`)**:
    ```json
    [
      {
        "_id": "60d0fe4f5311236168a109cd",
        "title": "MDN Web Docs - CSS Layouts",
        "link": "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout",
        "description": "Essential CSS styling guide covering Grid, Flexbox, and floats.",
        "category": "frontend",
        "submittedBy": {
          "_id": "60d0fe4f5311236168a109ca",
          "name": "Alex Mercer"
        },
        "status": "approved",
        "createdAt": "2026-05-21T03:14:10.000Z"
      }
    ]
    ```
    > [!IMPORTANT]
    > This public view populates only the submitter's `name`, filtering out email and other metadata for privacy.

---

### 3. Fetch Moderation Roadmaps (Admin Only)
Fetches all submitted roadmaps (regardless of status: approved, pending, or rejected) for administration.

*   **Endpoint**: `GET /api/roadmaps/admin`
*   **Authentication**: Admin Only
*   **Headers**:
    *   `Authorization: Bearer <JWT_TOKEN>`
*   **Success Response (`200 OK`)**:
    ```json
    [
      {
        "_id": "60d0fe4f5311236168a109cd",
        "title": "MDN Web Docs - CSS Layouts",
        "link": "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout",
        "description": "Essential CSS styling guide covering Grid, Flexbox, and floats.",
        "category": "frontend",
        "submittedBy": {
          "_id": "60d0fe4f5311236168a109ca",
          "name": "Alex Mercer",
          "email": "alex.mercer@example.com"
        },
        "status": "pending",
        "createdAt": "2026-05-21T03:14:10.000Z"
      }
    ]
    ```

---

### 4. Update Roadmap Status
Approves or rejects a submitted learning resource.

*   **Endpoint**: `PATCH /api/roadmaps/:id/status`
*   **Authentication**: Admin Only
*   **Headers**:
    *   `Authorization: Bearer <JWT_TOKEN>`
    *   `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "status": "approved"
    }
    ```
    > [!NOTE]
    > Status payload value must be either `"approved"` or `"rejected"`.

*   **Success Response (`200 OK`)**:
    ```json
    {
      "_id": "60d0fe4f5311236168a109cd",
      "title": "MDN Web Docs - CSS Layouts",
      "link": "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout",
      "description": "Essential CSS styling guide covering Grid, Flexbox, and floats.",
      "category": "frontend",
      "submittedBy": "60d0fe4f5311236168a109ca",
      "status": "approved",
      "createdAt": "2026-05-21T03:14:10.000Z"
    }
    ```

---

## 📧 Contact Form Routes (`/api/contact`)

### 1. Submit a Contact Message
Submits a message from the contact form.

*   **Endpoint**: `POST /api/contact`
*   **Authentication**: None
*   **Headers**:
    *   `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "name": "Sarah Connor",
      "email": "sconnor@example.com",
      "message": "When is the next workshop on cryptography?"
    }
    ```
*   **Success Response (`201 Created`)**:
    ```json
    {
      "message": "Message sent successfully"
    }
    ```
    > [!TIP]
    > Messages submitted are written to the database (MongoDB or local JSON) *and* forwarded to the **Formspree** endpoint specified in `FORMSPREE_URL` for real-time email notifications.

---

### 2. View Contact Messages
Retrieves a list of all contact form messages, sorted by creation date in descending order.

*   **Endpoint**: `GET /api/contact/messages`
*   **Authentication**: Admin Only
*   **Headers**:
    *   `Authorization: Bearer <JWT_TOKEN>`
*   **Success Response (`200 OK`)**:
    ```json
    [
      {
        "_id": "60d0fe4f5311236168a109ce",
        "name": "Sarah Connor",
        "email": "sconnor@example.com",
        "message": "When is the next workshop on cryptography?",
        "status": "Unread",
        "createdAt": "2026-05-21T03:14:20.000Z"
      }
    ]
    ```

# 🛠️ Installation & Setup Guide

This guide provides step-by-step instructions to set up, configure, and run the **UITS IT Club Web Platform** in both local development and production environments.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:
*   **Node.js**: `v16.0.0` or higher (recommended: `v18.x` or `v20.x` LTS).
*   **npm**: Node Package Manager (comes bundled with Node.js).
*   **Git**: For cloning the repository.

---

## 🏎️ Quick Start (Local Setup)

### Step 1: Clone the Repository
Clone this repository to your local system and navigate into the project directory:
```bash
git clone https://github.com/ahmedkhalid008/uits-it-club-website.git
cd uits-it-club-website
```

### Step 2: Install Dependencies
Run the standard installer to fetch node modules:
```bash
npm install
```

### Step 3: Run in Local Fallback Mode (No Config Needed!)
The application is pre-configured with a custom database wrapper. You do **not** need a running MongoDB database to test the site locally!
If MONGODB_URI is omitted or database connection fails, it automatically runs in file-based JSON mode.

Simply boot up the server:
```bash
npm run dev
```
Open your browser and navigate to: **`http://localhost:5000`**

---

## 🌐 Production MongoDB Atlas Setup

To connect your application to a persistent cloud database, you must configure a MongoDB Atlas Cluster. Follow these steps:

### Step 1: Create a MongoDB Atlas Account
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register for a free account.
2. Build a new cluster by choosing the **M0 Shared Free Tier**.
3. Select your preferred Cloud Provider and Region (e.g., AWS / N. Virginia), and click **Create**.

### Step 2: Add Database User Credentials
1. In the Atlas sidebar under **Security**, select **Database Access**.
2. Click **Add New Database User**.
3. Set authentication method to **Password**.
4. Create a username and password. Save these credentials; they will be needed for your connection string.
5. Grant the user **Read and Write to Any Database** permissions.

### Step 3: Configure Network Access (IP Whitelisting)
> [!WARNING]
> By default, MongoDB Atlas blocks all incoming external network requests. If your server IP is not whitelisted, the connection will time out, causing the application to fall back to the local database!

1. In the Atlas sidebar under **Security**, select **Network Access**.
2. Click **Add IP Address**.
3. To allow connections from any location (recommended for easy development and dynamic hosting platforms like Render/Heroku):
   *   Click **Allow Access From Anywhere** (this automatically fills `0.0.0.0/0`).
4. To restrict access to your local machine:
   *   Click **Add Current IP Address**.
5. Set the entry state to **Active** and click **Confirm**.

### Step 4: Get Connection String
1. Navigate back to your **Database / Clusters** dashboard.
2. Click **Connect** on your cluster.
3. Select **Drivers** (under Connect to your application).
4. Copy the connection string. It will look like this:
   `mongodb+srv://<db_username>:<db_password>@cluster0.abcde.mongodb.net/uits_it_club?retryWrites=true&w=majority`
5. Replace `<db_username>` and `<db_password>` with your created database credentials.

---

## 📧 Formspree Notification Setup

The contact form submissions are stored in the database and also forwarded to **Formspree** to email the administrator in real time.

### Step 1: Register and Create a Form
1. Visit [Formspree](https://formspree.io) and register a free account.
2. Click **New Form**.
3. Name your form (e.g., `UITS IT Club Contact`) and enter the target email address where you want messages routed.
4. Click **Create Form**.

### Step 2: Copy Endpoint URL
1. Formspree will provide a unique endpoint URL:
   `https://formspree.io/f/xlgaoabv`
2. Copy this endpoint and update your `.env` configuration file.

---

## ⚙️ Environment Configuration (`.env`)

Create a file named `.env` in the root of the project. Fill it using the template below:

```ini
# Application configuration port
PORT=5000

# JSON Web Token Secret
JWT_SECRET=your_long_super_secure_random_string_here

# MongoDB Atlas remote connection string
MONGODB_URI=mongodb+srv://db_user:mySecretPassword123@cluster0.abcde.mongodb.net/uits_it_club?retryWrites=true&w=majority

# Formspree endpoint for routing contact form submissions to emails
FORMSPREE_URL=https://formspree.io/f/xlgaoabv

# Force local JSON database mode (optional)
# Set to 'true' to skip trying Atlas cloud database connection entirely.
USE_LOCAL_DB=false
```

---

## 🏎️ Running the Platform

Once your `.env` is fully set up, you can control the platform with the following commands:

### Running Database Integration Tests
Verify that all schemas, query engines, and database configurations are sound (compatible in both local and cloud modes):
```bash
node test_db.js
```

### Run Server in Development Mode
Starts the server with automatic file reload enabled (`nodemon` watches for edits):
```bash
npm run dev
```

### Run Server in Production Mode
Launches the server:
```bash
npm start
```

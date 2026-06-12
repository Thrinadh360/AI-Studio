# C-SYNC (Campus Synchronization Node)
### High-Performance Standalone Node.js & MySQL Production Server

C-SYNC is a full-stack, real-time geofenced biometry, emergency panic response, and active terminal workstation control node developed using React 19, Vite, Express, and MySQL. It is fully decoupled from PHP and optimized for modern enterprise environments.

---

## 🚀 Quick Start Deployment Guide

### Prerequisite Checklist
- **Node.js**: v18.0 or higher
- **NPM**: v9.0 or higher
- **MySQL Database**: v8.0 or higher (compatible with cPanel, Razorhost, local XAMPP/WAMP, or RDS)

---

## 📂 Project Structure Overview
- `/server.ts` - Master Express API Gateway + Real-time Socket Emulation Pipeline.
- `/src/` - Sovereign client application written in React (Vite-optimized).
- `/mysql_schema.sql` - Complete, production-grade relational layout schema. Includes master users, leave requests, attendance history, and automatic tracking triggers.
- `/public/` - Static assets and launcher web manifests.

---

## 🛠️ Step 1: Install Dependencies
Run the package builder in the unpacked directory to download high-speed Node.js modules:
```bash
npm install
```

---

## 🔑 Step 2: Configure Environment Parameters
Create a `.env` file at the root of the project (copying `.env.example` as a starting point) and populate your credentials:

```env
# Server Port Configuration
PORT=3000

# Gemini API Integration
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# Telegram Notification Bot Credentials
TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN_HERE"

# cPanel/Razorhost MySQL Database Node Setup
MYSQL_HOST="YOUR_MYSQL_HOST_HERE"        # e.g., 'localhost', or IP if remote
MYSQL_PORT="3306"
MYSQL_DB="YOUR_MYSQL_DATABASE_NAME_HERE" # e.g., 'vfnzeaml_CSync'
MYSQL_USER="YOUR_MYSQL_USER_HERE"        # e.g., 'vfnzeaml_CSync'
MYSQL_PASS="YOUR_MYSQL_PASSWORD_HERE"
```

---

## 🗄️ Step 3: Initialize MySQL Tables
Log in to your hosting control panel (cPanel, phpMyAdmin, or direct CLI) and import the `/mysql_schema.sql` file.

```bash
# To run via MySQL command-line client:
mysql -u YOUR_MYSQL_USER -p YOUR_MYSQL_DATABASE_NAME < mysql_schema.sql
```
This script will:
1. Rebuild clean layouts with indexation on roles and identifiers.
2. Setup HOD succession, panic sirens, timesheets, and UPI channels.
3. Automatically seed a primary admin developer account:
   - **Roll/ID**: `8500394696`
   - **Password**: `admin_hash_pass_verify` (can login directly into Student/Admin PWA panels)

---

## 🏗️ Step 4: Build and Launch

### Development Mode (With Live Asset Proxying)
To run the server locally under the live tsx engine loader:
```bash
npm run dev
```
The console will boot on http://localhost:3000.

### Production High-Performance Mode (Highly Recommended)
Compile the React single page application assets and bundle the backend using the embedded esbuild compiler:
```bash
# 1. Build assets to dist/
npm run build

# 2. Spin up the self-contained node server
npm run start
```
Your compiled application is compressed inside `dist/server.cjs` and is fully ready to be daemonized via process managers like **PM2**:
```bash
# Optional: Keep server running 24/7 on remote VPS/cPanel nodes
pm2 start dist/server.cjs --name "C-Sync-Backend"
```

---

## 🛡️ Sovereign Security Note
All database inputs are parsed through secure SQL query parameterization filters using the `mysql2/promise` dependency to protect against SQL injections. No secret API tokens or database passwords are ever served client-side.

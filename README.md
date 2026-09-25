# संस्कृति Khoj — Heritage & Culture Explorer Web App
### Smart India Hackathon (SIH26197)

A full-stack Indian heritage platform featuring **Culture Feed (Geolocation Proximity)**, **Interactive Heritage Map (Leaflet)**, **Audio Narration (Web Speech API)**, **YouTube Virtual Tours**, **Visitor Photos & Ratings**, and an **Admin Dashboard** connected to a **MySQL** database via **Prisma ORM & Express.js**.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons
- **Maps**: Leaflet.js + OpenStreetMap (No billing / completely free)
- **Backend API**: Node.js + Express.js
- **Database**: MySQL (via Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs
- **Media Uploads**: Multer (Local static uploads)

---

## 📁 Project Structure

```text
SIH26197/
├── server/                      # Express + MySQL + Prisma Backend
│   ├── prisma/
│   │   ├── schema.prisma        # MySQL Database Schema
│   │   ├── seed.js              # 7 Iconic Heritage Sites Seed Script
│   │   └── heritage_db.sql      # 1-Click MySQL Direct SQL Dump
│   ├── src/
│   │   ├── controllers/         # Place, Post, Auth, Admin logic
│   │   ├── middlewares/         # JWT Auth & Multer Upload handlers
│   │   ├── routes/              # REST API endpoints
│   │   ├── utils/               # Haversine distance calculation (km)
│   │   ├── prisma.js            # Prisma client instance
│   │   └── server.js            # Express server entry point
│   ├── uploads/                 # Uploaded visitor photos
│   ├── .env                     # Server & MySQL config
│   └── package.json
│
├── client/                      # React + Vite Frontend
│   ├── src/
│   │   ├── components/          # Navbar, CultureCard, Map, AudioPlayer, PostModal
│   │   ├── pages/               # FeedPage, MapPage, PlaceDetailPage, AdminPage, Auth
│   │   ├── context/             # AuthContext (login/register state)
│   │   ├── services/            # Axios API client
│   │   ├── App.jsx              # Main routing & layout
│   │   └── index.css            # Heritage color theme & Tailwind
│   └── package.json
└── README.md
```

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Start MySQL Database

Make sure your MySQL server is running (e.g., via **XAMPP**, **WampServer**, **Docker**, or **MySQL Workbench**).

Create a database named `heritage_db`:
```sql
CREATE DATABASE heritage_db;
```

Check `server/.env` and update your MySQL username and password:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/heritage_db"
```
*(If using XAMPP with no password, leave it as `mysql://root:@localhost:3306/heritage_db`)*

---

### Step 2: Push Database Schema & Seed Data

Aap do tareeqo se database setup kar sakte hain:

#### Option A: Prisma CLI (Automatic)
Open a terminal in `server/`:
```bash
cd server
npm run prisma:push
npm run seed
```

#### Option B: Direct SQL Import (Fastest via phpMyAdmin)
Open phpMyAdmin / MySQL Workbench and import `server/prisma/heritage_db.sql`. It creates all tables and inserts seed records!

---

### Step 3: Run the Backend API Server

In terminal 1:
```bash
cd server
npm run dev
```
> Server will start on **`http://localhost:5000`**

Test in browser: `http://localhost:5000/api/health`

---

### Step 4: Run the React Frontend

In terminal 2:
```bash
cd client
npm run dev
```
> Frontend will open on **`http://localhost:5173`**

---

## 🔑 Pre-Configured Demo Accounts (Ready to Test)

| Role | Email | Password | What they can do |
|---|---|---|---|
| **Admin** | `admin@heritage.gov.in` | `password123` | Add/delete heritage places, view analytics stats, manage stories |
| **Visitor** | `rahul@example.com` | `password123` | Post visit photos, submit star ratings, bookmark places |
| **Visitor** | `priya@example.com` | `password123` | Community visitor reviews |

*(LoginPage has 1-click autofill buttons for both Admin and Visitor accounts!)*

---

## ✨ Features Implemented

1. **Culture Feed**:
   - Geolocation auto-detection calculates distances (km) from your current GPS coordinates.
   - Filter by categories: Monuments, Temples, Forts, Festivals/Ghats, Natural.
   - Proximity sorting with Haversine spherical formula.

2. **Interactive Heritage Map**:
   - Leaflet.js with category-colored map pins.
   - Clickable popups with thumbnail preview, rating, overview, and direct story link.
   - Sidebar place list with instant coordinate navigation.

3. **Full Story Page**:
   - **AI Audio Narration**: Reads the history aloud using browser Web Speech API with speed adjustment (0.8x, 1.0x, 1.2x).
   - **YouTube Virtual Tour**: Embedded documentary/walkthrough video.
   - **Cinema & Songs**: Related movies and songs shot at the monument.
   - **Community Reviews**: Visitor photo gallery and star ratings.

4. **Post Visit Modal**:
   - Allows users to upload an image from disk or paste a URL.
   - Star rating (1-5) and visitor experience caption.

5. **Admin Panel**:
   - Real-time statistics (Total sites, registered users, total reviews).
   - Form to add new heritage places with coordinates and YouTube links.
   - Delete/manage existing places in MySQL.

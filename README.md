# SanskritiKhoj (संस्कृति खोज)
### National Heritage, Living Culture & Traditional Artisan Ecosystem

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MySQL%20%2B%20Prisma-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Mobile](https://img.shields.io/badge/Mobile-Capacitor%20Android-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**SanskritiKhoj** is an all-in-one cultural preservation and heritage tourism ecosystem. It seamlessly bridges curious travellers with India's monuments, ancient temples, royal forts, GI-tagged master artisans, and regional culinary traditions.

---

## 🌟 Key Highlights & Core Modules

### 1. 🧭 Living Culture Feed & Geolocation Proximity
- **Multi-Tier Proximity Engine**: Automatically resolves user coordinates via native GPS / HTML5 Geolocation and computes radial distances using the spherical Haversine formula.
- **Categorized Discovery**: Instant filtering across **Monuments**, **Ancient Temples**, **Royal Forts**, and **Living Culture & Sacred Ghats**.
- **Live Heritage Radar Widget**: Floating real-time beacon that notifies tourists when approaching historic landmarks and guides them via direct map navigation.

### 2. 🗺️ Interactive Heritage Map
- **Leaflet & OpenStreetMap Integration**: Interactive high-performance maps with custom category-colored markers and coordinate zooming.
- **Rich Landmark Previews**: Direct popups with site imagery, ratings, quick summaries, and turn-by-turn routing links.
- **Responsive Dual-View**: Effortless toggle between full-screen map mode and structured directory lists on mobile devices.

### 3. 🎧 Immersive Heritage Chronicles & Audio Guides
- **Bilingual Narratives**: Verified historical timelines, architecture styles, and sacred lore in both English and Hindi.
- **Built-in Audio Guide**: Browser Web Speech API narration with speed adjustments (0.8x, 1.0x, 1.25x) for hands-free listening while exploring sites.
- **Curated 1-Day Heritage Trails**: Time-synchronized guided walking itineraries connecting monuments, artisan clusters, and heritage food stalls.
- **Cinematic & Folk Links**: Embedded YouTube documentaries, 360° virtual tours, and iconic cinema/music shot at each landmark.

### 4. 🛍️ ODOP & Traditional Artisan Bazaar
- **One District One Product (ODOP) Empowerment**: Direct marketplace for hereditary artisans, weavers, and craftspeople.
- **GI Certification Badges**: Clear authentication for Jaipur Blue Pottery, Banarasi Silk, Agra Marble Inlay, and Odisha Pattachitra.
- **Direct Artisan Connect**: Integrated turn-by-turn shop directions and direct one-click WhatsApp messaging to hereditary shopkeepers.

### 5. 🏛️ Master Artisan Studio & Seller Portal
- **Artisan Onboarding**: Streamlined workshop registration linked with Ministry Pehchan IDs and District Industries Centre (DIC) records.
- **Catalogue & Inventory Management**: Multi-image product uploads, craft classification, pricing, and live shop timings.
- **Fair-Trade Direct Payouts**: Support for 100% in-store counter payments (Cash/UPI) ensuring 0% commission cut from artisan earnings.

### 6. 🍲 Regional Culinary Heritage Guide
- **Authentic Local Delicacies**: Monument-specific traditional culinary lore, sweet delicacies, and savoury street specialties.
- **Where to Taste (कहाँ मिलेगा)**: Curated historic stalls and certified eateries around heritage perimeters.
- **Dietary Badges**: Pure Vegetarian / Non-Vegetarian tags with historical provenance.

### 7. 📸 Community Visitor Feed & Photo Reviews
- **Visit Photo Submissions**: Dedicated photo upload module with star ratings (1–5) and traveler review captions.
- **Community Chronicle Gallery**: Real traveler photos displayed under respective monuments and on the public feed.

### 8. 🇮🇳 Bilingual Interface (हिन्दी / English)
- **One-Tap Language Toggle**: Full interface translation across feed, navigation bars, detail stories, and forms.

### 9. 🛡️ Citizen Grievance & Support Desk
- **Digital Grievance Tickets**: Built-in issue reporting for site cleanliness, data inaccuracies, or artisan orders with image attachments.
- **Emergency Helplines**: Quick access to national tourist helplines (`1363`), emergency response (`112`), and dedicated email support.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Core** | React 18, Vite | Lightning-fast SPA bundle & reactive UI |
| **Styling** | Tailwind CSS, Lucide Icons | Responsive luxury heritage design tokens |
| **Mobile Runtime** | Capacitor (Android) | Native device camera, storage & GPS bridges |
| **Mapping** | Leaflet, React-Leaflet | Open-source interactive map without API billing |
| **Backend Core** | Node.js, Express.js | RESTful micro-services & multipart file uploads |
| **ORM & Database** | Prisma ORM, MySQL | Relational schema, migrations & seed pipelines |
| **Authentication** | JWT, bcryptjs | Role-based token access (Visitor, Artisan, Admin) |
| **AI Cultural Engine** | Groq Multi-Model API | Automated cultural storytelling & media indexing |

---

## 📁 Project Directory Structure

```text
SIH26197/
├── client/                                # React 18 + Vite Frontend Application
│   ├── android/                          # Capacitor Android Studio Native Project
│   ├── public/                           # Static public assets and app icon
│   ├── src/
│   │   ├── assets/                       # Image assets and graphics
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── AudioNarrationPlayer.jsx  # Text-to-speech audio player
│   │   │   ├── BottomNav.jsx             # Mobile navigation bar
│   │   │   ├── CultureCard.jsx           # Heritage monument cards
│   │   │   ├── HeritageRadar.jsx         # Live GPS radar floating beacon
│   │   │   ├── MapComponent.jsx          # Leaflet map container & custom pins
│   │   │   ├── MenuDrawer.jsx            # Mobile slide-out drawer
│   │   │   ├── Navbar.jsx                # Responsive header & language switcher
│   │   │   ├── PermissionModal.jsx       # Device permission onboarding
│   │   │   ├── PostModal.jsx             # Visit photo submission modal
│   │   │   ├── ReportIssueModal.jsx      # Citizen grievance & support ticket modal
│   │   │   └── SearchModal.jsx           # Global instant search modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # Authentication & session provider
│   │   │   └── LanguageContext.jsx       # Bilingual English/Hindi provider
│   │   ├── data/
│   │   │   └── fallbackData.js           # Offline resilience monument & craft store
│   │   ├── hooks/
│   │   │   └── useKeyboardVisible.js     # Keyboard detection for mobile screens
│   │   ├── pages/
│   │   │   ├── AdminPage.jsx             # Government administrative dashboard
│   │   │   ├── ArtisanPortalPage.jsx     # Master artisan studio & onboarding
│   │   │   ├── BazaarPage.jsx            # ODOP & GI-tagged crafts marketplace
│   │   │   ├── BookmarksPage.jsx         # User saved heritage bucket list
│   │   │   ├── FeedPage.jsx              # Main proximity feed & festival calendar
│   │   │   ├── LoginPage.jsx             # User & Admin authentication
│   │   │   ├── MapPage.jsx               # Full-screen heritage exploration map
│   │   │   ├── PlaceDetailPage.jsx       # Comprehensive monument page & trails
│   │   │   ├── ProfilePage.jsx           # User settings, preferences & support
│   │   │   └── RegisterPage.jsx          # Account registration
│   │   ├── services/
│   │   │   ├── api.js                    # Axios instance & unified backend services
│   │   │   └── orderService.js           # Artisan order tracking service
│   │   ├── utils/
│   │   │   └── geolocation.js            # Multi-tier GPS, Capacitor & IP locator
│   │   ├── App.jsx                       # Main routing & application layout
│   │   └── main.jsx                      # Application entry point
│   ├── capacitor.config.json             # Capacitor mobile configuration
│   ├── package.json
│   └── vite.config.js
│
├── server/                               # Node.js + Express + Prisma Backend
│   ├── prisma/
│   │   ├── schema.prisma                 # Relational database schema
│   │   ├── seed.js                       # Comprehensive Indian heritage seed script
│   │   └── heritage_db.sql               # Ready-to-import SQL database dump
│   ├── src/
│   │   ├── controllers/                  # Route business logic handlers
│   │   ├── middlewares/                  # Auth, role check & file upload filters
│   │   ├── routes/                       # REST endpoints (Places, Products, Food, Support)
│   │   ├── utils/                        # Haversine distance & helper algorithms
│   │   ├── prisma.js                     # Prisma client connection manager
│   │   └── server.js                     # Server initialization & middleware mounts
│   ├── uploads/                          # Uploaded visitor & product media
│   ├── .env.example                      # Environment variables template
│   └── package.json
│
└── README.md                             # Comprehensive project documentation
```

---

## 🚀 Step-by-Step Installation & Setup

### Prerequisites
- **Node.js** (v18.x or higher) & **npm**
- **MySQL Server** (via XAMPP, Docker, MySQL Workbench, or Cloud Aiven)

---

### Step 1: Backend Setup & Database Migration

1. Navigate to the server folder:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/heritage_db"
   JWT_SECRET="your_strong_jwt_secret_key"
   JWT_EXPIRES_IN="7d"
   GROQ_API_KEY="your_optional_groq_api_key"
   CLIENT_URL="http://localhost:5173"
   ```

3. Initialize the database schema and load seed data:
   ```bash
   # Push schema to MySQL
   npm run prisma:push

   # Seed initial monuments, ODOP crafts, and culinary delicacies
   npm run seed
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   > Backend API will be live at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   npm install
   ```

2. *(Optional)* Configure client environment variables in `client/.env`:
   ```env
   VITE_API_URL="http://localhost:5000/api"
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   > Web application will open at `http://localhost:5173`

---

### Step 3: Mobile APK Build (Android via Capacitor)

To build the native Android application:
```bash
cd client

# Build production web bundle
npm run build

# Synchronize assets with Android runtime
npx cap sync android

# Open project in Android Studio
npx cap open android
```
From Android Studio, click **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate the release/debug `.apk`.

---

## 📡 REST API Architecture

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Server heartbeat & DB status | Public |
| `POST` | `/api/auth/login` | User/Admin authentication & JWT issuance | Public |
| `POST` | `/api/auth/register` | Tourist registration | Public |
| `GET` | `/api/places` | Fetch monuments with category & text search | Public |
| `GET` | `/api/places/nearby` | Proximity-sorted places based on `lat` & `lng` | Public |
| `GET` | `/api/places/:slug` | In-depth monument story, trails & media | Public |
| `POST` | `/api/posts` | Submit visitor review photo with star rating | Authenticated |
| `GET` | `/api/products` | Retrieve verified ODOP crafts & artisan listings | Public |
| `POST` | `/api/products` | Publish new artisan craft listing | Artisan / Admin |
| `GET` | `/api/food` | Monument culinary heritage & tasting spots | Public |
| `POST` | `/api/support/report` | Submit citizen grievance or bug report ticket | Public |
| `GET` | `/api/admin/stats` | Administrative analytics & activity overview | Admin Only |
| `POST` | `/api/admin/places` | Create new cultural monument record | Admin Only |

---

## 🔒 Security & Privacy Practices

- **Zero Remote Tracking**: GPS coordinates and proximity computations are executed client-side; raw user coordinates are not permanently logged.
- **Secure Password Hashing**: Passwords stored via salted `bcryptjs` hashing.
- **Offline Resilience**: Automatic fallback caching ensures seamless browsing of monument narratives even in remote low-bandwidth archaeological zones.

---

## 👥 Contributors & Acknowledgements
- Developed for the preservation and promotion of Indian cultural heritage, monuments, and hereditary craftsmanship.
- Powered by open cultural data, archaeological records, and community contributors across India.

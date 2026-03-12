# 🏙️ InclusiCity

> **A digital platform that connects seniors and people with disabilities to verified NGO volunteers — through real-time tracking, secure SOS systems, and digital dignity.**

---

## 📖 Overview

InclusiCity is a full-stack web application designed to make urban life more accessible and inclusive. It bridges the gap between people who need assistance and NGO-certified helpers, enabling real-time aid requests, secure communication, and community-driven support.

---

## ✨ Features

### 👤 For Users (People Needing Help)
- **User Registration & Login** with secure JWT authentication
- **Create Help Requests** with urgency levels and descriptions
- **Real-time SOS Alerts** that notify all available helpers instantly
- **Star Rating System** to rate helpers after each session
- **Live Map Integration** to track nearby helpers
- **Voice Rooms** for real-time communication (WebRTC-based)
- **Profile & Settings Management**

### 🤝 For Helpers (NGO Volunteers)
- **Helper Registration & Verification** — helpers must upload KYC documents (government ID, certificates) before going live
- **Profile Completion Flow** with document upload
- **View Available Requests** and accept/manage them
- **Availability Toggle** (Go Online / Go Offline)
- **Real-time Notifications** for new requests
- **Rating Dashboard** to track performance

### 🛡️ For Admins
- **Admin Dashboard** to review and approve/reject helper verifications
- **View Uploaded Documents** with download support
- **SOS Alert Overview** across the platform
- **User & Helper Analytics**

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + Vite | UI Framework |
| React Router DOM | Client-side Routing |
| Framer Motion | Animations & Transitions |
| Lucide React | Icon Library |
| Axios | HTTP Client |
| Socket.IO Client | Real-time Communication |
| Tailwind CSS | Utility-first Styling |

### Backend
| Technology | Purpose |
|---|---|
| Python / Flask | REST API Server |
| Flask-RESTx | Swagger API Docs |
| PyMongo | MongoDB ODM |
| Flask-JWT-Extended | JWT Authentication |
| Flask-CORS | Cross-Origin Resource Sharing |
| Flask-SocketIO + Eventlet | WebSocket / Real-time Events |
| Celery + Redis | Async Task Queue (Emails) |
| Werkzeug | Password Hashing |
| Flask-Mail | Email Notifications |

### Database & Infrastructure
| Technology | Purpose |
|---|---|
| MongoDB | Primary NoSQL Database |
| Redis | Celery Broker & Cache |

---

## 🗂️ Project Structure

```
Inclusicity-backend/
├── backend/
│   ├── app.py               # Flask app entry point
│   ├── celery_app.py        # Celery configuration
│   ├── requirements.txt     # Python dependencies
│   ├── routes/
│   │   ├── auth.py          # Signup, Login, JWT
│   │   ├── helpers.py       # Helper verification, profile, documents
│   │   ├── requests.py      # Help request CRUD
│   │   ├── admin.py         # Admin verification management
│   │   ├── ratings.py       # Rating system
│   │   └── sos.py           # SOS alert system
│   ├── utils/
│   │   └── email_tasks.py   # Celery email tasks
│   └── sockets/             # Socket.IO event handlers
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── HomePage.jsx         # Landing page
        │   ├── Login.jsx            # Login
        │   ├── UserSignup.jsx       # User registration
        │   ├── HelperSignup.jsx     # Helper registration
        │   ├── UserHome.jsx         # User landing after login
        │   ├── UserDashboard.jsx    # Help request management
        │   ├── UserProfile.jsx      # Profile management
        │   ├── UserSettings.jsx     # Settings
        │   ├── UserMap.jsx          # Live map
        │   ├── UserVoiceRooms.jsx   # Voice/video rooms
        │   ├── HelperHome.jsx       # Helper landing after login
        │   ├── HelperDashboard.jsx  # Available requests view
        │   ├── HelperProfile.jsx    # Profile & document upload
        │   └── AdminDashboard.jsx   # Admin control panel
        ├── contexts/
        │   └── AuthContext.jsx      # Global auth state
        └── components/
            └── PrivateRoute.jsx     # Role-based route guard
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**
- **MongoDB** (local or Atlas)
- **Redis** (for Celery task queue)

---

### 1. Clone the Repository

```bash
git clone https://github.com/sarukeshwar2016/Inclusicity.git
cd Inclusicity-backend
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate     # Windows
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create your .env file
copy .env.example .env    # Then fill in your values
```

**`.env` file variables:**
```env
MONGO_URI=mongodb://localhost:27017/inclusicity
JWT_SECRET_KEY=your_super_secret_key
REDIS_URL=redis://localhost:6379/0
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

**Run the Backend:**
```bash
python app.py
# Server starts on http://localhost:5000
```

**Run Celery Worker (separate terminal):**
```bash
celery -A celery_app.celery_app worker --loglevel=info --pool=solo
```

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
# App runs on http://localhost:5173
```

---

### 4. Seed Admin Account

After MongoDB is running, seed the initial admin account using the provided script:

```bash
cd backend
python seed_admin.py
```

**Default Admin Credentials:**
```
Email:    admin@inclusicity.com
Password: admin123
```

---

## 🔐 Authentication & Role-Based Access

The application uses **JWT tokens** stored in `localStorage` with three roles:

| Role | Home Route | Capabilities |
|---|---|---|
| `user` | `/user/home` | Create requests, SOS, rate helpers |
| `helper` | `/helper/home` | View requests, manage profile, go online |
| `admin` | `/admin/dashboard` | Approve helpers, view alerts |

---

## 📡 API Documentation

Once the backend is running, visit the Swagger UI:
```
http://localhost:5000/api/docs
```

---

## 📸 Screenshots

> Coming soon — UI built with modern glassmorphism design, gradient backgrounds, and framer-motion animations.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">Built with ❤️ for inclusivity and digital accessibility.</p>

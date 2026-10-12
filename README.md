# 🎓 ToppScorers

**India's smartest platform connecting teachers with students and coaching institutes.**

ToppScorers is a full-stack web platform that helps teachers find tuition and teaching opportunities, and helps students/institutes find the right teachers. The platform supports English and Hindi with a language toggle, and includes a full admin panel for managing content and widget layout.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (Vite), React Router 6, Tailwind CSS 3 |
| **State/Data** | TanStack React Query v5 |
| **i18n** | react-i18next (EN/HI with JSON translation files) |
| **Backend** | Node.js + Express.js (REST API, ES Modules) |
| **Database** | MongoDB with Mongoose |
| **Auth** | JWT with httpOnly cookies, bcrypt, role-based access |
| **Admin Panel** | Drag-and-drop widget ordering (@dnd-kit), CRUD forms |
| **Animations** | Framer Motion |
| **Icons** | React Icons |

---

## 📁 Project Structure

```
ToppScorers/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── api/               # Axios instance
│   │   ├── components/
│   │   │   ├── admin/         # Admin layout components
│   │   │   ├── home/          # Homepage section components
│   │   │   ├── Navbar.jsx     # Main navigation
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── WhatsAppFAB.jsx
│   │   ├── context/           # Auth context
│   │   ├── i18n/              # Translation files (en.json, hi.json)
│   │   ├── pages/
│   │   │   ├── admin/         # Admin panel pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── FindTeachers.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                    # Express Backend
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT auth + role authorization
│   ├── models/
│   │   ├── User.js
│   │   ├── TeacherProfile.js
│   │   ├── StudentProfile.js
│   │   ├── WidgetConfig.js
│   │   ├── ActiveSession.js
│   │   └── FAQ.js
│   ├── routes/
│   │   ├── auth.js            # Signup, Login, Logout, Me
│   │   ├── teachers.js        # Teacher profile CRUD
│   │   ├── students.js        # Student profile CRUD
│   │   ├── admin.js           # Admin operations
│   │   ├── widgets.js         # Homepage widget config
│   │   └── faqs.js            # FAQ management
│   ├── uploads/               # File upload storage
│   ├── server.js              # App entry point
│   ├── seed.js                # Database seeder
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ installed
- **MongoDB** running locally or a MongoDB Atlas connection string
- **npm** or **yarn**

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Copy the example env file and update values:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
# MongoDB Atlas (Recommended):
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/teacher-hunt?retryWrites=true&w=majority
# Or Local MongoDB:
# MONGODB_URI=mongodb://127.0.0.1:27017/teacher-hunt
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
WHATSAPP_NUMBER=917019074944
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

This creates:
- **Admin account**: `admin@toppscorers.com` / `admin123`
- **6 demo teachers** with varied subjects and locations
- **4 demo students**
- **Default homepage widget** configuration
- **8 bilingual FAQs** (English + Hindi)

### 4. Run the Application

In two separate terminals:

```bash
# Terminal 1 — Start the backend
cd server
npm run dev

# Terminal 2 — Start the frontend
cd client
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Student** | Browse teachers, search/filter, view profiles, manage own profile |
| **Teacher** | Create teaching profile, upload credentials/demo video, manage profile |
| **Admin** | Full admin panel: widget manager, profile CRUD, user management, FAQ editor |

---

## 🔑 Authentication

- **Single Login** page at `/login` — email + password
- **Single Signup** page at `/signup` — with tabs for "Register as Student" / "Register as Teacher"
- URL params supported: `/signup?role=teacher` pre-selects the teacher tab
- JWT stored in httpOnly cookies (secure, no localStorage token exposure)
- Active sessions tracked for admin visibility

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@toppscorers.com | admin123 |
| Teacher | ravi@example.com | password123 |
| Student | rohan@example.com | password123 |

---

## 🌐 Multilingual Support

- **Language Toggle** (EN | HI) visible in the header on all pages
- All static content pulls from translation JSON files (`en.json` / `hi.json`)
- Language preference persisted in `localStorage` across sessions
- Admin can edit FAQ content in both languages

---

## 🛡 Admin Panel (`/admin`)

Access at `/admin` after logging in as admin:

| Feature | Description |
|---------|-------------|
| **Dashboard** | Stats overview (users, teachers, students, active sessions) |
| **Widget Manager** | Drag-and-drop reorder homepage sections, toggle visibility |
| **Profile Manager** | Add/edit/delete teacher and student profiles |
| **User Manager** | View all users, filter by role, view active sessions |
| **FAQ Editor** | Create/edit/delete FAQs with bilingual content |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Teachers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teachers` | List teachers (public, with filters) |
| GET | `/api/teachers/:id` | Get teacher profile |
| PUT | `/api/teachers/profile` | Update own profile (auth) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/sessions` | View active sessions |
| POST | `/api/admin/teachers` | Create teacher profile |
| PUT | `/api/admin/teachers/:id` | Edit teacher |
| DELETE | `/api/admin/users/:id` | Delete user |

### Widgets & FAQs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/widgets` | Get homepage layout |
| PUT | `/api/widgets` | Update layout (admin) |
| GET | `/api/faqs` | Get visible FAQs |
| POST/PUT/DELETE | `/api/faqs/:id` | Manage FAQs (admin) |

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#1e3a5f` | Navigation, headings, buttons |
| Accent | `#f59e0b` | CTAs, highlights, badges |
| Success | `#059669` | Verified badges, checkmarks |
| WhatsApp | `#25D366` | WhatsApp button, FAB |
| Background | `#f8fafc` | Page background |
| Text Dark | `#0f172a` | Body text |
| Text Gray | `#64748b` | Secondary text |

---

## 📦 Key Homepage Sections

1. **Hero** — Gradient banner with CTAs
2. **Coverage** — Exam cards (JEE, NEET, UPSC, etc.)
3. **Why ToppScorers** — 6 feature cards
4. **For Teachers** — Benefits + CTA
5. **For Students** — Benefits + CTA
6. **WhatsApp Community** — Join link
7. **FAQs** — Accordion with bilingual content
8. **Footer** — Links, social, copyright

> All sections are reorderable and toggleable from the admin panel!

---

## 🔒 Privacy Architecture & Verification Testing Guide

ToppScorers implements strict role enforcement, field-level privacy serialization, and compliance with **India's Digital Personal Data Protection (DPDP) Act, 2023**.

### 1. Privacy & Address Disclosure Rules

| Viewer Type | Name Shown | Location | Phone & Full Street Address | Action Allowed |
|:---|:---|:---|:---|:---|
| **Guest** (Logged Out) | Masked initial (e.g. `Ravi K.`) | Area + City only | **Hidden** | Prompt to Log In |
| **Logged-In User** (No connection) | Full name | Area + City only | **Hidden** (Unless user toggled public) | Send Connection Request |
| **Connected User** (Accepted request) | Full name | Area + City | **Unlocked & Visible** | Direct Call / Message |
| **Minor Student** (<18 years old) | Full name | Area + City only | **Protected** (Requires parent consent flag) | Guardian Managed |
| **Profile Owner / Admin** | Full details | Full details | **Full Access** | Manage & Edit |

---

### 2. How to Test the Privacy & Role Protections

#### A. Role Enforcement on Directories
- **Student cannot access student directory**: Log in as a student (`rohan@example.com` / `password123`) and attempt to visit [http://localhost:5173/students](http://localhost:5173/students). You will be automatically redirected to `/teachers` with an informational notice. Calling `GET /api/students` directly via API with student credentials returns `403 Forbidden`.
- **Teacher cannot access teacher directory**: Log in as a teacher (`ravi@example.com` / `password123`) and attempt to visit [http://localhost:5173/teachers](http://localhost:5173/teachers). You will be automatically redirected to `/students`. Calling `GET /api/teachers` with teacher credentials returns `403 Forbidden`.

#### B. Address & Phone Masking Before Connection
1. Log in as a Student (`rohan@example.com` / `password123`).
2. Visit `/teachers` and open any teacher profile (e.g. Dr. Priya Singh).
3. Observe that only the area (*South Extension*) and city (*Delhi*) are visible. The exact street address and phone number are locked behind a shield notice.
4. Click **Connect / Request Details**, enter an optional message, and submit.
5. Log out, then log in as the Teacher (`priya@example.com` / `password123`).
6. Visit `/connections` (under "Incoming"). You will see the incoming connection request from Rohan Verma with his message.
7. Click **Accept & Share**.
8. Now, both Rohan and Dr. Priya Singh can see each other's full street addresses, phone numbers, and direct contact options!

#### C. Audit Logging & Abuse Tracking
- Every time full address or phone number details are viewed by an authorized connection, a record is logged to `ProfileViewLog`.
- Log in as Admin (`admin@toppscorers.com` / `admin123`) and visit `/admin/moderation` → **Address Logs** to view the live audit trail of who accessed whose details.

#### D. DPDP Compliance & Account Deletion
- Visit `/settings` → **DPDP & Deletion** to review statutory rights under the DPDP Act 2023.
- Clicking **Delete My Account** deactivates the account, removes it from all search directories, clears active sessions, and cancels pending connection requests.

---

## 📄 License

MIT License © 2026 ToppScorers

---

<p align="center">Made with ❤️ in India</p>

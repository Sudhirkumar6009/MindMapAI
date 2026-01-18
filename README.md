<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

<h1 align="center">🧠 MindMap AI</h1>

<p align="center">
  <strong>Transform your ideas into interactive knowledge graphs powered by AI</strong>
</p>

<p align="center">
  An intelligent knowledge graph generator that converts text, PDFs, and GitHub repositories into structured, interactive concept maps using Google Gemini AI with a sophisticated multi-agent architecture.
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Backend Deep Dive](#-backend-deep-dive)
- [Frontend Deep Dive](#-frontend-deep-dive)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🤖 AI-Powered Multi-Agent System
- **Concept Extraction Agent** — Intelligently identifies key concepts optimized for different diagram types
- **Relationship Mapping Agent** — Discovers semantic connections with diagram-specific relationship types
- **Refinement Agent** — Iteratively merges similar concepts and eliminates orphan nodes
- **GitHub Agent** — Analyzes repository structure, code patterns, and documentation

### 📊 Multiple Diagram Types
| Type | Description | Best For |
|------|-------------|----------|
| **Mind Map** | Radial hierarchical layout | Brainstorming, note-taking |
| **Flowchart** | Sequential process flows | Workflows, algorithms |
| **Network** | Force-directed connections | Complex relationships |
| **Tree** | Parent-child hierarchy | Classifications, taxonomies |
| **Org Chart** | Organizational structure | Teams, reporting lines |
| **Block Diagram** | System components | Architecture, modules |

### 📄 Multiple Input Sources
- **Text Input** — Paste or type any content
- **PDF Upload** — Process documents up to 50MB with `pdf-parse`
- **GitHub Integration** — Deep repository analysis including:
  - README and documentation
  - Package manifests (package.json, requirements.txt, etc.)
  - Source code structure analysis
  - Multi-language support detection

### 🎨 Interactive Visualization
- **React Flow Engine** — Smooth pan, zoom, and node interactions
- **5 Color Palettes** — Academic, Research, Modern, Minimal, Nature
- **Multiple Layouts** — Dagre hierarchical, force-directed, radial
- **Real-time Editing** — Add, delete, and modify nodes/edges
- **MiniMap & Controls** — Easy navigation for large graphs

### 💾 Export Formats
| Format | Extension | Compatibility |
|--------|-----------|---------------|
| **MindMapAI** | `.mmai` | Proprietary with integrity checksum |
| **Draw.io** | `.drawio` | diagrams.net compatible |
| **Visio** | `.vsdx` | Microsoft Visio Open XML |
| **Gliffy** | `.gliffy` | Gliffy diagram format |
| **PNG/SVG** | Image | Universal image export |
| **JSON** | `.json` | Raw data export |

### 🔐 User Management
- **JWT Authentication** — Secure token-based sessions
- **User Profiles** — Avatar, bio, profession, organization
- **Customizable Settings** — Theme, notifications, API preferences
- **History Tracking** — Auto-save and revisit mind maps
- **Dashboard Analytics** — Usage stats and recent activity

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3 | UI Framework |
| **Vite** | 5.4 | Build tool & dev server |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **@xyflow/react** | 12.10 | Graph visualization |
| **Framer Motion** | 12.26 | Animations |
| **Lucide React** | 0.453 | Icon library |
| **Axios** | 1.7 | HTTP client |
| **React Router** | 6.30 | Client-side routing |
| **@dagrejs/dagre** | 1.1 | Graph layout algorithms |
| **html-to-image** | 1.11 | Export to PNG/SVG |
| **JSZip** | 3.10 | File compression for exports |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20+ | Runtime environment |
| **Express** | 4.21 | Web framework |
| **MongoDB** | - | Database |
| **Mongoose** | 8.8 | ODM for MongoDB |
| **@google/generative-ai** | 0.21 | Gemini AI SDK |
| **JWT** | 9.0 | Authentication tokens |
| **bcryptjs** | 2.4 | Password hashing |
| **Multer** | 1.4 | File upload handling |
| **pdf-parse** | 1.1 | PDF text extraction |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Landing    │  │  Dashboard  │  │  Create     │  │  Graph      │    │
│  │  Page       │  │  Page       │  │  Page       │  │  Builder    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                │                │                │            │
│         └────────────────┼────────────────┼────────────────┘            │
│                          ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    React Flow Graph Engine                        │  │
│  │  • Custom Nodes  • Layout Algorithms  • Export Functions          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ Axios HTTP
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND API                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                         Express Routes                              ││
│  │  /auth  /extract  /upload  /refine  /github  /history  /graphs     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                    │                                    │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                    AI AGENT ORCHESTRATOR                            ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           ││
│  │  │   Concept     │  │ Relationship  │  │  Refinement   │           ││
│  │  │   Agent       │→ │    Agent      │→ │    Agent      │           ││
│  │  └───────────────┘  └───────────────┘  └───────────────┘           ││
│  │         │                                      │                    ││
│  │         └───────────────┬──────────────────────┘                    ││
│  │                         ▼                                           ││
│  │              ┌───────────────────┐                                  ││
│  │              │   GitHub Agent    │ (Repository Analysis)            ││
│  │              └───────────────────┘                                  ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                    │                                    │
│                                    ▼                                    │
│  ┌────────────────────┐    ┌────────────────────┐                      │
│  │  Google Gemini AI  │    │     MongoDB        │                      │
│  │  (Content Analysis)│    │  (User & History)  │                      │
│  └────────────────────┘    └────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
MindMapAI/
├── backend/
│   ├── Dockerfile                 # Container configuration
│   ├── package.json               # Dependencies & scripts
│   └── src/
│       ├── server.js              # Express app entry point
│       ├── agents/                # AI Agent System
│       │   ├── orchestrator.js    # Main pipeline coordinator
│       │   ├── conceptAgent.js    # Concept extraction
│       │   ├── relationshipAgent.js # Relationship mapping
│       │   ├── refinementAgent.js # Graph optimization
│       │   └── githubAgent.js     # GitHub repository analysis
│       ├── config/
│       │   ├── database.js        # MongoDB connection
│       │   └── gemini.js          # Gemini AI configuration
│       ├── middleware/
│       │   └── auth.js            # JWT authentication
│       ├── models/
│       │   ├── User.js            # User schema with settings
│       │   ├── History.js         # Mind map history schema
│       │   └── Notification.js    # User notifications
│       ├── routes/
│       │   ├── auth.js            # Authentication endpoints
│       │   ├── extract.js         # Text → Graph conversion
│       │   ├── upload.js          # PDF processing
│       │   ├── refine.js          # Graph refinement
│       │   ├── github.js          # GitHub import
│       │   ├── history.js         # User history CRUD
│       │   ├── graphs.js          # Saved graphs management
│       │   ├── dashboard.js       # Analytics & stats
│       │   ├── profile.js         # User profile management
│       │   ├── settings.js        # User preferences
│       │   └── notifications.js   # Notification management
│       └── utils/
│           ├── contentValidator.js # Input validation
│           └── labelSimplifier.js  # Label normalization
│
└── frontend/
    ├── index.html                 # Entry HTML
    ├── package.json               # Dependencies & scripts
    ├── vite.config.js             # Vite configuration
    ├── tailwind.config.js         # Tailwind CSS config
    ├── postcss.config.js          # PostCSS configuration
    ├── vercel.json                # Vercel deployment config
    └── src/
        ├── main.jsx               # React entry point
        ├── App.jsx                # Root component & routing
        ├── index.css              # Global styles
        ├── api/
        │   └── index.js           # Axios API client
        ├── context/
        │   ├── AuthContext.jsx    # Authentication state
        │   └── ThemeContext.jsx   # Dark/Light theme
        ├── components/
        │   ├── AppLayout.jsx      # Sidebar layout wrapper
        │   ├── LandingPage.jsx    # Marketing homepage
        │   ├── Header.jsx         # Navigation header
        │   ├── Sidebar.jsx        # App navigation
        │   ├── GraphView.jsx      # Main visualization (1285 lines)
        │   ├── InputPanel.jsx     # Text/PDF input
        │   ├── ExportMenu.jsx     # Export options dropdown
        │   ├── Dashboard.jsx      # Stats widgets
        │   ├── AuthModal.jsx      # Login/Register modal
        │   ├── UserMenu.jsx       # User dropdown
        │   ├── HistoryModal.jsx   # History browser
        │   ├── ImportMMAI.jsx     # Import .mmai files
        │   ├── Settings.jsx       # Settings panel
        │   ├── StatsPanel.jsx     # Analytics display
        │   ├── LoadingOverlay.jsx # Loading states
        │   ├── ProtectedRoute.jsx # Auth guard
        │   ├── flow/
        │   │   └── CustomNodes.jsx # Custom React Flow nodes
        │   └── animations/
        │       ├── ClickSpark.jsx  # Click effects
        │       ├── GridMotion.jsx  # Background animation
        │       └── LightRays.jsx   # Light effects
        ├── pages/
        │   ├── DashboardPage.jsx  # User dashboard
        │   ├── CreatePage.jsx     # Mind map creation
        │   ├── GraphBuilderPage.jsx # Manual graph builder
        │   ├── GraphsPage.jsx     # Saved graphs list
        │   ├── HistoryPage.jsx    # History browser
        │   ├── ProfilePage.jsx    # User profile
        │   ├── SettingsPage.jsx   # App settings
        │   ├── LoginPage.jsx      # Login form
        │   ├── RegisterPage.jsx   # Registration form
        │   ├── DemoPage.jsx       # Demo mode
        │   ├── AboutPage.jsx      # About page
        │   ├── ContactPage.jsx    # Contact form
        │   ├── BlogPage.jsx       # Blog/Updates
        │   ├── PrivacyPage.jsx    # Privacy policy
        │   └── TermsPage.jsx      # Terms of service
        └── utils/
            ├── exportFormats.js   # Export logic (557 lines)
            ├── labelSimplifier.js # Label utilities
            └── demoStorage.js     # Demo mode storage
```

---

## 🔧 Backend Deep Dive

### AI Agent System

The backend implements a sophisticated multi-agent architecture:

#### 1. Orchestrator (`orchestrator.js`)
The main coordinator that:
- Validates input content quality
- Configures diagram-specific extraction settings
- Pipelines data through agents sequentially
- Handles error recovery and fallbacks

```javascript
// Diagram configurations determine extraction behavior
const DIAGRAM_CONFIGS = {
  mindmap: { layout: 'radial', focus: 'hierarchical concepts' },
  flowchart: { layout: 'vertical', focus: 'processes and decisions' },
  network: { layout: 'force-directed', focus: 'entity connections' },
  tree: { layout: 'hierarchical', focus: 'parent-child relationships' },
  orgchart: { layout: 'vertical', focus: 'reporting structures' },
  block: { layout: 'grid', focus: 'system components' }
};
```

#### 2. Concept Agent (`conceptAgent.js`)
Extracts key concepts using diagram-optimized prompts:
- Mind Map → Central topics and branching ideas
- Flowchart → Steps, decisions, start/end states
- Network → Entities and hubs
- Tree → Categories and classifications

#### 3. Relationship Agent (`relationshipAgent.js`)
Maps connections with diagram-specific relation types:
- Mind Map: `contains`, `relates to`, `aspect of`
- Flowchart: `then`, `if yes`, `if no`, `triggers`
- Network: `connects`, `links`, `depends on`
- Tree: `parent of`, `child of`, `type of`

#### 4. Refinement Agent (`refinementAgent.js`)
Optimizes graph quality through:
- **Concept Merging** — Combines similar/redundant concepts
- **Isolated Node Resolution** — Finds relationships for orphan nodes
- **Iterative Refinement** — Multiple passes for quality improvement

#### 5. GitHub Agent (`githubAgent.js`)
Deep repository analysis including:
- README and documentation parsing
- Package manifest analysis (package.json, requirements.txt, etc.)
- Source folder structure detection
- Multi-language project identification
- File importance scoring

### Database Models

#### User Model
```javascript
{
  name, email, password,
  avatar, bio, profession, organization,
  settings: {
    theme: 'light' | 'dark' | 'system',
    notifications: { email, push, digest },
    defaultDiagramType, apiPreferences
  },
  stats: { totalMindMaps, totalConcepts, lastActive }
}
```

#### History Model
```javascript
{
  user, title, sourceType: 'text' | 'pdf' | 'github' | 'import',
  sourcePreview, conceptCount, relationshipCount,
  graphData: { concepts, relationships, nodes, edges },
  diagramType, tags, isFavorite, viewCount
}
```

---

## 🎨 Frontend Deep Dive

### Component Architecture

#### Core Components

| Component | Lines | Description |
|-----------|-------|-------------|
| `GraphView.jsx` | 1285 | Main visualization with React Flow, layouts, palettes |
| `LandingPage.jsx` | 1113 | Marketing page with animations |
| `exportFormats.js` | 557 | Export to MMAI, DrawIO, Visio, Gliffy |

#### GraphView Features
- **5 Color Palettes**: Academic, Research, Modern, Minimal, Nature
- **Layout Algorithms**: Dagre (hierarchical), Force-directed, Radial
- **Custom Nodes**: Styled with connections indicator, hover effects
- **Interactive Controls**: Zoom, fit view, reset, layout toggle
- **Real-time Editing**: Add/delete nodes and edges

#### State Management
- **AuthContext**: JWT token, user data, login/logout
- **ThemeContext**: Dark/Light mode with system detection

### Routing Structure

```jsx
// Public Routes
/                    → LandingPage
/login               → LoginPage
/register            → RegisterPage
/demo                → DemoPage
/about, /contact, /privacy, /terms, /blog

// Protected Routes (require authentication)
/dashboard           → DashboardPage
/create              → CreatePage
/graphs              → GraphsPage
/graphs/new          → GraphBuilderPage
/graphs/:id          → GraphBuilderPage (edit mode)
/history             → HistoryPage
/profile             → ProfilePage
/settings            → SettingsPage
```

### Export System

The `exportFormats.js` utility provides:

```javascript
// Proprietary format with integrity checksum
exportToMMAI(data, metadata) → .mmai file

// Third-party diagram tools
exportToDrawio(data) → .drawio (diagrams.net)
exportToVisio(data)  → .vsdx (Microsoft Visio)
exportToGliffy(data) → .gliffy

// Import support
importFromMMAI(content) → validates checksum, returns graph data
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/Sudhirkumar6009/MindMapAI.git
cd MindMapAI
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://sudhirkumarkiller1011:Sparrow%4090994575@libraxpert.dplxlzu.mongodb.net/LibraXpert?retryWrites=true&w=majority&appName=LibraXpert

# AI
GEMINI_API_KEY=your_gemini_api_key

# Security
JWT_SECRET=your_super_secret_jwt_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev     # Development with auto-reload
npm start       # Production
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev     # Development server
npm run build   # Production build
npm run preview # Preview production build
```

### 4. Open in Browser

Visit [http://localhost:5173](http://localhost:5173)

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create new account | ❌ |
| POST | `/api/auth/login` | User login, returns JWT | ❌ |
| GET | `/api/auth/me` | Get current user data | ✅ |

### Core AI Features

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/extract` | Extract concepts from text | ❌ |
| POST | `/api/upload` | Process PDF files | ❌ |
| POST | `/api/refine` | Refine and optimize graph | ❌ |
| POST | `/api/github/readme` | Import from GitHub repo | ❌ |

**Extract Request Body:**
```json
{
  "text": "Your content here...",
  "options": {
    "diagramType": "mindmap",
    "refine": true,
    "maxIterations": 2
  }
}
```

**Extract Response:**
```json
{
  "success": true,
  "concepts": ["Concept A", "Concept B"],
  "relationships": [
    { "source": "Concept A", "relation": "relates to", "target": "Concept B" }
  ],
  "diagramType": "mindmap"
}
```

### User Data

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/history` | Get user's mind maps | ✅ |
| POST | `/api/history` | Save new mind map | ✅ |
| DELETE | `/api/history/:id` | Delete mind map | ✅ |
| GET | `/api/graphs` | Get saved graphs | ✅ |
| GET | `/api/dashboard` | Get dashboard stats | ✅ |
| GET | `/api/profile` | Get user profile | ✅ |
| PUT | `/api/profile` | Update profile | ✅ |
| GET | `/api/settings` | Get user settings | ✅ |
| PUT | `/api/settings` | Update settings | ✅ |
| GET | `/api/notifications` | Get notifications | ✅ |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status and environment info |

---

## 🌐 Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Configure project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variable:
   - `VITE_API_URL` = Your Cloud Run backend URL

### Backend (Google Cloud Run)

```bash
cd backend

# Deploy with Cloud Run
gcloud run deploy mindmap-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production"
```

Set remaining environment variables in Cloud Run Console:
- `MONGODB_URI`
- `GEMINI_API_KEY`
- `JWT_SECRET`
- `FRONTEND_URL`

### Docker Deployment

```bash
cd backend
docker build -t mindmap-backend .
docker run -p 5000:5000 --env-file .env mindmap-backend
```

---

## 🧪 Demo Mode

Try MindMapAI without signing up:
1. Visit the landing page
2. Click "Try Demo" 
3. All features work with local storage
4. Sign up to save your work to the cloud

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test with multiple diagram types
- Update README for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Sudhir Kumar**

- GitHub: [@Sudhirkumar6009](https://github.com/Sudhirkumar6009)

---

<p align="center">
  <strong>⭐ Star this repo if you found it helpful!</strong>
</p>

<p align="center">
  Made with ❤️ using React, Node.js, and Google Gemini AI
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

<h1 align="center">🧠 MindMap AI</h1>

<p align="center">
  <strong>Transform your ideas into interactive knowledge graphs powered by AI</strong>
</p>

<p align="center">
  An intelligent knowledge graph generator that converts text, PDFs, and GitHub repositories into structured, interactive concept maps using Google Gemini AI.
</p>

---

## ✨ Features

### 🤖 AI-Powered Analysis
- **Smart Concept Extraction** — Automatically identifies key concepts from any text
- **Relationship Mapping** — Discovers and visualizes connections between ideas
- **Agentic Refinement** — Multi-agent system that iteratively improves graph quality

### 📄 Multiple Input Sources
- **Text Input** — Paste or type any content
- **PDF Upload** — Process documents up to 50MB
- **GitHub Integration** — Import README files directly from repositories

### 🎨 Interactive Visualization
- **Dynamic Graph View** — Powered by React Flow for smooth interactions
- **Multiple Layouts** — Hierarchical, radial, and force-directed options
- **Custom Styling** — Dark theme with gradient nodes and animated edges

### 💾 Data Management
- **User Authentication** — Secure JWT-based auth system
- **History Tracking** — Save and revisit your mind maps
- **Export Options** — PNG, SVG, JSON, and MMAI formats

### 🎯 User Experience
- **Demo Mode** — Try without signing up
- **Responsive Design** — Works on desktop and mobile
- **Real-time Updates** — See changes instantly

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Tailwind CSS, React Flow, Axios, Vite |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose |
| **AI Engine** | Google Gemini API (Multi-Agent Architecture) |
| **Auth** | JWT, bcrypt |
| **Deployment** | Vercel (Frontend), Google Cloud Run (Backend) |

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
MONGODB_URI=mongodb://localhost:27017/MindMapAI

# AI
GEMINI_API_KEY=your_gemini_api_key

# Security
JWT_SECRET=your_super_secret_jwt_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
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
npm run dev
```

### 4. Open in Browser

Visit [http://localhost:5173](http://localhost:5173)

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Core Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/extract` | Extract concepts from text |
| POST | `/api/upload` | Process PDF files |
| POST | `/api/refine` | Refine and optimize graph |
| POST | `/api/github/readme` | Import from GitHub |

### User Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Get user's mind maps |
| GET | `/api/graphs` | Get saved graphs |
| GET | `/api/dashboard` | Get dashboard stats |

---

## 🌐 Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add environment variable:
   - `VITE_API_URL` = Your Cloud Run backend URL

### Backend (Google Cloud Run)

```bash
cd backend
gcloud run deploy mindmap-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production"
```

Set remaining environment variables in Cloud Run Console.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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

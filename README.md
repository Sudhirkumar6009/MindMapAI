# MindMap AI

AI-powered knowledge graph generator that converts text and PDFs into structured concept maps.

## Features

- Text and PDF input support
- AI-powered concept extraction using Gemini
- Relationship mapping between concepts
- Interactive graph visualization
- Agentic refinement loop for optimal results

## Tech Stack

- **Frontend**: React, Tailwind CSS, Cytoscape.js
- **Backend**: Node.js, Express
- **AI**: Google Gemini API

## Setup


### Backend

```bash
cd backend
npm install
# Create .env file with GEMINI_API_KEY
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)

```
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
```

## API Endpoints

- `POST /api/extract` - Extract concepts and relationships from text
- `POST /api/upload` - Upload and process PDF files
- `POST /api/refine` - Refine and merge similar concepts

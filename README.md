# College Chatbot (GVP)

Production-ready real-time AI chatbot for:
Gayatri Vidya Parishad College for Degree and PG Courses (Autonomous).

## 1. Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express (ES Modules)
- AI: LangChain + Groq (`llama-3.3-70b-versatile`)
- RAG: JSON knowledge base -> embeddings -> in-memory vector store
- Streaming: Server-Sent Events (SSE) token streaming

## 2. Project Structure

```text
college-chatbot/
|-- client/
|   |-- components/
|   |-- pages/
|   |-- App.jsx
|   |-- main.jsx
|-- server/
|   |-- routes/chat.js
|   |-- services/llm.js
|   |-- rag/vectorStore.js
|   |-- rag/loader.js
|   |-- data/collegeData.json
|   |-- index.js
|-- .env
|-- package.json
```

## 3. Installation Commands

```bash
npm install
npm run install:all
```

## 4. Environment Setup

`/.env`

```env
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
PORT=5000
```

`/client/.env` (only for split-domain deployment)

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

## 5. Run Instructions

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

## 6. API Endpoint

`POST /api/chat`

Body:

```json
{
  "message": "user question"
}
```

Response:

- `text/event-stream` with token chunks (`event: token`)
- completion event (`event: done`)
- error event (`event: error`)

## 7. Assistant Behavior

- Introduces itself as: `Official AI Assistant of Gayatri Vidya Parishad College`
- For college-related questions:
  - uses RAG context from `server/data/collegeData.json`
  - does not fabricate missing facts
  - if unknown, returns exactly:
    - `I'm not sure about that. Please contact the college administration.`
- For non-college questions:
  - answers as a normal helpful AI assistant

## 8. Deployment Steps

### Option A: Split Deployment (Recommended)

1. Push this repository to GitHub.
2. Deploy backend on Render using [render.yaml](/d:/chatbot-campusConnect/render.yaml).
3. In Render service environment variables, set:
   - `GROQ_API_KEY=<your key>`
   - `GROQ_MODEL=llama-3.3-70b-versatile`
   - `CORS_ORIGIN=https://<your-vercel-domain>`
4. Deploy frontend on Vercel from `client/` directory.
5. In Vercel environment variables, set:
   - `VITE_API_BASE_URL=https://<your-render-backend-domain>`
6. Redeploy frontend after setting env vars.
7. Verify:
   - Backend health: `https://<backend-domain>/health`
   - Chat app loads and `/api/chat` streams response.

### Option B: Single VM/Container

1. Build frontend: `npm run build --prefix client`
2. Serve `client/dist` with Nginx or CDN.
3. Run backend with `pm2` or systemd.

## 9. Add New College Documents

1. Update [server/data/collegeData.json](/d:/chatbot-campusConnect/server/data/collegeData.json) for core structured facts.
2. Add extra files in `server/data/knowledge/` using `.json`, `.txt`, or `.md`.
3. Example starter file: [custom-college-faq.md](/d:/chatbot-campusConnect/server/data/knowledge/custom-college-faq.md).
4. Keep data official and verified.
5. Restart backend to reinitialize embeddings/vector store.

## 10. Groq API Key Setup

1. Create a key in your Groq console.
2. Put it in `/.env` as `GROQ_API_KEY`.
3. Keep keys server-side only.
4. Do not commit keys to Git.

## 11. Quick Production Checklist

1. Ensure `.env` is not committed (`.gitignore` already configured).
2. Rotate any keys that were previously shared in plain text.
3. Restrict backend CORS using `CORS_ORIGIN`.
4. Keep custom knowledge files in `server/data/knowledge/` and redeploy/restart backend after updates.

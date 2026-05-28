# OrchestrateAi

OrchestrateAi is an AI-powered workflow automation assistant. It allows users to write natural language commands (like "Summarize my internship emails and notify me") and instantly converts them into a visual, interactive workflow canvas using React Flow. It includes a simulated execution engine with real-time SSE updates.

## Tech Stack
* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, React Flow v11
* **Backend:** FastAPI (Python 3.11), SQLAlchemy, Alembic, asyncpg
* **Database:** PostgreSQL 16
* **AI:** OpenAI (`gpt-4o-mini`) or Google Gemini (`gemini-1.5-flash`)

## Prerequisites
* Docker and Docker Compose
* An OpenAI API key or Google Gemini API key

## Setup Instructions

1. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your `OPENAI_API_KEY` (or `GEMINI_API_KEY` if using `AI_PROVIDER=gemini`).

2. **Run Services**
   ```bash
   docker-compose up --build
   ```
   This will spin up three containers:
   - `postgres` on port `5432`
   - `backend` (FastAPI) on port `8000`
   - `frontend` (Next.js) on port `3000`

3. **Access the App**
   Open `http://localhost:3000` in your browser.

## How It Works

### The AI Prompt → JSON Pipeline
The core intelligence of OrchestrateAi lies in `backend/services/ai_parser.py`. We send the user's natural language request to an LLM along with a rigorously engineered system prompt. This prompt:
- Enforces a strict JSON schema for the output.
- Details the specific capabilities (allowed triggers like `gmail.new_email` and actions like `summarize`).
- Provides 3 few-shot examples of mapping complex natural language to our exact JSON schema.
- Handles unsupported requests by returning a specific error format.
FastAPI then validates the resulting JSON against a Pydantic schema before persisting it.

### JSON → React Flow Visualizer
Once the JSON is returned to the frontend, `frontend/src/lib/workflowToFlow.ts` transforms the structured data into nodes and edges:
- **Trigger Node:** Parsed and placed at the top (`y: 0`) with a distinct purple UI (`TriggerNode.tsx`).
- **Action Nodes:** Parsed sequentially and stacked below (`y: 120 * index`) with clean card styles (`ActionNode.tsx`).
- **Edges:** Animated SVG connections drawn from each node to the next.

### Real-Time Simulated Execution
When "Run Workflow" is clicked:
- The frontend connects to `GET /api/workflows/{id}/run` using the standard HTML5 `EventSource` API for Server-Sent Events (SSE).
- The FastAPI backend iterates through the workflow steps, adding realistic delays (`asyncio.sleep(0.3 to 1.2)`), and yielding real-time JSON log entries.
- The React frontend appends these to the `ExecutionLog.tsx` panel and updates progress spinners to checkmarks.

## Development Workflow
Both frontend and backend are configured with hot-reloading in `docker-compose`. Editing files in `./frontend/src/` or `./backend/` will instantly apply without needing to restart the containers.

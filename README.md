# Build&Learn Platform

Build&Learn is an interactive, multi-provider AI-powered learning workspace that guides developers through project creation, system design, real-time code development with concept gates, milestone reinforcement, self-reflection, and author attribution analytics. Designed as a monorepo, it features a resilient multi-model AI routing engine (Google Gemini, Groq, OpenRouter, DeepSeek, Anthropic) with automatic provider fallback, dynamic quiz generation, embedded Monaco Editor IDE, and JWT-based user authentication.

---

## Prerequisites

* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher

---

## Getting Started

Follow these steps to set up and run the project locally:

1. **Install Dependencies**
   Install all dependencies across the monorepo from the root directory:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Copy the example environment configuration to create your local `.env` file in `apps/api`:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   Open `apps/api/.env` and configure your secret keys and API keys as desired.

3. **Initialize Database**
   Navigate to `apps/api` and run Prisma migrations to initialize your local SQLite database:
   ```bash
   cd apps/api
   npx prisma migrate dev
   cd ../..
   ```

4. **Start Development Servers**
   Run the full development stack (API backend on port 4000 and Web frontend on port 3000) from the monorepo root:
   ```bash
   npm run dev
   ```

---

## Zero API Keys Local Dev Mode

> [!NOTE]
> The platform includes an automatic fallback mechanism powered by `MockAdapter` ([mockAdapter.ts](file:///c:/Users/shalo/.gemini/antigravity-ide/scratch/build-and-learn/apps/api/src/ai/adapters/mockAdapter.ts)). If no AI provider keys (`GEMINI_API_KEY`, `GROQ_API_KEY`, etc.) are configured in `apps/api/.env`, the system automatically uses smart mock responses. You can run and test the complete application locally with **zero paid API keys**.

---

## Project Structure Overview

```
build-and-learn/
├── apps/
│   ├── api/             # Node.js + Express backend, REST & WebSocket routes, Prisma ORM
│   └── web/             # React 18 + Vite frontend, Monaco Editor IDE, Zustand state stores
└── packages/
    └── shared-types/    # Universal TypeScript interfaces shared between API and Web
```

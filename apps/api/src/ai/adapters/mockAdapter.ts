import { ProviderAdapter, ChatCompletionParams } from '../providerAdapter';

export class MockAdapter implements ProviderAdapter {
  name = 'mock' as const;

  async chat(params: ChatCompletionParams): Promise<{ text: string; raw: unknown }> {
    const prompt = (params.systemPrompt + ' ' + params.messages.map(m => m.content).join(' ')).toLowerCase();

    // Check which role prompt pattern is present
    if (prompt.includes('roadmapgenerator')) {
      return {
        text: JSON.stringify({
          summary: "A robust modern web platform constructed in logical phases. Focuses on core backend API structure, authentication flows, real-time communication, and responsive frontend UI.",
          milestones: [
            { title: "Milestone 1: Foundations & Core API Setup", description: "Initialize environment, database entities, and basic REST endpoints.", conceptsIntroduced: ["REST API Design", "SQL Database Schema", "Async/Await Pattern"] },
            { title: "Milestone 2: User Authentication & Authorization", description: "Implement JWT sign-up, login, password hashing, and auth middleware.", conceptsIntroduced: ["JWT Authentication", "Password Hashing", "Middleware Pattern"] },
            { title: "Milestone 3: Real-Time Engine & State Sync", description: "Set up WebSockets for real-time state synchronization and live events.", conceptsIntroduced: ["WebSocket Protocol", "State Management", "Event Emitter Pattern"] },
            { title: "Milestone 4: Interactive Dashboard & UI Integration", description: "Build React frontend views, state stores, and dynamic data tables.", conceptsIntroduced: ["React Hooks", "State Management", "Component Composition"] }
          ],
          suggestedStack: ["React 18", "TypeScript", "Node.js", "Express", "SQLite", "Socket.IO"]
        }),
        raw: { mock: true }
      };
    }

    if (prompt.includes('conceptrecommender')) {
      return {
        text: JSON.stringify([
          { name: "REST API Design", category: "Backend Architecture", description: "Designing scalable HTTP endpoints with standardized status codes and payload structures." },
          { name: "JWT Authentication", category: "Security", description: "Securing routes with JSON Web Tokens and authorization headers." },
          { name: "State Management", category: "Frontend", description: "Managing centralized application state reactively across components." },
          { name: "Async/Await Pattern", category: "Core JavaScript", description: "Handling asynchronous flow without callback hell using promises." }
        ]),
        raw: { mock: true }
      };
    }

    if (prompt.includes('designfacilitator')) {
      return {
        text: "Great choice for your platform architecture! To ensure high availability and clean separation of concerns, I recommend splitting your application into a REST API Gateway, a core Service Layer, and a WebSocket real-time engine. How would you prefer to handle session storage and data persistence?",
        raw: { mock: true }
      };
    }

    if (prompt.includes('architecturesynthesizer')) {
      return {
        text: JSON.stringify({
          folderStructure: ["src/controllers", "src/services", "src/models", "src/routes", "src/middleware", "src/ws"],
          dbDesign: [
            { table: "users", fields: ["id UUID", "email TEXT", "password_hash TEXT", "created_at TIMESTAMPTZ"] },
            { table: "sessions", fields: ["id UUID", "user_id UUID", "token TEXT", "expires_at TIMESTAMPTZ"] }
          ],
          apiPlan: [
            { endpoint: "/api/auth/register", method: "POST", description: "Register a new user account" },
            { endpoint: "/api/auth/login", method: "POST", description: "Authenticate user and return JWT token" },
            { endpoint: "/api/data", method: "GET", description: "Fetch protected resource list" }
          ],
          uiFlow: ["User Login Screen", "Dashboard Overview", "Real-Time Workspace Editor", "Analytics & Reports"]
        }),
        raw: { mock: true }
      };
    }

    if (prompt.includes('codegenerator')) {
      return {
        text: `// Automatic generated code module\nimport express from 'express';\nimport jwt from 'jsonwebtoken';\n\nconst router = express.Router();\n\n// JWT Authentication Middleware\nexport function authenticateToken(req: any, res: any, next: any) {\n  const authHeader = req.headers['authorization'];\n  const token = authHeader && authHeader.split(' ')[1];\n  if (!token) return res.sendStatus(401);\n  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {\n    if (err) return res.sendStatus(403);\n    req.user = user;\n    next();\n  });\n}\n\nexport default router;\n`,
        raw: { mock: true }
      };
    }

    if (prompt.includes('teacher')) {
      return {
        text: JSON.stringify({
          conceptId: "jwt-auth-concept",
          conceptName: "JWT Authentication",
          summary: "JSON Web Tokens (JWT) are a compact, URL-safe means of representing claims to be transferred between two parties.",
          analogy: "Think of a JWT like a stamped wristband at an amusement park. Once verified at the entrance, you can show your wristband to ride any attraction without re-entering your password.",
          keyTakeaways: [
            "JWT consists of Header, Payload, and Signature.",
            "Stateless authentication: server verifies the cryptographic signature without querying the database on every request.",
            "Always store tokens securely and pass them via HTTP Authorization Bearer headers."
          ],
          codeExample: `// Generating a JWT Token\nconst token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });\n\n// Verifying a JWT Token\nconst payload = jwt.verify(token, SECRET_KEY);`
        }),
        raw: { mock: true }
      };
    }

    if (prompt.includes('quizgenerator')) {
      return {
        text: JSON.stringify({
          id: "quiz-" + Date.now(),
          conceptId: "jwt-auth-concept",
          format: "identify_bug",
          prompt: "Identify the security vulnerability in the following JWT verification code:",
          codeContext: "app.get('/protected', (req, res) => {\n  const token = req.headers['authorization'];\n  const decoded = jwt.decode(token); // Decoding without secret key!\n  res.send(`Welcome ${decoded.user}`);\n});",
          options: [
            "jwt.decode() parses payload without verifying signature; jwt.verify() must be used.",
            "Authorization header is missing Bearer prefix.",
            "Token is not converted to JSON.",
            "jwt.decode() should return a Promise."
          ],
          expectedAnswerPattern: "jwt.decode",
          difficulty: "applied"
        }),
        raw: { mock: true }
      };
    }

    if (prompt.includes('quizgrader')) {
      return {
        text: JSON.stringify({
          passed: true,
          result: "pass",
          scoreDelta: 0.25,
          explanation: "Spot on! Using jwt.decode() only un-base64s the payload without validating signature integrity, allowing attackers to forge tokens."
        }),
        raw: { mock: true }
      };
    }

    if (prompt.includes('mistakeanalyzer')) {
      return {
        text: JSON.stringify({
          diagnosis: "Syntax / Logical mismatch detected in token verification block.",
          suggestion: "Ensure you check if token exists before calling jwt.verify() to prevent null pointer exceptions.",
          fixedSnippet: "if (!token) return res.status(401).json({ error: 'Missing token' });"
        }),
        raw: { mock: true }
      };
    }

    if (prompt.includes('reflectionanalyzer')) {
      return {
        text: JSON.stringify({
          confidenceScore: 0.85,
          sentiment: "positive",
          feedback: "Great job completing this phase! You demonstrated solid understanding of state synchronization and core API patterns."
        }),
        raw: { mock: true }
      };
    }

    if (prompt.includes('reportgenerator')) {
      return {
        text: JSON.stringify({
          summary: "Completed project with high degree of independence across key backend and frontend concepts.",
          conceptsMastered: ["REST API Design", "JWT Authentication", "Async/Await Pattern"],
          aiVsLearnerRatio: { aiPct: 35, learnerPct: 65 }
        }),
        raw: { mock: true }
      };
    }

    if (prompt.includes('nextprojectrecommender')) {
      return {
        text: JSON.stringify([
          { title: "Real-Time Collaborative Code Editor", level: "intermediate", description: "Build an operational transformation editor with Socket.IO and Monaco Editor." },
          { title: "Microservices Auth & Rate Limiter", level: "advanced", description: "Implement distributed rate limiting with Redis and API Gateway routing." }
        ]),
        raw: { mock: true }
      };
    }

    // Default JSON/Text mock fallback
    if (params.jsonMode) {
      return {
        text: JSON.stringify({ status: "success", mock: true }),
        raw: { mock: true }
      };
    }

    return {
      text: "Build&Learn AI Provider Service Response: Mock Mode active.",
      raw: { mock: true }
    };
  }
}

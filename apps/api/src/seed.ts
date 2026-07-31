import { prisma } from './prismaClient';

export const DEFAULT_CONCEPTS = [
  {
    name: "REST API Design",
    category: "Backend Architecture",
    prerequisites: JSON.stringify([]),
    description: "Designing standard HTTP REST endpoints with structured JSON responses and status codes."
  },
  {
    name: "JWT Authentication",
    category: "Security",
    prerequisites: JSON.stringify(["REST API Design"]),
    description: "Securing web routes using JSON Web Tokens, Bearer headers, and password hashing."
  },
  {
    name: "WebSocket Protocol",
    category: "Real-time Communication",
    prerequisites: JSON.stringify(["REST API Design"]),
    description: "Full-duplex real-time communication between server and client."
  },
  {
    name: "State Management",
    category: "Frontend Architecture",
    prerequisites: JSON.stringify([]),
    description: "Managing centralized reactive application state across UI components."
  },
  {
    name: "Async/Await Pattern",
    category: "Core JavaScript",
    prerequisites: JSON.stringify([]),
    description: "Handling asynchronous flow control cleanly using promises and async/await."
  },
  {
    name: "Middleware Pattern",
    category: "Backend Architecture",
    prerequisites: JSON.stringify(["REST API Design"]),
    description: "Intercepting requests for authentication, logging, validation, and error handling."
  },
  {
    name: "AST Parsing & Code Analysis",
    category: "Advanced Tooling",
    prerequisites: JSON.stringify(["Async/Await Pattern"]),
    description: "Parsing code into Abstract Syntax Trees to detect concepts and static patterns."
  }
];

async function seed() {
  console.log("Seeding default concepts into database catalog...");
  for (const c of DEFAULT_CONCEPTS) {
    await prisma.concept.upsert({
      where: { name: c.name },
      update: { category: c.category, description: c.description, prerequisites: c.prerequisites },
      create: c
    });
  }
  console.log("Seeding complete!");
}

if (require.main === module) {
  seed()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error(err);
      prisma.$disconnect();
    });
}

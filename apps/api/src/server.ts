import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { projectRouter } from './routes/projects';
import { adminRouter } from './routes/admin';
import { authRouter } from './routes/auth';
import { setupWebSocket } from './ws/socketHandler';
import { prisma } from './prismaClient';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.set('io', io);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/admin', adminRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

setupWebSocket(io);

const PORT = process.env.PORT || 4000;

server.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(` Build&Learn API Server listening on port ${PORT}`);
  console.log(` REST API: http://localhost:${PORT}/api/projects`);
  console.log(` WebSocket: ws://localhost:${PORT}`);
  console.log(`====================================================`);
});

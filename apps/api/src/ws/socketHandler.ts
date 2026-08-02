import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  WsCodeStreamChunk,
  WsConceptGateEvent,
  WsQuizReadyEvent,
  WsMilestoneCompletedEvent,
  WsGateClearedEvent,
  WsProviderFallbackEvent
} from '@build-and-learn/shared-types';

let globalIO: SocketIOServer | null = null;

export function setupWebSocket(io: SocketIOServer) {
  globalIO = io;

  io.on('connection', (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    socket.on('join_project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`[WebSocket] Client ${socket.id} joined project room: project:${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });
}

export function getIO(): SocketIOServer | null {
  return globalIO;
}

export function emitCodeStreamChunk(io: SocketIOServer | null, projectId: string, payload: WsCodeStreamChunk) {
  const server = io || globalIO;
  if (!server) return;
  server.to(`project:${projectId}`).emit('code_stream_chunk', payload);
}

export function emitConceptGate(io: SocketIOServer | null, projectId: string, payload: WsConceptGateEvent) {
  const server = io || globalIO;
  if (!server) return;
  server.to(`project:${projectId}`).emit('concept_gate', payload);
}

export function emitQuizReady(io: SocketIOServer | null, projectId: string, payload: WsQuizReadyEvent) {
  const server = io || globalIO;
  if (!server) return;
  server.to(`project:${projectId}`).emit('quiz_ready', payload);
}

export function emitMilestoneCompleted(io: SocketIOServer | null, projectId: string, payload: WsMilestoneCompletedEvent) {
  const server = io || globalIO;
  if (!server) return;
  server.to(`project:${projectId}`).emit('milestone_completed', payload);
}

export function emitGateCleared(io: SocketIOServer | null, projectId: string, payload: WsGateClearedEvent) {
  const server = io || globalIO;
  if (!server) return;
  server.to(`project:${projectId}`).emit('gate_cleared', payload);
}

export function emitProviderFallback(io: SocketIOServer | null, projectId: string, payload: WsProviderFallbackEvent) {
  const server = io || globalIO;
  if (!server) return;
  server.to(`project:${projectId}`).emit('provider_fallback', payload);
}

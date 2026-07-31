import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  WsCodeStreamChunk,
  WsConceptGateEvent,
  WsQuizReadyEvent,
  WsMilestoneCompletedEvent,
  WsGateClearedEvent,
  WsProviderFallbackEvent
} from '@build-and-learn/shared-types';

export function setupWebSocket(io: SocketIOServer) {
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

export function emitCodeStreamChunk(io: SocketIOServer, projectId: string, payload: WsCodeStreamChunk) {
  io.to(`project:${projectId}`).emit('code_stream_chunk', payload);
}

export function emitConceptGate(io: SocketIOServer, projectId: string, payload: WsConceptGateEvent) {
  io.to(`project:${projectId}`).emit('concept_gate', payload);
}

export function emitQuizReady(io: SocketIOServer, projectId: string, payload: WsQuizReadyEvent) {
  io.to(`project:${projectId}`).emit('quiz_ready', payload);
}

export function emitMilestoneCompleted(io: SocketIOServer, projectId: string, payload: WsMilestoneCompletedEvent) {
  io.to(`project:${projectId}`).emit('milestone_completed', payload);
}

export function emitGateCleared(io: SocketIOServer, projectId: string, payload: WsGateClearedEvent) {
  io.to(`project:${projectId}`).emit('gate_cleared', payload);
}

export function emitProviderFallback(io: SocketIOServer, projectId: string, payload: WsProviderFallbackEvent) {
  io.to(`project:${projectId}`).emit('provider_fallback', payload);
}

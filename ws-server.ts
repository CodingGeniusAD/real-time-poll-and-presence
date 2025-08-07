import { WebSocket, WebSocketServer } from 'ws';
import { ClientMsg, ServerMsg, OptionId } from './types/websocket';

interface ServerState {
  online: Map<WebSocket, string>;
  counts: Record<OptionId, number>;
  userVotes: Map<WebSocket, OptionId>; // Track each user's current vote
}

const state: ServerState = {
  online: new Map(),
  counts: { A: 0, B: 0, C: 0 },
  userVotes: new Map()
};

function broadcast(message: ServerMsg, excludeSocket?: WebSocket) {
  const messageStr = JSON.stringify(message);
  
  state.online.forEach((_, socket) => {
    if (socket !== excludeSocket && socket.readyState === WebSocket.OPEN) {
      socket.send(messageStr);
    }
  });
}

function sendPresence(targetSocket?: WebSocket) {
  const onlineUsers = Array.from(state.online.values()).reverse(); // newest first
  const message: ServerMsg = { type: 'presence', online: onlineUsers };
  
  if (targetSocket) {
    if (targetSocket.readyState === WebSocket.OPEN) {
      targetSocket.send(JSON.stringify(message));
    }
  } else {
    broadcast(message);
  }
}

function sendCounts(targetSocket?: WebSocket) {
  const message: ServerMsg = { type: 'counts', counts: { ...state.counts } };
  
  if (targetSocket) {
    if (targetSocket.readyState === WebSocket.OPEN) {
      targetSocket.send(JSON.stringify(message));
    }
  } else {
    broadcast(message);
  }
}

function sendUserVote(socket: WebSocket) {
  const userVote = state.userVotes.get(socket) || null;
  const message: ServerMsg = { type: 'userVote', optionId: userVote };
  
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function handleClientMessage(socket: WebSocket, data: string) {
  try {
    const message: ClientMsg = JSON.parse(data);
    
    switch (message.type) {
      case 'join': {
        const { name } = message;
        if (typeof name === 'string' && name.trim()) {
          state.online.set(socket, name.trim());
          console.log(`User joined: ${name}`);
          sendPresence(); // Broadcast to all
        } else {
          const errorMsg: ServerMsg = { type: 'error', message: 'Invalid name' };
          socket.send(JSON.stringify(errorMsg));
        }
        break;
      }
      
      case 'vote': {
        const { optionId } = message;
        if (optionId === 'A' || optionId === 'B' || optionId === 'C') {
          const currentVote = state.userVotes.get(socket);
          
          // If user already voted for this option, remove their vote
          if (currentVote === optionId) {
            state.counts[optionId]--;
            state.userVotes.delete(socket);
            console.log(`Vote removed for ${optionId}. New counts:`, state.counts);
          } else {
            // If user voted for a different option, remove old vote and add new one
            if (currentVote) {
              state.counts[currentVote]--;
            }
            state.counts[optionId]++;
            state.userVotes.set(socket, optionId);
            console.log(`Vote cast for ${optionId}. New counts:`, state.counts);
          }
          
          sendCounts(); // Broadcast updated counts
          sendUserVote(socket); // Send updated vote status to user
        } else {
          const errorMsg: ServerMsg = { type: 'error', message: 'Invalid option' };
          socket.send(JSON.stringify(errorMsg));
        }
        break;
      }
      
      case 'removeVote': {
        const currentVote = state.userVotes.get(socket);
        if (currentVote) {
          state.counts[currentVote]--;
          state.userVotes.delete(socket);
          console.log(`Vote removed for ${currentVote}. New counts:`, state.counts);
          sendCounts(); // Broadcast updated counts
          sendUserVote(socket); // Send updated vote status to user
        }
        break;
      }
      
      default: {
        const errorMsg: ServerMsg = { type: 'error', message: 'Unknown message type' };
        socket.send(JSON.stringify(errorMsg));
      }
    }
  } catch (error) {
    console.error('Error parsing message:', error);
    const errorMsg: ServerMsg = { type: 'error', message: 'Invalid message format' };
    socket.send(JSON.stringify(errorMsg));
  }
}

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', (socket) => {
  console.log('Client connected');
  
  // Don't add socket to map until they join with a name
  
  // Send initial state
  sendPresence(socket);
  sendCounts(socket);
  sendUserVote(socket);
  
  socket.on('message', (data) => {
    handleClientMessage(socket, data.toString());
  });
  
  socket.on('close', () => {
    const userName = state.online.get(socket);
    const userVote = state.userVotes.get(socket);
    
    // Remove user's vote from counts if they had one
    if (userVote) {
      state.counts[userVote]--;
      sendCounts(); // Broadcast updated counts
    }
    
    state.online.delete(socket);
    state.userVotes.delete(socket);
    
    if (userName) {
      console.log(`User disconnected: ${userName}`);
      sendPresence(); // Broadcast updated presence
    }
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

console.log('WebSocket server running on ws://localhost:3001');

process.on('SIGTERM', () => {
  console.log('Shutting down WebSocket server...');
  wss.close(() => {
    process.exit(0);
  });
});
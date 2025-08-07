import { WebSocket, WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';
import { ClientMsg, ServerMsg, OptionId } from '@/types/websocket';

interface ServerState {
  online: Map<WebSocket, string>;
  counts: Record<OptionId, number>;
  userVotes: Map<WebSocket, OptionId>; // Track each user's current vote
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private state: ServerState = {
    online: new Map(),
    counts: { A: 0, B: 0, C: 0 },
    userVotes: new Map()
  };

  initialize(server: HttpServer) {
    if (this.wss) return; // Already initialized

    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (socket: WebSocket) => {
      console.log('Client connected');
      
      // Don't add socket to map until they join with a name
      
      // Send initial state
      this.sendPresence(socket);
      this.sendCounts(socket);
      this.sendUserVote(socket);
      
      socket.on('message', (data) => {
        this.handleClientMessage(socket, data.toString());
      });
      
      socket.on('close', () => {
        const userName = this.state.online.get(socket);
        const userVote = this.state.userVotes.get(socket);
        
        // Remove user's vote from counts if they had one
        if (userVote) {
          this.state.counts[userVote]--;
          this.sendCounts(); // Broadcast updated counts
        }
        
        this.state.online.delete(socket);
        this.state.userVotes.delete(socket);
        
        if (userName) {
          console.log(`User disconnected: ${userName}`);
          this.sendPresence(); // Broadcast updated presence
        }
      });
      
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });

    console.log('WebSocket server initialized');
  }

  private broadcast(message: ServerMsg, excludeSocket?: WebSocket) {
    const messageStr = JSON.stringify(message);
    
    this.state.online.forEach((_, socket) => {
      if (socket !== excludeSocket && socket.readyState === WebSocket.OPEN) {
        socket.send(messageStr);
      }
    });
  }

  private sendPresence(targetSocket?: WebSocket) {
    const onlineUsers = Array.from(this.state.online.values())
      .filter(name => name.trim() !== '') // Only include users with names
      .reverse(); // newest first
    const message: ServerMsg = { type: 'presence', online: onlineUsers };
    
    console.log(`Sending presence: ${onlineUsers.length} users online:`, onlineUsers);
    console.log(`Total connections: ${this.state.online.size}`);
    
    if (targetSocket) {
      if (targetSocket.readyState === WebSocket.OPEN) {
        targetSocket.send(JSON.stringify(message));
      }
    } else {
      this.broadcast(message);
    }
  }

  private sendCounts(targetSocket?: WebSocket) {
    const message: ServerMsg = { type: 'counts', counts: { ...this.state.counts } };
    
    if (targetSocket) {
      if (targetSocket.readyState === WebSocket.OPEN) {
        targetSocket.send(JSON.stringify(message));
      }
    } else {
      this.broadcast(message);
    }
  }

  private sendUserVote(socket: WebSocket) {
    const userVote = this.state.userVotes.get(socket) || null;
    const message: ServerMsg = { type: 'userVote', optionId: userVote };
    
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  private handleClientMessage(socket: WebSocket, data: string) {
    try {
      const message: ClientMsg = JSON.parse(data);
      
      switch (message.type) {
        case 'join': {
          const { name } = message;
          if (typeof name === 'string' && name.trim()) {
            this.state.online.set(socket, name.trim());
            console.log(`User joined: ${name}`);
            console.log(`Total connections after join: ${this.state.online.size}`);
            this.sendPresence(); // Broadcast to all
          } else {
            const errorMsg: ServerMsg = { type: 'error', message: 'Invalid name' };
            socket.send(JSON.stringify(errorMsg));
          }
          break;
        }
        
        case 'vote': {
          const { optionId } = message;
          if (optionId === 'A' || optionId === 'B' || optionId === 'C') {
            const currentVote = this.state.userVotes.get(socket);
            
            // If user already voted for this option, remove their vote
            if (currentVote === optionId) {
              this.state.counts[optionId]--;
              this.state.userVotes.delete(socket);
              console.log(`Vote removed for ${optionId}. New counts:`, this.state.counts);
            } else {
              // If user voted for a different option, remove old vote and add new one
              if (currentVote) {
                this.state.counts[currentVote]--;
              }
              this.state.counts[optionId]++;
              this.state.userVotes.set(socket, optionId);
              console.log(`Vote cast for ${optionId}. New counts:`, this.state.counts);
            }
            
            this.sendCounts(); // Broadcast updated counts
            this.sendUserVote(socket); // Send updated vote status to user
          } else {
            const errorMsg: ServerMsg = { type: 'error', message: 'Invalid option' };
            socket.send(JSON.stringify(errorMsg));
          }
          break;
        }
        
        case 'removeVote': {
          const currentVote = this.state.userVotes.get(socket);
          if (currentVote) {
            this.state.counts[currentVote]--;
            this.state.userVotes.delete(socket);
            console.log(`Vote removed for ${currentVote}. New counts:`, this.state.counts);
            this.sendCounts(); // Broadcast updated counts
            this.sendUserVote(socket); // Send updated vote status to user
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

  getStats() {
    return {
      onlineCount: Array.from(this.state.online.values()).filter(name => name.trim() !== '').length,
      totalVotes: this.state.counts.A + this.state.counts.B + this.state.counts.C,
      counts: { ...this.state.counts }
    };
  }

  // Debug method to clear state
  clearState() {
    this.state.online.clear();
    this.state.userVotes.clear();
    this.state.counts = { A: 0, B: 0, C: 0 };
    console.log('State cleared');
    this.sendPresence();
    this.sendCounts();
  }
}

export const wsManager = new WebSocketManager();
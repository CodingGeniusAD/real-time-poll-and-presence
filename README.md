# Real-time Presence and Poll Application

A modern real-time application built with Next.js 14, TypeScript, and integrated WebSockets that enables live presence tracking and poll voting across multiple browser tabs.

## Features

- **Real-time presence tracking** - See who's online instantly
- **Live poll voting** - Vote on options A, B, C with real-time results
- **Cross-tab synchronization** - Changes reflect immediately across all open tabs
- **Automatic reconnection** - Robust WebSocket connection with retry logic
- **Accessible UI** - Built with proper ARIA labels and semantic HTML
- **Type-safe** - Strict TypeScript with discriminated unions
- **No database** - Pure in-memory state management
- **Server statistics** - Real-time display of online users and vote counts

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Integrated Next.js WebSocket server using `ws` package
- **Styling**: Tailwind CSS with shadcn/ui components
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Start the integrated Next.js application with WebSocket server:

1. Start the WebSocket server: `npm run ws` (port 3001)
2. Start Next.js: `npm run dev:next` (port 3000)
3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Testing Multi-tab Sync

1. Open the application in multiple browser tabs
2. Enter different display names in each tab
3. Vote on different options and watch the results update in real-time across all tabs
4. Close and reopen tabs to see the reconnection logic in action

## Architecture

### WebSocket Protocol

The application uses a typed WebSocket protocol with discriminated unions:

```typescript
// Client to Server
type ClientMsg =
  | { type: 'join'; name: string }
  | { type: 'vote'; optionId: 'A' | 'B' | 'C' }
  | { type: 'removeVote' };

// Server to Client  
type ServerMsg =
  | { type: 'presence'; online: string[] }
  | { type: 'counts'; counts: Record<OptionId, number> }
  | { type: 'userVote'; optionId: OptionId | null }
  | { type: 'error'; message: string };
```

### Key Components

- **useWebSocket Hook** - Manages WebSocket connection, reconnection logic, and message handling
- **DisplayNameForm** - Handles user registration with localStorage persistence
- **PresencePanel** - Shows online users (first 10, newest first)
- **PollSection** - Interactive voting interface with real-time results
- **ConnectionStatus** - Visual indicator of WebSocket connection state
- **ServerStats** - Displays server statistics including online count and vote distribution

### Server Implementation

The integrated WebSocket server (`lib/websocket-server.ts`) maintains:
- `Map<WebSocket, string>` for online users
- `Record<OptionId, number>` for vote counts
- `Map<WebSocket, OptionId>` for tracking individual user votes
- Broadcast mechanisms for real-time updates
- RESTful API endpoint at `/api/stats` for server statistics

## Trade-offs & Decisions

### In-Memory State
- **Pro**: Simple, fast, no database setup required
- **Con**: Data lost on server restart, not suitable for production scale

### Direct WebSocket (vs Socket.io)
- **Pro**: Lightweight, standard WebSocket API, explicit message handling
- **Con**: Manual reconnection logic, no built-in rooms/namespaces

### Single WebSocket Connection
- **Pro**: Simple state management, predictable behavior
- **Con**: All updates go through one connection (could be optimized with connection pooling)

### Client-Side State Management
- **Pro**: No external dependencies, leverages React built-ins
- **Con**: More complex state synchronization vs dedicated state management library

### Integrated vs Separate WebSocket Server
- **Pro**: Single process, easier deployment, shared port
- **Con**: Slightly more complex setup, Next.js coupling

## Future Enhancements

- Persistent storage (Redis/Database)
- User authentication
- Multiple poll rooms
- Poll creation/management
- Rate limiting
- Message history
- Mobile-optimized UI

## Development

```bash
# Next.js only (separate WebSocket server)
npm run dev:next

# Separate WebSocket server
npm run ws  

# Type checking
npm run lint

# Production build
npm run build
```

## License

MIT License - feel free to use this project as a learning resource or starting point for your own real-time applications.
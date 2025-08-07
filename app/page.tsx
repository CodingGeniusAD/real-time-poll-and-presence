"use client";

import { useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { DisplayNameForm } from '@/components/DisplayNameForm';
import { PresencePanel } from '@/components/PresencePanel';
import { PollSection } from '@/components/PollSection';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { ServerStats } from '@/components/ServerStats';

export default function Home() {
  const [hasJoined, setHasJoined] = useState(false);
  
  const {
    connectionStatus,
    onlineUsers,
    voteCounts,
    currentVote,
    joinWithName,
    vote,
    removeVote,
    error
  } = useWebSocket('ws://localhost:3001');

  const handleNameSubmit = (name: string) => {
    joinWithName(name);
    setHasJoined(true);
  };

  const isConnected = connectionStatus === 'connected';
  const canInteract = isConnected && hasJoined;
  const totalVotes = voteCounts.A + voteCounts.B + voteCounts.C;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Real-time Poll & Presence
          </h1>
          <p className="text-muted-foreground">
            Join the room to vote and see who&apos;s online in real-time
          </p>
          <ConnectionStatus status={connectionStatus} error={error} />
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Join Room</h2>
              <DisplayNameForm
                onNameSubmit={handleNameSubmit}
                disabled={!isConnected}
              />
            </div>

            <PresencePanel onlineUsers={onlineUsers} />
            
            <ServerStats 
              onlineCount={onlineUsers.length}
              totalVotes={totalVotes}
              voteCounts={voteCounts}
            />
          </div>

          <div className="space-y-6">
            <PollSection
              voteCounts={voteCounts}
              currentVote={currentVote}
              onVote={vote}
              onRemoveVote={removeVote}
              disabled={!canInteract}
            />
          </div>
        </div>

        {!isConnected && (
          <div className="text-center py-8">
            <div className="bg-muted rounded-lg p-6">
              <h3 className="font-semibold mb-2">Connection Required</h3>
              <p className="text-sm text-muted-foreground">
                WebSocket server is integrated with Next.js
              </p>
              <code className="text-xs bg-background px-2 py-1 rounded mt-2 inline-block">
                npm run dev
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
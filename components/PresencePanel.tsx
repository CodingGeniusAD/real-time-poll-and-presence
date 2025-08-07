"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface PresencePanelProps {
  onlineUsers: string[];
}

export function PresencePanel({ onlineUsers }: PresencePanelProps) {
  const onlineCount = onlineUsers.length;
  const displayUsers = onlineUsers.slice(0, 10); // Show first 10

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users size={18} />
          Online Users
          <Badge variant="secondary">{onlineCount}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayUsers.length > 0 ? (
          <div className="space-y-2">
            {displayUsers.map((user, index) => (
              <div 
                key={`${user}-${index}`}
                className="flex items-center justify-between py-1"
              >
                <span className="text-sm font-medium">{user}</span>
                {index === 0 && (
                  <Badge variant="outline" className="text-xs">
                    Latest
                  </Badge>
                )}
              </div>
            ))}
            {onlineCount > 10 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{onlineCount - 10} more users online
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No users online</p>
        )}
      </CardContent>
    </Card>
  );
}
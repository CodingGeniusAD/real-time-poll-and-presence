"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { OptionId } from '@/types/websocket';

interface ServerStatsProps {
  onlineCount: number;
  totalVotes: number;
  voteCounts: Record<OptionId, number>;
}

export function ServerStats({ onlineCount, totalVotes, voteCounts }: ServerStatsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity size={18} />
          Server Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{onlineCount}</p>
            <p className="text-sm text-muted-foreground">Online Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{totalVotes}</p>
            <p className="text-sm text-muted-foreground">Total Votes</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Vote Distribution:</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <Badge variant="outline" className="w-full justify-center">
                A: {voteCounts.A}
              </Badge>
            </div>
            <div>
              <Badge variant="outline" className="w-full justify-center">
                B: {voteCounts.B}
              </Badge>
            </div>
            <div>
              <Badge variant="outline" className="w-full justify-center">
                C: {voteCounts.C}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { OptionId } from '@/types/websocket';

interface PollSectionProps {
  voteCounts: Record<OptionId, number>;
  currentVote: OptionId | null;
  onVote: (optionId: OptionId) => void;
  onRemoveVote: () => void;
  disabled: boolean;
}

const optionLabels: Record<OptionId, string> = {
  A: 'Option A',
  B: 'Option B', 
  C: 'Option C'
};

export function PollSection({ voteCounts, currentVote, onVote, onRemoveVote, disabled }: PollSectionProps) {
  const totalVotes = voteCounts.A + voteCounts.B + voteCounts.C;
  const maxVotes = Math.max(voteCounts.A, voteCounts.B, voteCounts.C);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 size={18} />
          Poll
          <Badge variant="secondary">{totalVotes} votes</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {(Object.keys(optionLabels) as OptionId[]).map((optionId) => {
            const count = voteCounts[optionId];
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            const isLeading = count === maxVotes && count > 0;
            const isCurrentVote = currentVote === optionId;

            return (
              <div key={optionId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => onVote(optionId)}
                    disabled={disabled}
                    variant={isCurrentVote ? "default" : "outline"}
                    size="sm"
                    className="min-w-24"
                  >
                    {isCurrentVote ? `Voted ${optionId}` : `Vote ${optionId}`}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Badge className="text-sm">
                      {count} votes
                    </Badge>
                    {isCurrentVote && (
                      <Badge variant="secondary" className="text-xs">
                        Your Vote
                      </Badge>
                    )}
                  </div>
                </div>
                {totalVotes > 0 && (
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`rounded-full h-2 transition-all duration-300 ${
                        isCurrentVote ? 'bg-primary' : 'bg-primary/70'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between gap-2 text-center text-sm">
            <div>
              <p className="font-medium">A: {voteCounts.A}</p>
            </div>
            <div className="text-muted-foreground">|</div>
            <div>
              <p className="font-medium">B: {voteCounts.B}</p>
            </div>
            <div className="text-muted-foreground">|</div>
              <div>
              <p className="font-medium">C: {voteCounts.C}</p>
            </div>
            <div className="text-muted-foreground">|</div>
            <div>
              <p className="font-medium">Total: {totalVotes}</p>
            </div>
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}
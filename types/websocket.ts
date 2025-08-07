export type OptionId = 'A' | 'B' | 'C';

export type ClientMsg =
  | { type: 'join'; name: string }
  | { type: 'vote'; optionId: OptionId }
  | { type: 'removeVote' };

export type ServerMsg =
  | { type: 'presence'; online: string[] } // newest first
  | { type: 'counts'; counts: Record<OptionId, number> }
  | { type: 'userVote'; optionId: OptionId | null }
  | { type: 'error'; message: string };

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';
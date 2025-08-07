"use client";

import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { ConnectionStatus as Status } from '@/types/websocket';

interface ConnectionStatusProps {
  status: Status;
  error?: string | null;
}

const statusConfig = {
  connected: {
    label: 'Connected',
    variant: 'default' as const,
    icon: Wifi,
    className: 'text-green-600 bg-green-50 border-green-200'
  },
  reconnecting: {
    label: 'Reconnecting...',
    variant: 'secondary' as const,
    icon: RotateCcw,
    className: 'text-yellow-600 bg-yellow-50 border-yellow-200'
  },
  disconnected: {
    label: 'Disconnected',
    variant: 'destructive' as const,
    icon: WifiOff,
    className: 'text-red-600 bg-red-50 border-red-200'
  }
};

export function ConnectionStatus({ status, error }: ConnectionStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className={config.className}>
        <Icon size={12} className="mr-1" />
        {config.label}
      </Badge>
      {error && (
        <span className="text-xs text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
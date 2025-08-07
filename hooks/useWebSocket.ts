"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { ClientMsg, ServerMsg, ConnectionStatus, OptionId } from '@/types/websocket';

interface UseWebSocketReturn {
  connectionStatus: ConnectionStatus;
  onlineUsers: string[];
  voteCounts: Record<OptionId, number>;
  currentVote: OptionId | null;
  sendMessage: (message: ClientMsg) => void;
  joinWithName: (name: string) => void;
  vote: (optionId: OptionId) => void;
  removeVote: () => void;
  error: string | null;
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<OptionId, number>>({ A: 0, B: 0, C: 0 });
  const [currentVote, setCurrentVote] = useState<OptionId | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  
  const connect = useCallback(() => {
    try {
      // Handle both integrated (port 3000) and separate (port 3001) WebSocket servers
      const wsUrl = url;
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
      };
      
      ws.onmessage = (event) => {
        try {
          const message: ServerMsg = JSON.parse(event.data);
          
          switch (message.type) {
            case 'presence':
              setOnlineUsers(message.online.slice(0, 10)); // First 10 users
              break;
              
            case 'counts':
              setVoteCounts(message.counts);
              break;
              
            case 'userVote':
              setCurrentVote(message.optionId);
              break;
              
            case 'error':
              setError(message.message);
              console.error('Server error:', message.message);
              break;
              
            default:
              console.warn('Unknown message type:', message);
          }
        } catch (err) {
          console.error('Error parsing server message:', err);
          setError('Failed to parse server response');
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        websocketRef.current = null;
        
        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          setConnectionStatus('reconnecting');
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, 3000);
        } else {
          setError('Maximum reconnection attempts reached');
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
      };
      
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect to server');
      setConnectionStatus('disconnected');
    }
  }, [url]);
  
  const sendMessage = useCallback((message: ClientMsg) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
      setError('Not connected to server');
    }
  }, []);
  
  const joinWithName = useCallback((name: string) => {
    sendMessage({ type: 'join', name });
  }, [sendMessage]);
  
  const vote = useCallback((optionId: OptionId) => {
    sendMessage({ type: 'vote', optionId });
  }, [sendMessage]);

  const removeVote = useCallback(() => {
    sendMessage({ type: 'removeVote' });
  }, [sendMessage]);
  
  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [connect]);
  
  return {
    connectionStatus,
    onlineUsers,
    voteCounts,
    currentVote,
    sendMessage,
    joinWithName,
    vote,
    removeVote,
    error
  };
}
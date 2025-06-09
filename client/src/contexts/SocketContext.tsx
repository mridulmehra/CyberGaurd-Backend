import React, { createContext, useEffect, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';

interface SocketContextType {
  isConnected: boolean;
  sendMessage: (type: string, payload: any) => void;
  on: (type: string, handler: (payload: any) => void) => void;
  off: (type: string) => void;
}

export const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  // Determine the WebSocket URL
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  const { isConnected, sendMessage, on, off } = useSocket(wsUrl);

  return (
    <SocketContext.Provider value={{ isConnected, sendMessage, on, off }}>
      {children}
    </SocketContext.Provider>
  );
};

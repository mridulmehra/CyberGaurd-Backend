import { useEffect, useRef, useState, useCallback } from 'react';

type MessageHandler = (message: any) => void;

export const useSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlers = useRef<Record<string, MessageHandler>>({});

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(url);

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onclose = () => {
      setIsConnected(false);
      // Attempt to reconnect after 2 seconds
      setTimeout(() => {
        connect();
      }, 2000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      socket.close();
    };

    socket.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);
        const handler = messageHandlers.current[type];
        if (handler) {
          handler(payload);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socketRef.current = socket;
  }, [url]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket not connected');
    }
  }, []);

  const on = useCallback((type: string, handler: MessageHandler) => {
    messageHandlers.current[type] = handler;
  }, []);

  const off = useCallback((type: string) => {
    delete messageHandlers.current[type];
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    sendMessage,
    on,
    off,
  };
};

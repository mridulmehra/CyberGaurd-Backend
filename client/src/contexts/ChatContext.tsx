import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { SocketContext } from './SocketContext';
import { User, Message } from '../types';

interface ChatContextType {
  // User state
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  users: User[];
  
  // Room state
  currentRoom: string;
  setCurrentRoom: React.Dispatch<React.SetStateAction<string>>;
  
  // Message state
  messages: Message[];
  
  // Actions
  joinRoom: (username: string, room: string) => void;
  leaveRoom: () => void;
  sendMessage: (text: string) => void;
  clearChat: () => void;
  reportMessage: (messageId: number, reason?: string) => void;
  
  // UI state
  showLoginModal: boolean;
  setShowLoginModal: React.Dispatch<React.SetStateAction<boolean>>;
  showMobileSidebar: boolean;
  setShowMobileSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  toxicityAlert: {
    show: boolean;
    message?: string;
  };
  setToxicityAlert: React.Dispatch<React.SetStateAction<{
    show: boolean;
    message?: string;
  }>>;
  reportingMessage: Message | null;
  setReportingMessage: React.Dispatch<React.SetStateAction<Message | null>>;
}

export const ChatContext = createContext<ChatContextType | null>(null);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const socketContext = useContext(SocketContext);
  
  if (!socketContext) {
    throw new Error('ChatProvider must be used within a SocketProvider');
  }
  
  const { isConnected, sendMessage: socketSend, on, off } = socketContext;
  
  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  // Room state
  const [currentRoom, setCurrentRoom] = useState<string>('general');
  
  // Message state
  const [messages, setMessages] = useState<Message[]>([]);
  
  // UI state
  const [showLoginModal, setShowLoginModal] = useState<boolean>(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);
  const [toxicityAlert, setToxicityAlert] = useState<{ show: boolean, message?: string }>({
    show: false
  });
  const [reportingMessage, setReportingMessage] = useState<Message | null>(null);
  
  // Set up socket event listeners
  useEffect(() => {
    if (!isConnected) return;
    
    // Listen for user list updates
    on('usersList', (updatedUsers) => {
      setUsers(updatedUsers);
    });
    
    // Listen for new users joining
    on('userJoined', (user) => {
      setUsers(prev => {
        // Don't add duplicate users
        if (prev.some(u => u.username === user.username)) {
          return prev;
        }
        return [...prev, user];
      });
      
      // Add system message
      const systemMessage: Message = {
        text: `${user.username} has joined the chat`,
        username: 'system',
        room: currentRoom,
        isModified: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, systemMessage]);
    });
    
    // Listen for users leaving
    on('userLeft', (username) => {
      setUsers(prev => prev.filter(user => user.username !== username));
      
      // Add system message
      const systemMessage: Message = {
        text: `${username} has left the chat`,
        username: 'system',
        room: currentRoom,
        isModified: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, systemMessage]);
    });
    
    // Listen for incoming messages
    on('message', (message) => {
      // Replace optimistic messages with server-confirmed messages when they arrive
      setMessages(prev => 
        prev.filter(msg => 
          // Remove any optimistic message from the same user with temporary ID
          !(msg.id && msg.id < 0 && msg.username === message.username)
        ).concat(message)
      );
    });
    
    // Listen for toxicity score updates
    on('updateToxicityScore', ({ username, score }) => {
      setUsers(prev => 
        prev.map(user => 
          user.username === username 
            ? { ...user, toxicityScore: score } 
            : user
        )
      );
      
      // Update current user's score if it's them
      if (currentUser && currentUser.username === username) {
        setCurrentUser(prev => prev ? { ...prev, toxicityScore: score } : null);
      }
    });
    
    // Listen for errors from the server
    on('error', (error) => {
      console.error('Server error:', error.message);
      
      // Show error as system message
      const errorMessage: Message = {
        text: `Error: ${error.message}`,
        username: 'system',
        room: currentRoom,
        isModified: false,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    });
    
    // Cleanup
    return () => {
      off('usersList');
      off('userJoined');
      off('userLeft');
      off('message');
      off('updateToxicityScore');
      off('error');
    };
  }, [isConnected, currentRoom, currentUser, on, off]);
  
  // Join a room
  const joinRoom = (username: string, room: string) => {
    if (!isConnected) return;
    
    setCurrentUser({
      username,
      room,
      toxicityScore: 0
    });
    
    setCurrentRoom(room);
    setMessages([]);
    socketSend('join', { username, room });
    setShowLoginModal(false);
  };
  
  // Leave the room
  const leaveRoom = () => {
    if (!isConnected || !currentUser) return;
    
    socketSend('leave', currentUser.username);
    setCurrentUser(null);
    setUsers([]);
    setMessages([]);
    setShowLoginModal(true);
  };
  
  // Send a message
  const sendMessage = (text: string) => {
    if (!isConnected || !currentUser || !text.trim()) return;
    
    // Optimistically add the message to UI before server response
    const optimisticMessage: Message = {
      text: text.trim(),
      username: currentUser.username,
      room: currentRoom,
      isModified: false,
      timestamp: new Date().toISOString()
    };
    
    // Add optimistic message with a temporary ID to differentiate it
    setMessages(prev => [...prev, { ...optimisticMessage, id: -Date.now() }]);
    
    // Actually send the message to the server
    socketSend('message', text);
  };
  
  // Clear all messages in the current room
  const clearChat = () => {
    if (!isConnected || !currentUser) return;
    
    // Send clear chat request to the server
    socketSend('clearChat', currentRoom);
  };
  
  // Listen for chat cleared event
  useEffect(() => {
    if (!isConnected) return;
    
    on('chatCleared', (room) => {
      if (room === currentRoom) {
        // Clear local messages when server confirms chat was cleared
        setMessages([]);
      }
    });
    
    return () => {
      off('chatCleared');
    };
  }, [isConnected, currentRoom, on, off]);
  
  // Report a message
  const reportMessage = (messageId: number, reason?: string) => {
    if (!isConnected || !currentUser) return;
    
    // Send report message request to the server
    socketSend('reportMessage', { messageId, reason });
    
    // Clear the reporting message state
    setReportingMessage(null);
    
    // Show a system message to the user confirming their report
    const systemMessage: Message = {
      text: `Your report has been submitted. Thank you for helping keep the chat safe.`,
      username: 'system',
      room: currentRoom,
      isModified: false,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };
  
  const value = {
    currentUser,
    setCurrentUser,
    users,
    currentRoom,
    setCurrentRoom,
    messages,
    joinRoom,
    leaveRoom,
    sendMessage,
    clearChat,
    reportMessage,
    showLoginModal,
    setShowLoginModal,
    showMobileSidebar,
    setShowMobileSidebar,
    toxicityAlert,
    setToxicityAlert,
    reportingMessage,
    setReportingMessage
  };
  
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

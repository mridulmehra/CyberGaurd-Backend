import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ReportDialog } from './ReportDialog';
import { 
  Users, 
  X, 
  Info, 
  AlertTriangle, 
  WandSparkles, 
  Send, 
  Sparkles, 
  Bot,
  Shield,
  Trash2,
  Flag
} from 'lucide-react';
import { 
  formatTime, 
  getToxicityColor, 
  getToxicityBgColor, 
  getToxicityGradientStyle, 
  isMyMessage 
} from '../lib/utils';

export const ChatArea = () => {
  const { 
    currentUser, 
    currentRoom, 
    messages, 
    sendMessage, 
    clearChat,
    setShowMobileSidebar,
    toxicityAlert,
    setToxicityAlert,
    reportingMessage,
    setReportingMessage
  } = useChat();
  
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (messageText.trim() && currentUser) {
      sendMessage(messageText.trim());
      setMessageText('');
    }
  };
  
  // Convert room value to display name
  const getRoomDisplayName = (room: string) => {
    switch (room) {
      case 'general': return 'General Chat';
      case 'tech': return 'Tech Discussion';
      case 'random': return 'Random';
      default: return room;
    }
  };
  
  // Get room emoji
  const getRoomEmoji = (room: string) => {
    switch (room) {
      case 'general': return '💬';
      case 'tech': return '💻';
      case 'random': return '🎲';
      case 'support': return '🆘';
      case 'music': return '🎵';
      case 'gaming': return '🎮';
      default: return '📝';
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-gradient-to-b from-neutral-50 to-neutral-100">
      {/* Mobile Header */}
      <div className="flex items-center justify-between md:hidden px-4 py-3 glass-card z-10">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setShowMobileSidebar(true)}
          className="h-9 w-9"
        >
          <Users className="h-5 w-5" />
        </Button>
        <div className="flex items-center px-3 py-1.5 bg-neutral-50 rounded-full shadow-sm">
          <span className="mr-2">{getRoomEmoji(currentRoom)}</span>
          <span className="font-medium text-sm">{getRoomDisplayName(currentRoom)}</span>
        </div>
        {currentUser && (
          <div className="flex items-center w-10 h-10 justify-center rounded-full bg-white shadow-sm border border-neutral-200">
            <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center relative">
              <div className="toxicity-bar absolute inset-0 opacity-70" style={{width: `${currentUser.toxicityScore}%`}} />
              <span className="text-xs font-medium z-10 drop-shadow-sm">{currentUser.toxicityScore}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Message Display Area with subtle gradient background */}
      <div 
        ref={messageContainerRef}
        className="message-area flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTRtMC0xN2MwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNG0tMTcgMGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNG0wIDE3YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00Ii8+PC9nPjwvZz48L3N2Zz4=')] bg-opacity-10"
      >
        {/* Header with welcome message and clear button */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <div className="glass-card flex items-center space-x-2 px-5 py-3 rounded-full text-neutral-700 shadow-md">
            <Shield className="h-5 w-5 text-primary mr-1" />
            <span>Welcome to SafeChat! Messages are automatically moderated for a positive environment.</span>
          </div>
          
          {currentUser && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="mt-3 sm:mt-0 flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Chat</span>
            </Button>
          )}
        </div>
        
        {/* Messages */}
        {messages.map((message, index) => {
          if (message.username === 'system') {
            // System message
            return (
              <div key={index} className="flex justify-center">
                <div className="glass-card flex items-center px-5 py-3 rounded-full text-neutral-700">
                  <Bot className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  <span>{message.text}</span>
                </div>
              </div>
            );
          } else if (currentUser && isMyMessage(message.username, currentUser.username)) {
            // Own message
            return (
              <div key={index} className="flex items-end justify-end">
                <div className="flex flex-col max-w-xs md:max-w-md space-y-1.5 items-end">
                  {message.isModified ? (
                    <div className="px-5 py-3 rounded-2xl bg-white border-l-4 border-amber-500 shadow-md">
                      <p className="text-neutral-800">
                        {message.text}
                      </p>
                      <div className="mt-1.5 flex items-center">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                        <span className="text-xs font-medium text-amber-600">Modified for civility</span>
                      </div>
                    </div>
                  ) : (
                    <div className="px-5 py-3 rounded-2xl bg-gradient-to-br from-primary to-teal-500 text-white shadow-md">
                      <p>{message.text}</p>
                    </div>
                  )}
                  <div className="flex items-center text-xs text-neutral-500 mr-1 font-medium">
                    <span>{formatTime(message.timestamp)}</span>
                    <span className="ml-1.5">You</span>
                  </div>
                </div>
              </div>
            );
          } else {
            // Other user's message
            const userToxicityScore = currentUser ? 
              currentUser.toxicityScore : 0;
            const toxicityColor = getToxicityColor(userToxicityScore);
            
            return (
              <div key={index} className="flex items-end">
                <div className="flex flex-col max-w-xs md:max-w-md space-y-1.5">
                  <div className="flex items-center">
                    <div className="relative h-3 w-3 rounded-full overflow-hidden mr-2 flex-shrink-0">
                      <div 
                        className="h-full w-full absolute" 
                        style={getToxicityGradientStyle(userToxicityScore)}
                      />
                    </div>
                    <span className={`text-xs font-medium ${toxicityColor}`}>
                      {message.username}
                    </span>
                  </div>
                  {message.isModified ? (
                    <div className="glass-card relative px-5 py-3 rounded-2xl bg-white border-l-4 border-amber-500 shadow-md group">
                      <p className="text-neutral-800">
                        {message.text}
                      </p>
                      <div className="mt-1.5 flex items-center">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                        <span className="text-xs font-medium text-amber-600">Modified for civility</span>
                      </div>
                      
                      {/* Report button */}
                      {currentUser && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto w-auto rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setReportingMessage(message)}
                          title="Report message"
                        >
                          <Flag className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="glass-card relative px-5 py-3 rounded-2xl shadow-md group">
                      <p className="text-neutral-800">{message.text}</p>
                      
                      {/* Report button */}
                      {currentUser && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto w-auto rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setReportingMessage(message)}
                          title="Report message"
                        >
                          <Flag className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                  <span className="text-xs text-neutral-500 ml-1 font-medium">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            );
          }
        })}
        <div ref={messagesEndRef} className="h-2" />
      </div>
      
      {/* Report Dialog */}
      <ReportDialog 
        message={reportingMessage} 
        onClose={() => setReportingMessage(null)} 
      />
      
      {/* Message Input Area */}
      <div className="glass-card bg-white/90 backdrop-blur-md border-t border-neutral-200 p-5">
        {/* Toxicity Alert */}
        {toxicityAlert.show && (
          <Alert className="bg-gradient-to-r from-red-600 to-red-500 text-white mb-4 flex items-start rounded-xl shadow-lg">
            <AlertTriangle className="h-5 w-5 mr-3" />
            <div className="flex-1">
              <AlertTitle className="mb-1 font-semibold text-base">Message Not Sent - Toxicity Detected</AlertTitle>
              <AlertDescription className="text-white/90">
                Your message was flagged as potentially harmful. We've suggested an alternative below that keeps your intent while being more respectful.
              </AlertDescription>
            </div>
            <Button 
              variant="ghost" 
              className="text-white p-1 h-auto hover:bg-white/10" 
              onClick={() => setToxicityAlert({ show: false })}
            >
              <X className="h-5 w-5" />
            </Button>
          </Alert>
        )}
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message here..."
              className="resize-none min-h-[50px] max-h-48 pr-12 rounded-xl border-neutral-200 focus-visible:ring-primary shadow-sm"
              rows={1}
              onKeyDown={(e) => {
                // Using keyCode for better cross-browser compatibility
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault(); // Prevent default to stop new line
                  // Only send if there's text and user is logged in
                  if (messageText.trim() && currentUser) {
                    handleSubmit(e);
                  }
                }
              }}
            />
            <div className="absolute right-3 bottom-3 flex items-center text-xs text-neutral-400">
              <Bot className="h-3.5 w-3.5 mr-1 text-primary" />
              <span>Content Moderated</span>
            </div>
          </div>
          <Button 
            type="submit" 
            className="rounded-full p-3 h-auto w-auto aspect-square shadow-md"
            disabled={!messageText.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        
        <div className="flex items-center justify-center space-x-2 mt-3 text-xs text-neutral-500">
          <div className="flex items-center">
            <Shield className="h-3.5 w-3.5 text-green-600 mr-1" />
            <span>Content Moderated</span>
          </div>
          <span className="text-neutral-300">•</span>
          <div className="flex items-center">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 mr-1" />
            <span>Toxicity Filtered</span>
          </div>
          <span className="text-neutral-300">•</span>
          <div className="flex items-center">
            <Info className="h-3.5 w-3.5 text-primary mr-1" />
            <span>Delivering Safer Texting Environment</span>
          </div>
        </div>
      </div>
    </main>
  );
};

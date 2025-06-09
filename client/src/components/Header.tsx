import React from 'react';
import { useChat } from '../hooks/useChat';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { LogOut, MessageCircle, Info, Settings } from 'lucide-react';
import { getToxicityColor, getToxicityBgColor, getToxicityGradientStyle, generateUserColor } from '../lib/utils';
import { Link } from 'wouter';

export const Header = () => {
  const { currentUser, currentRoom, leaveRoom, setShowMobileSidebar } = useChat();
  
  if (!currentUser) return null;
  
  const toxicityColor = getToxicityColor(currentUser.toxicityScore);
  const toxicityBgColor = getToxicityBgColor(currentUser.toxicityScore);
  
  // Get room display name
  const getRoomDisplayName = (room: string) => {
    switch (room) {
      case 'general': return '💬 General Chat';
      case 'tech': return '💻 Tech Discussion';
      case 'random': return '🎲 Random';
      case 'support': return '🆘 Support';
      case 'music': return '🎵 Music';
      case 'gaming': return '🎮 Gaming';
      default: return `📝 ${room}`;
    }
  };
  
  return (
    <header className="bg-white border-b border-neutral-200 py-4 px-5 flex justify-between items-center shadow-sm">
      <div className="flex items-center">
        <MessageCircle className="text-primary h-6 w-6 mr-3" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-teal-500 text-transparent bg-clip-text">
          SafeChat
        </h1>
        <span className="bg-gradient-to-r from-green-600 to-teal-500 text-white text-xs px-3 py-1 rounded-full ml-3 font-medium">
          Smart-Moderated
        </span>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Room display */}
        <div className="hidden md:flex items-center">
          <div className="px-3 py-1.5 bg-neutral-100 rounded-md text-neutral-800 font-medium">
            {getRoomDisplayName(currentRoom)}
          </div>
        </div>
        
        {/* Features link */}
        <Link 
          href="/features" 
          className="hidden md:flex items-center text-primary hover:text-primary/80"
        >
          <Info className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">Features</span>
        </Link>
      
        {/* Desktop toxicity display */}
        <div className="hidden md:flex items-center mr-2 py-1 px-3 bg-neutral-100 rounded-md">
          <div className="w-32 h-3 bg-neutral-200 rounded-full overflow-hidden mr-2">
            <div 
              className="h-full" 
              style={getToxicityGradientStyle(currentUser.toxicityScore)} 
            />
          </div>
          <span className="text-sm text-neutral-700">
            <span className="font-medium">{currentUser.toxicityScore}%</span>
          </span>
        </div>
        
        {/* User dropdown */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center rounded-full px-4 py-2 h-auto border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-teal-500/10 hover:from-primary/15 hover:to-teal-500/15"
                  >
                    <span className="flex h-5 w-5 rounded-full mr-2 overflow-hidden border border-neutral-200 shadow-md">
                      <span 
                        className="h-full w-full" 
                        style={{ backgroundColor: generateUserColor(currentUser.username) }} 
                      />
                    </span>
                    <span className="font-medium text-base text-primary">
                      {currentUser.username}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="px-4 py-3 border-b border-neutral-200">
                    <p className="text-sm text-neutral-600 mb-1">Signed in as</p>
                    <p className="font-medium text-lg text-neutral-800">{currentUser.username}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-neutral-600 mb-2">Toxicity Score</p>
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full" 
                          style={getToxicityGradientStyle(currentUser.toxicityScore)} 
                        />
                      </div>
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>Healthy (0%)</span>
                        <span>Toxic (100%)</span>
                      </div>
                      <p className="text-center text-sm font-medium">
                        Your score: {currentUser.toxicityScore}%
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/features">
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Features & Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={leaveRoom} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave Room
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>
              <p>Your toxicity score: {currentUser.toxicityScore}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};

import React from 'react';
import { useChat } from '../hooks/useChat';
import { getToxicityColor, getToxicityBgColor, getToxicityGradientStyle } from '../lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from './ui/tooltip';
import { Users, Info, MessageSquare } from 'lucide-react';
import { Link } from 'wouter';

export const Sidebar = () => {
  const { users, currentRoom } = useChat();
  
  // Convert room value to display name
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
    <aside className="hidden md:flex flex-col w-72 bg-white border-r border-neutral-200">
      <div className="p-5 border-b border-neutral-200">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-lg font-semibold text-neutral-800">Room</h2>
        </div>
        <p className="text-neutral-700 text-sm mt-2 font-medium">
          {getRoomDisplayName(currentRoom)}
        </p>
        <div className="mt-3 flex items-center text-xs text-neutral-500">
          <span className="inline-block w-2 h-2 bg-green-600 rounded-full mr-1"></span>
          <span>{users.length} users online</span>
        </div>
      </div>
      
      <div className="p-5 border-b border-neutral-200">
        <div className="flex items-center mb-3">
          <Users className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-sm font-semibold text-neutral-800">Users Online</h3>
        </div>
        <div className="space-y-3">
          {users.map((user) => {
            const toxicityColor = getToxicityColor(user.toxicityScore);
            
            return (
              <TooltipProvider key={user.username}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center group hover:bg-neutral-50 p-1 rounded-md transition-colors">
                      <div className="relative h-3 w-3 rounded-full overflow-hidden mr-2 flex-shrink-0">
                        <div 
                          className="h-full w-full absolute" 
                          style={getToxicityGradientStyle(user.toxicityScore)}
                        />
                      </div>
                      <span className={`text-sm font-medium ${toxicityColor}`}>
                        {user.username}
                      </span>
                      
                      {/* Small toxicity score indicator */}
                      <span className="ml-auto text-xs text-neutral-500">
                        {user.toxicityScore}%
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="p-0">
                    <div className="w-64 p-4">
                      <p className="text-base font-semibold mb-2">{user.username}</p>
                      <div className="mb-3">
                        <p className="text-sm text-neutral-600 mb-2">
                          Toxicity Score: <span className="font-medium">{user.toxicityScore}%</span>
                        </p>
                        <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full" 
                            style={getToxicityGradientStyle(user.toxicityScore)} 
                          />
                        </div>
                        <div className="flex justify-between text-xs text-neutral-500 mt-1">
                          <span>Healthy</span>
                          <span>Toxic</span>
                        </div>
                      </div>
                      <div className="text-xs text-neutral-600 bg-neutral-50 p-2 rounded">
                        <p className="mb-1 font-medium">What does this mean?</p>
                        <p>
                          This user's messages have been analyzed for toxic content. 
                          {user.toxicityScore < 30 ? (
                            <span className="text-green-600"> Their communication has been healthy.</span>
                          ) : user.toxicityScore < 70 ? (
                            <span className="text-amber-500"> They've shown moderate toxicity.</span>
                          ) : (
                            <span className="text-red-600"> They've displayed highly toxic behavior.</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
      
      <div className="p-5 flex-grow">
        <div className="flex items-center mb-3">
          <Info className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-sm font-semibold text-neutral-800">About SafeChat</h3>
        </div>
        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
          SafeChat uses advanced technology to moderate content in real-time. 
          Messages are analyzed for toxicity before being sent, helping create a healthier conversation environment.
        </p>
        
        <div className="bg-neutral-50 p-3 rounded-lg">
          <h4 className="text-xs font-semibold mb-2 text-neutral-700">TOXICITY SCORING SYSTEM</h4>
          <div className="h-3 w-full rounded-full overflow-hidden bg-neutral-200 mb-3">
            <div className="h-full w-full" style={getToxicityGradientStyle(100)} />
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-600 mr-2 flex-shrink-0" />
              <div>
                <span className="font-medium">0-30%:</span> Healthy Communication
                <span className="block text-neutral-500">Score -5 points per clean message</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-2 flex-shrink-0" />
              <div>
                <span className="font-medium">30-70%:</span> Moderate Toxicity
                <span className="block text-neutral-500">Warning zone</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-600 mr-2 flex-shrink-0" />
              <div>
                <span className="font-medium">70-100%:</span> High Toxicity
                <span className="block text-neutral-500">Score +10 points per toxic message</span>
              </div>
            </div>
          </div>
        </div>
        
        <Link 
          href="/features" 
          className="mt-4 text-primary text-sm flex items-center hover:underline"
        >
          <Info className="h-4 w-4 mr-1" />
          <span>Learn more about features</span>
        </Link>
      </div>
    </aside>
  );
};

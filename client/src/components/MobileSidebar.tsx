import React from 'react';
import { useChat } from '../hooks/useChat';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { getToxicityColor, getToxicityBgColor } from '../lib/utils';

export const MobileSidebar = () => {
  const { users, showMobileSidebar, setShowMobileSidebar } = useChat();
  
  if (!showMobileSidebar) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-40 md:hidden">
      <div className="w-3/4 max-w-xs h-full bg-white shadow-xl flex flex-col">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-lg font-medium">Room Users</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowMobileSidebar(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <div className="space-y-3">
            {users.map((user) => {
              const toxicityColor = getToxicityColor(user.toxicityScore);
              const toxicityBgColor = getToxicityBgColor(user.toxicityScore);
              
              return (
                <div key={user.username} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full ${toxicityBgColor} mr-2`} />
                    <span className={`text-sm font-medium ${toxicityColor}`}>
                      {user.username}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-2 bg-neutral-200 rounded-full overflow-hidden mr-1">
                      <div 
                        className={`h-full ${toxicityBgColor}`}
                        style={{ width: `${user.toxicityScore}%` }} 
                      />
                    </div>
                    <span className="text-xs">{user.toxicityScore}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 border-t border-neutral-200">
          <div className="text-xs text-neutral-600">
            <p className="font-medium mb-2">Toxicity Legend:</p>
            <p className="flex items-center mb-1">
              <span className="w-2 h-2 rounded-full bg-green-600 mr-2" />
              <span>0-30%: Healthy</span>
            </p>
            <p className="flex items-center mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
              <span>30-70%: Moderate</span>
            </p>
            <p className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-600 mr-2" />
              <span>70-100%: High</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

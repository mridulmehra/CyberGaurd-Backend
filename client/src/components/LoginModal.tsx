import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from './ui/card';
import { CheckCircle, PlusCircle, Users, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Link } from 'wouter';

export const LoginModal = () => {
  const { joinRoom, showLoginModal } = useChat();
  const [username, setUsername] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('general');
  const [customRoom, setCustomRoom] = useState('');
  const [activeTab, setActiveTab] = useState('existing');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username.trim()) {
      // Use either the selected predefined room or the custom room name
      const roomToJoin = activeTab === 'existing' ? selectedRoom : customRoom.trim();
      
      if (roomToJoin) {
        joinRoom(username.trim(), roomToJoin);
      }
    }
  };
  
  if (!showLoginModal) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="material-icons text-primary text-4xl mr-3">chat</span>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-teal-500 text-transparent bg-clip-text">
              SafeChat
            </CardTitle>
          </div>
          <CardTitle className="text-2xl">Join a Room</CardTitle>
          <CardDescription className="text-base mt-1">
            Start chatting with advanced message moderation
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-medium">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="h-11 text-base"
                required
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="existing" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Existing Rooms</span>
                </TabsTrigger>
                <TabsTrigger value="create" className="flex items-center">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Create Room</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="existing" className="space-y-2">
                <Label htmlFor="room" className="text-base font-medium">Select Room</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger id="room" className="h-11 text-base">
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">💬 General Chat</SelectItem>
                    <SelectItem value="tech">💻 Tech Discussion</SelectItem>
                    <SelectItem value="random">🎲 Random</SelectItem>
                    <SelectItem value="support">🆘 Support</SelectItem>
                    <SelectItem value="music">🎵 Music</SelectItem>
                    <SelectItem value="gaming">🎮 Gaming</SelectItem>
                  </SelectContent>
                </Select>
              </TabsContent>
              
              <TabsContent value="create" className="space-y-2">
                <Label htmlFor="custom-room" className="text-base font-medium">Create New Room</Label>
                <Input
                  id="custom-room"
                  value={customRoom}
                  onChange={(e) => setCustomRoom(e.target.value)}
                  placeholder="Enter room name"
                  className="h-11 text-base"
                  required={activeTab === 'create'}
                />
                <p className="text-sm text-muted-foreground">
                  Create a custom room for your team or friends
                </p>
              </TabsContent>
            </Tabs>
            
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium"
              disabled={activeTab === 'create' && !customRoom.trim()}
            >
              Join Chat
            </Button>
            <Link 
              href="/features" 
              className="text-sm text-center text-primary hover:underline mt-2 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Learn about SafeChat features
            </Link>
          </CardFooter>
        </form>
        <div className="bg-muted p-5 rounded-b-lg">
          <h3 className="text-base font-medium mb-3">About SafeChat</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Advanced content moderation for respectful communication</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Real-time toxicity scoring with visual indicators</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Automatic message detoxification for positive conversations</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

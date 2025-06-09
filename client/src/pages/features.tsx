import React from 'react';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  ShieldCheck, 
  MessageCircle, 
  Users, 
  Zap, 
  BarChart, 
  Filter, 
  CheckCircle2, 
  ChevronLeft
} from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center text-primary hover:underline mb-6">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Chat
          </Link>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-teal-500 text-transparent bg-clip-text mb-3">
            SafeChat Features
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            An intelligent messaging platform designed to promote healthy communication
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <FeatureCard 
            icon={<ShieldCheck className="h-8 w-8 text-primary" />}
            title="Smart Content Moderation"
            description="Advanced technology analyzes messages in real-time to detect and filter toxic content before it's shared."
          />
          
          <FeatureCard
            icon={<BarChart className="h-8 w-8 text-primary" />}
            title="Toxicity Scoring System"
            description="Users receive a dynamic toxicity score (0-100%) that changes based on message content over time."
          />
          
          <FeatureCard
            icon={<Filter className="h-8 w-8 text-primary" />}
            title="Content Filtering"
            description="Toxic messages are blocked and users are offered detoxified alternatives that maintain the original meaning."
          />
          
          <FeatureCard
            icon={<Users className="h-8 w-8 text-primary" />}
            title="Custom Chat Rooms"
            description="Create and join public or private rooms for different topics and conversations."
          />
          
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-primary" />}
            title="Real-time Messaging"
            description="Instant message delivery with optimistic updates for a seamless chat experience."
          />
          
          <FeatureCard
            icon={<MessageCircle className="h-8 w-8 text-primary" />}
            title="Mobile Responsive"
            description="Chat from any device with a responsive design that works on desktop, tablet, and mobile."
          />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-neutral-800 mb-6">How the Toxicity Scoring Works</h2>
          
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 p-5 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center mb-3">
                  <div className="w-4 h-4 rounded-full bg-green-600 mr-2"></div>
                  <h3 className="font-semibold text-lg">Healthy (0-30%)</h3>
                </div>
                <p className="text-neutral-600 mb-3">
                  Users with low toxicity scores are engaging in healthy, respectful communication.
                </p>
                <div className="bg-neutral-100 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Score Impact:</p>
                  <p className="text-sm text-green-600">-5 points for each non-toxic message</p>
                </div>
              </div>
              
              <div className="flex-1 p-5 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center mb-3">
                  <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
                  <h3 className="font-semibold text-lg">Moderate (30-70%)</h3>
                </div>
                <p className="text-neutral-600 mb-3">
                  Users in this range show some concerning communication patterns but aren't consistently problematic.
                </p>
                <div className="bg-neutral-100 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Warning Zone:</p>
                  <p className="text-sm text-amber-500">User should be mindful of their communication</p>
                </div>
              </div>
              
              <div className="flex-1 p-5 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center mb-3">
                  <div className="w-4 h-4 rounded-full bg-red-600 mr-2"></div>
                  <h3 className="font-semibold text-lg">Toxic (70-100%)</h3>
                </div>
                <p className="text-neutral-600 mb-3">
                  Users with high toxicity scores have a pattern of sending harmful or disrespectful messages.
                </p>
                <div className="bg-neutral-100 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Score Impact:</p>
                  <p className="text-sm text-red-600">+10 points for each toxic message</p>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-100 p-5 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Visual Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Username Color</p>
                    <p className="text-sm text-neutral-600">Changes based on toxicity level from green to red</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Toxicity Bar</p>
                    <p className="text-sm text-neutral-600">Visual gradient that fills based on score percentage</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">User List Indicators</p>
                    <p className="text-sm text-neutral-600">Shows current toxicity level of each user in the room</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Hover Details</p>
                    <p className="text-sm text-neutral-600">View detailed toxicity information by hovering over usernames</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 to-teal-500/10 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-neutral-800 mb-3">Ready to Try SafeChat?</h2>
          <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
            Experience the power of smart-moderated conversations with our toxicity detection system.
            Join a room or create your own to start chatting in a healthier environment.
          </p>
          <Link href="/">
            <Button size="lg" className="font-medium">
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Chatting Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-600">{description}</p>
      </CardContent>
    </Card>
  );
};
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Flag, AlertTriangle } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { Message } from '../types';
import { formatTime } from '../lib/utils';

interface ReportDialogProps {
  message: Message | null;
  onClose: () => void;
}

export const ReportDialog: React.FC<ReportDialogProps> = ({ message, onClose }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { reportMessage } = useChat();

  if (!message) return null;

  const handleSubmit = () => {
    if (!message.id) return;
    
    setIsSubmitting(true);
    
    // Call the reportMessage function from the ChatContext
    reportMessage(message.id, reason);
    
    // Close the dialog and reset state
    setTimeout(() => {
      setIsSubmitting(false);
      setReason('');
      onClose();
    }, 300);
  };

  return (
    <Dialog open={!!message} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Flag className="h-5 w-5" />
            Report Inappropriate Message
          </DialogTitle>
          <DialogDescription>
            Help keep the community safe by reporting messages that violate our content policy.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-3 space-y-4">
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <div className="text-xs text-neutral-500 mb-1 flex justify-between">
              <span>From: <span className="font-medium">{message.username}</span></span>
              <span>{formatTime(message.timestamp)}</span>
            </div>
            <p className="text-neutral-800">{message.text}</p>
            {message.isModified && (
              <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>This message was already modified for civility</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for report (optional)</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe why you're reporting this message..."
              className="resize-none h-24"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
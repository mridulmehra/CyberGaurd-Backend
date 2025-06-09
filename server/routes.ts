import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { checkMessageToxicity } from "./content-moderation";
import { 
  ClientToServerEvents, 
  ServerToClientEvents, 
  UserState,
  MessageData 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Create WebSocket server on a specific path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', async (socket) => {
    let currentUser: UserState | null = null;

    socket.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const { type, payload } = message;

        switch (type) {
          case 'join': {
            // User joins a room
            const { username, room } = payload;
            
            // Check if username is already taken in the room
            const existingUser = await storage.getUser(username);
            if (existingUser) {
              sendToClient(socket, 'error', { message: 'Username is already taken' });
              return;
            }
            
            // Create new user with initial toxicity score of 0
            const user = await storage.createUser({
              username,
              room,
              toxicityScore: 0
            });
            
            currentUser = {
              id: user.id,
              username: user.username,
              room: user.room,
              toxicityScore: user.toxicityScore
            };
            
            // Get all users in the room
            const usersInRoom = await storage.getUsersInRoom(room);
            const usersList = usersInRoom.map(u => ({
              id: u.id,
              username: u.username,
              room: u.room,
              toxicityScore: u.toxicityScore
            }));
            
            // Send users list to the new user
            sendToClient(socket, 'usersList', usersList);
            
            // Store the room information on the socket
            (socket as any)._roomInfo = { room };
            
            // Broadcast to all clients in the same room that a new user has joined
            broadcastToRoom(wss, room, 'userJoined', currentUser, socket);
            
            // Get recent messages in the room and send them to the new user
            const recentMessages = await storage.getMessagesInRoom(room);
            recentMessages.forEach(msg => {
              sendToClient(socket, 'message', {
                id: msg.id,
                text: msg.text,
                username: msg.username,
                room: msg.room,
                isModified: msg.isModified,
                timestamp: msg.timestamp
              });
            });
            
            break;
          }
          
          case 'leave': {
            if (!currentUser) return;

            // Remove user from storage
            await storage.removeUser(currentUser.username);
            
            // Broadcast to other clients that user has left
            broadcastToRoom(wss, currentUser.room, 'userLeft', currentUser.username, socket);
            
            currentUser = null;
            break;
          }
          
          case 'message': {
            if (!currentUser) return;
            
            const messageText = payload;
            if (!messageText || typeof messageText !== 'string') return;
            
            try {
              // Check message for toxicity using content moderation
              console.log(`Checking message for toxicity: "${messageText}"`);
              const toxicityResult = await checkMessageToxicity(messageText);
              console.log('Toxicity check result:', toxicityResult);
              
              // Update user's toxicity score
              let updatedScore = currentUser.toxicityScore;
              if (toxicityResult.isToxic) {
                // Increase score by 10 for toxic messages
                updatedScore = Math.min(100, updatedScore + 10);
                
                // If message is toxic, send a notification to the sender
                if (toxicityResult.detoxifiedText) {
                  sendToClient(socket, 'error', { 
                    message: `Your message was detected as potentially harmful and has been modified for civility. The modified version has been sent instead.`
                  });
                }
              } else {
                // Decrease score by 5 for clean messages
                updatedScore = Math.max(0, updatedScore - 5);
              }
              
              // Update user's toxicity score in storage
              const updatedUser = await storage.updateUserToxicityScore(
                currentUser.username, 
                updatedScore
              );
              
              if (updatedUser) {
                currentUser.toxicityScore = updatedUser.toxicityScore;
                
                // Broadcast updated toxicity score to all users in the room
                broadcastToRoom(
                  wss, 
                  currentUser.room, 
                  'updateToxicityScore', 
                  { username: currentUser.username, score: updatedUser.toxicityScore }
                );
              }
              
              // Determine which message to send
              const finalMessageText = toxicityResult.isToxic 
                ? toxicityResult.detoxifiedText || "I'd like to express my thoughts more respectfully." 
                : messageText;
              
              // Create and store the message
              const timestamp = new Date().toISOString();
              const newMessage = await storage.createMessage({
                text: finalMessageText,
                username: currentUser.username,
                room: currentUser.room,
                isModified: toxicityResult.isToxic,
                timestamp
              });
              
              // If the message was modified due to toxicity, save the original to toxic_messages table
              if (toxicityResult.isToxic) {
                try {
                  // Calculate an estimated toxicity score based on current user's score
                  const estimatedToxicityScore = Math.min(100, currentUser.toxicityScore + 25);
                  
                  await storage.saveToxicMessage({
                    originalText: messageText,
                    modifiedText: finalMessageText,
                    toxicityScore: estimatedToxicityScore,
                    messageId: newMessage.id,
                    username: currentUser.username,
                    room: currentUser.room
                  });
                  
                  console.log(`Saved toxic message from ${currentUser.username} to toxic_messages table`);
                } catch (error) {
                  console.error('Error saving toxic message:', error);
                }
              }
              
              // Broadcast the message to all clients in the room
              const messageData: MessageData = {
                id: newMessage.id,
                text: finalMessageText,
                username: newMessage.username,
                room: newMessage.room,
                isModified: newMessage.isModified,
                timestamp: newMessage.timestamp
              };
              
              broadcastToRoom(wss, currentUser.room, 'message', messageData);
            } catch (error) {
              console.error('Error processing message:', error);
              
              // Send an error back to the client
              sendToClient(socket, 'error', { 
                message: 'There was an error processing your message. Please try again.'
              });
              
              // Send the original message anyway to avoid losing content
              const timestamp = new Date().toISOString();
              const newMessage = await storage.createMessage({
                text: messageText,
                username: currentUser.username,
                room: currentUser.room,
                isModified: false,
                timestamp
              });
              
              // If there was an error processing a message but we wanted to flag it as toxic,
              // save it to the toxic_messages table anyway
              try {
                // Check if the message contains known toxic patterns
                const containsBadWords = /\b(fuck|shit|asshole|bitch|damn|crap|stupid|idiot)\b/i.test(messageText);
                
                if (containsBadWords) {
                  const estimatedToxicityScore = Math.min(100, currentUser.toxicityScore + 15);
                  
                  await storage.saveToxicMessage({
                    originalText: messageText,
                    modifiedText: messageText, // We don't have a modified version in this error case
                    toxicityScore: estimatedToxicityScore,
                    messageId: newMessage.id,
                    username: currentUser.username,
                    room: currentUser.room
                  });
                  
                  console.log(`Saved potentially toxic message to toxic_messages table despite processing error`);
                }
              } catch (saveError) {
                console.error('Error saving potentially toxic message:', saveError);
              }
              
              // Broadcast the message to all clients in the room
              const messageData: MessageData = {
                id: newMessage.id,
                text: messageText,
                username: newMessage.username,
                room: newMessage.room,
                isModified: false,
                timestamp: newMessage.timestamp
              };
              
              broadcastToRoom(wss, currentUser.room, 'message', messageData);
            }
            break;
          }
          
          case 'clearChat': {
            if (!currentUser) return;
            
            const room = currentUser.room;
            
            try {
              // Add a system message indicating chat view was cleared
              const timestamp = new Date().toISOString();
              const systemMessage = await storage.createMessage({
                text: `Chat view has been cleared by ${currentUser.username}`,
                username: "system",
                room: room,
                isModified: false,
                timestamp
              });
              
              // Broadcast to all clients in the room that chat was cleared
              // This tells the frontend to clear its message list, but doesn't delete from DB
              broadcastToRoom(wss, room, 'chatCleared', room);
              
              // Send the system message
              const messageData: MessageData = {
                id: systemMessage.id,
                text: systemMessage.text,
                username: systemMessage.username,
                room: systemMessage.room,
                isModified: systemMessage.isModified,
                timestamp: systemMessage.timestamp
              };
              
              broadcastToRoom(wss, room, 'message', messageData);
            } catch (error) {
              console.error('Error clearing chat view:', error);
              sendToClient(socket, 'error', { 
                message: 'There was an error clearing the chat view. Please try again.'
              });
            }
            break;
          }

          case 'reportMessage': {
            if (!currentUser) return;
            
            const { messageId, reason } = payload;
            if (!messageId || typeof messageId !== 'number') {
              return sendToClient(socket, 'error', { message: 'Invalid message ID' });
            }
            
            try {
              // Get the message from the database to verify it exists
              const messages = await storage.getMessagesInRoom(currentUser.room);
              const messageToReport = messages.find(msg => msg.id === messageId);
              
              if (!messageToReport) {
                return sendToClient(socket, 'error', { message: 'Message not found' });
              }
              
              // Don't allow users to report their own messages
              if (messageToReport.username === currentUser.username) {
                return sendToClient(socket, 'error', { message: 'You cannot report your own messages' });
              }
              
              // Create the report
              const timestamp = new Date().toISOString();
              const report = await storage.createReport({
                messageId,
                reportedBy: currentUser.username,
                reason: reason || 'Inappropriate content',
                status: 'pending'
              });
              
              console.log(`Message ${messageId} reported by ${currentUser.username}: ${reason || 'No reason provided'}`);
              
              // Send confirmation to the reporting user
              sendToClient(socket, 'error', { 
                message: 'Report submitted. Thank you for helping keep the community safe.'
              });
              
              // Save the reported message to toxic_messages table if it's not already there
              try {
                // Use the report reason to help determine a toxicity score
                // A more serious reason would have a higher estimated score
                let estimatedToxicityScore = 75; // Default score for reported messages
                
                // Adjust score based on report reason
                if (reason && reason.toLowerCase().includes('threat')) {
                  estimatedToxicityScore = 95; // Very high for threats
                } else if (reason && (reason.toLowerCase().includes('hate') || reason.toLowerCase().includes('slur'))) {
                  estimatedToxicityScore = 90; // High for hate speech
                } else if (reason && reason.toLowerCase().includes('explicit')) {
                  estimatedToxicityScore = 85; // High for explicit content
                } else if (reason && reason.toLowerCase().includes('spam')) {
                  estimatedToxicityScore = 60; // Lower for spam
                }
                
                // Add user who reported the message to record in toxic_messages table
                await storage.saveToxicMessage({
                  originalText: messageToReport.text,
                  modifiedText: messageToReport.isModified ? messageToReport.text : messageToReport.text,
                  toxicityScore: estimatedToxicityScore,
                  messageId: messageToReport.id,
                  username: messageToReport.username,
                  room: messageToReport.room
                });
                
                console.log(`Saved reported message to toxic_messages table with score ${estimatedToxicityScore}`);
              } catch (saveError) {
                console.error('Error saving reported message to toxic_messages:', saveError);
              }
              
              // Send the report data (for admin UI, not implemented here)
              const reportData = {
                id: report.id,
                messageId: report.messageId,
                reportedBy: report.reportedBy,
                reason: report.reason,
                timestamp: typeof report.timestamp === 'string' 
                  ? report.timestamp 
                  : report.timestamp.toISOString(),
                status: report.status
              };
              
              // This would be sent to admin users only in a real implementation
              // broadcastToRoom(wss, 'admin', 'reportReceived', reportData);
              
            } catch (error) {
              console.error('Error reporting message:', error);
              sendToClient(socket, 'error', { 
                message: 'There was an error submitting your report. Please try again.'
              });
            }
            break;
          }
          
          default:
            break;
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    // Handle disconnection
    socket.on('close', async () => {
      if (currentUser) {
        // Remove user from storage
        await storage.removeUser(currentUser.username);
        
        // Broadcast to other clients that user has left
        broadcastToRoom(wss, currentUser.room, 'userLeft', currentUser.username);
        
        currentUser = null;
      }
    });
  });

  // API route to check health
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return httpServer;
}

// Helper function to send messages to a client
function sendToClient(socket: WebSocket, type: keyof ServerToClientEvents, payload: any) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, payload }));
  }
}

// Helper function to broadcast messages to all clients in a room
function broadcastToRoom(
  wss: WebSocketServer, 
  room: string, 
  type: keyof ServerToClientEvents, 
  payload: any,
  excludeSocket?: WebSocket
) {
  wss.clients.forEach(client => {
    if (client !== excludeSocket && client.readyState === WebSocket.OPEN) {
      // Check if the client belongs to the room
      // Since WS doesn't have built-in rooms, we store the room info in the metadata
      const roomInfo = (client as any)._roomInfo;
      if (roomInfo && roomInfo.room === room) {
        client.send(JSON.stringify({ type, payload }));
      }
    }
  });
}

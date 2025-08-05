import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Separator 
} from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Send, 
  Settings, 
  Users, 
  Smile, 
  MoreVertical,
  Trash2,
  Clock,
  Ban,
  Volume2,
  VolumeX,
  Gift
} from 'lucide-react';
import { chatService } from '@/services/chat';
import type { ChatMessage, ChatUser, ChatRoom, ChatEmote } from '@/types/chat';
import { useToast } from '@/components/ui/use-toast';

interface LiveChatProps {
  streamId: string;
  userId: string;
  username: string;
  userRole?: 'viewer' | 'moderator' | 'streamer' | 'admin';
  className?: string;
}

const EMOJI_REACTIONS = ['❤️', '👍', '😂', '😢', '😮', '😡'];

export const LiveChat: React.FC<LiveChatProps> = ({
  streamId,
  userId,
  userRole = 'viewer',
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [emotes, setEmotes] = useState<ChatEmote[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showEmotePicker, setShowEmotePicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSuperChat, setShowSuperChat] = useState(false);
  const [superChatAmount, setSuperChatAmount] = useState(5);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageSoundRef = useRef<HTMLAudioElement>(null);
  
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Connect to chat room
  const loadChatHistory = useCallback(async () => {
    try {
      const { messages: history } = await chatService.getChatHistory(streamId, 1, 100);
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, [streamId]);

  const loadEmotes = useCallback(async () => {
    try {
      const emotesList = await chatService.getChatEmotes(streamId);
      setEmotes(emotesList);
    } catch (error) {
      console.error('Failed to load emotes:', error);
    }
  }, [streamId]);

  useEffect(() => {
    chatService.connectToChatRoom(
      streamId,
      userId,
      handleNewMessage,
      handleUserUpdate,
      handleRoomUpdate,
      handleError
    );

    // Load initial data
    loadChatHistory();
    loadEmotes();

    return () => {
      chatService.disconnectFromChat();
    };
  }, [streamId, userId, handleError, handleNewMessage, handleRoomUpdate, handleUserUpdate, loadChatHistory, loadEmotes]);

  const handleNewMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
    
    // Play sound for new messages (if enabled and not from current user)
    if (soundEnabled && message.userId !== userId) {
      playMessageSound();
    }

    // Show special notification for donations/super chats
    if (message.type === 'donation' || message.type === 'super_chat') {
      toast({
        title: message.type === 'donation' ? '💝 New Donation!' : '⭐ Super Chat!',
        description: `${message.username}: ${message.message}`,
      });
    }
  }, [soundEnabled, userId, toast]);

  const handleUserUpdate = useCallback((updatedUsers: ChatUser[]) => {
    setUsers(updatedUsers);
  }, []);

  const handleRoomUpdate = useCallback((updatedRoom: ChatRoom) => {
    setRoom(updatedRoom);
    setIsConnected(true);
  }, []);

  const handleError = useCallback((error: string) => {
    console.error('Chat error:', error);
    setIsConnected(false);
    toast({
      title: 'Chat Error',
      description: error,
      variant: 'destructive',
    });
  }, [toast]);


  const playMessageSound = () => {
    if (lastMessageSoundRef.current) {
      lastMessageSoundRef.current.currentTime = 0;
      lastMessageSoundRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    chatService.sendMessage(streamId, newMessage, replyingTo?.id);
    setNewMessage('');
    setReplyingTo(null);
    inputRef.current?.focus();
  };

  const handleSendSuperChat = () => {
    if (!newMessage.trim() || !isConnected) return;

    chatService.sendSuperChat(streamId, newMessage, superChatAmount);
    setNewMessage('');
    setShowSuperChat(false);
    toast({
      title: 'Super Chat Sent!',
      description: `$${superChatAmount} Super Chat sent`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showSuperChat) {
        handleSendSuperChat();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    chatService.reactToMessage(messageId, emoji);
  };

  const handleModerateMessage = (messageId: string, action: 'delete' | 'timeout' | 'ban') => {
    switch (action) {
      case 'delete':
        chatService.deleteMessage(messageId, 'Inappropriate content');
        break;
      case 'timeout': {
        const message = messages.find(m => m.id === messageId);
        if (message) {
          chatService.timeoutUser(message.userId, 10, 'Inappropriate behavior');
        }
        break;
      }
      case 'ban': {
        const msgToBan = messages.find(m => m.id === messageId);
        if (msgToBan) {
          chatService.banUser(msgToBan.userId, 'Severe rule violation');
        }
        break;
      }
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserBadgeColor = (role: string) => {
    switch (role) {
      case 'streamer': return 'bg-purple-500';
      case 'moderator': return 'bg-green-500';
      case 'admin': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'donation': return 'border-l-yellow-400 bg-yellow-50';
      case 'super_chat': return 'border-l-purple-400 bg-purple-50';
      case 'moderator': return 'border-l-green-400 bg-green-50';
      case 'system': return 'border-l-blue-400 bg-blue-50';
      default: return 'border-l-transparent';
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Live Chat
            {isConnected ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {users.length} online
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Connecting...
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserList(!showUserList)}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {room && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{room.totalMessages} messages</span>
            {room.slowMode && <span>Slow mode: {room.slowMode}s</span>}
            {room.followersOnly && <Badge variant="outline">Followers only</Badge>}
            {room.subscribersOnly && <Badge variant="outline">Subscribers only</Badge>}
          </div>
        )}
      </CardHeader>

      <Separator />

      <div className="flex flex-1 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`border-l-4 pl-3 py-2 rounded-r ${getMessageTypeColor(message.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          className={`text-xs px-2 py-0 ${getUserBadgeColor(users.find(u => u.userId === message.userId)?.role || 'viewer')}`}
                        >
                          {message.username}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.type === 'donation' && (
                          <Badge className="bg-yellow-500 text-white text-xs">
                            💝 ${message.donationAmount}
                          </Badge>
                        )}
                        {message.type === 'super_chat' && (
                          <Badge className="bg-purple-500 text-white text-xs">
                            ⭐ ${message.superChatAmount}
                          </Badge>
                        )}
                      </div>
                      
                      {message.repliedToId && (
                        <div className="text-xs text-gray-500 italic mb-1">
                          Replying to {messages.find(m => m.id === message.repliedToId)?.username}
                        </div>
                      )}
                      
                      <p className="text-sm leading-relaxed break-words">
                        {message.message}
                      </p>
                      
                      {message.reactions && Object.keys(message.reactions).length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {Object.entries(message.reactions).map(([emoji, count]) => (
                            <Button
                              key={emoji}
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleReaction(message.id, emoji)}
                            >
                              {emoji} {count}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setReplyingTo(message)}>
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReaction(message.id, '❤️')}>
                          React
                        </DropdownMenuItem>
                        {(userRole === 'moderator' || userRole === 'streamer' || userRole === 'admin') && (
                          <>
                            <Separator />
                            <DropdownMenuItem 
                              onClick={() => handleModerateMessage(message.id, 'delete')}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleModerateMessage(message.id, 'timeout')}
                              className="text-orange-600"
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Timeout User
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleModerateMessage(message.id, 'ban')}
                              className="text-red-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Ban User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Message Input */}
          <div className="p-3 border-t">
            {replyingTo && (
              <div className="flex items-center justify-between mb-2 p-2 bg-gray-100 rounded">
                <span className="text-sm text-gray-600">
                  Replying to {replyingTo.username}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setReplyingTo(null)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmotePicker(!showEmotePicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>
              
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  showSuperChat 
                    ? `Super Chat ($${superChatAmount})...` 
                    : room?.chatEnabled ? 'Type a message...' : 'Chat is disabled'
                }
                disabled={!isConnected || !room?.chatEnabled}
                className="flex-1"
                maxLength={500}
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuperChat(!showSuperChat)}
                className={showSuperChat ? 'bg-purple-100' : ''}
              >
                <Gift className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={showSuperChat ? handleSendSuperChat : handleSendMessage}
                disabled={!newMessage.trim() || !isConnected}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {showSuperChat && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-600">Amount:</span>
                {[5, 10, 25, 50, 100].map(amount => (
                  <Button
                    key={amount}
                    variant={superChatAmount === amount ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSuperChatAmount(amount)}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            )}
            
            {showEmotePicker && (
              <div className="absolute bottom-16 left-4 right-4 bg-white border rounded-lg shadow-lg p-4 z-10">
                <div className="grid grid-cols-8 gap-2">
                  {EMOJI_REACTIONS.map(emoji => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNewMessage(prev => prev + emoji);
                        setShowEmotePicker(false);
                      }}
                    >
                      {emoji}
                    </Button>
                  ))}
                  {emotes.slice(0, 16).map(emote => (
                    <Button
                      key={emote.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNewMessage(prev => prev + `:${emote.name}:`);
                        setShowEmotePicker(false);
                      }}
                    >
                      <img src={emote.url} alt={emote.name} className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User List Sidebar */}
        {showUserList && (
          <>
            <Separator orientation="vertical" />
            <div className="w-64 p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users ({users.length})
              </h3>
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {users
                    .sort((a, b) => {
                      const roleOrder = { streamer: 0, admin: 1, moderator: 2, viewer: 3 };
                      return roleOrder[a.role] - roleOrder[b.role];
                    })
                    .map(user => (
                      <div key={user.userId} className="flex items-center gap-2 p-2 rounded hover:bg-gray-100">
                        <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{user.username}</span>
                            {user.role !== 'viewer' && (
                              <Badge className={`text-xs ${getUserBadgeColor(user.role)}`}>
                                {user.role}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.messageCount} messages
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </div>

      {/* Sound effect for new messages */}
      <audio
        ref={lastMessageSoundRef}
        preload="auto"
        src="/sounds/message-notification.mp3"
      />
    </div>
  );
};

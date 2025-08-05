import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
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
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
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
  Gift,
  ChevronDown,
  ArrowDown,
  Shield,
  Star,
  Crown,
  Zap
} from 'lucide-react';
import { chatService } from '@/services/chat';
import type { ChatMessage, ChatUser, ChatRoom, ChatEmote, ChatSettings } from '@/types/chat';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface LiveChatProps {
  streamId: string;
  userId: string;
  username: string;
  userRole?: 'viewer' | 'moderator' | 'streamer' | 'admin';
  className?: string;
}

const EMOJI_REACTIONS = ['❤️', '👍', '😂', '😢', '😮', '😡'];

const UserRoleIcon = ({ role }: { role: ChatUser['role'] }) => {
  switch (role) {
    case 'streamer':
      return <Crown className="h-3 w-3 text-purple-500" />;
    case 'moderator':
      return <Shield className="h-3 w-3 text-green-500" />;
    case 'admin':
      return <Zap className="h-3 w-3 text-red-500" />;
    default:
      return null;
  }
};

export const LiveChat: React.FC<LiveChatProps> = ({
  streamId,
  userId,
  username,
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
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [settings, setSettings] = useState<ChatSettings | null>(null);
  const [showSuperChat, setShowSuperChat] = useState(false);
  const [superChatAmount, setSuperChatAmount] = useState(5);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const notificationSoundRef = useRef<HTMLAudioElement>(null);
  
  const { toast } = useToast();

  // Auto-scroll to bottom functionality
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = scrollAreaRef.current?.children[1];
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollToBottom(!isAtBottom);
      }
    };
    
    const scrollContainer = scrollAreaRef.current?.children[1];
    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, []);

  // WebSocket connection and data loading
  useEffect(() => {
    const handleNewMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev.slice(-100), message]);
      
      if (settings?.notifications.sound && message.userId !== userId) {
        notificationSoundRef.current?.play().catch(() => {});
      }

      if (message.type === 'donation' || message.type === 'super_chat') {
        toast({
          title: message.type === 'donation' ? '💝 New Donation!' : '⭐ Super Chat!',
          description: `${message.username}: ${message.message}`,
        });
      }
    };

    const handleUserUpdate = (updatedUsers: ChatUser[]) => setUsers(updatedUsers);
    const handleRoomUpdate = (updatedRoom: ChatRoom) => setRoom(updatedRoom);
    const handleError = (error: string) => {
      console.error('Chat error:', error);
      setIsConnected(false);
      toast({
        title: 'Chat Connection Error',
        description: error,
        variant: 'destructive',
      });
    };

    chatService.connectToChatRoom(
      streamId,
      userId,
      handleNewMessage,
      handleUserUpdate,
      handleRoomUpdate,
      handleError
    );

    async function loadInitialData() {
      try {
        const [history, emotesData, settingsData] = await Promise.all([
          chatService.getChatHistory(streamId, 1, 100),
          chatService.getChatEmotes(streamId),
          chatService.getChatSettings()
        ]);
        setMessages(history.messages);
        setEmotes(emotesData);
        setSettings(settingsData);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to load initial chat data:', error);
      }
    }

    loadInitialData();

    return () => {
      chatService.disconnectFromChat();
    };
  }, [streamId, userId, toast, settings?.notifications.sound]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !isConnected) return;

    chatService.sendMessage(streamId, newMessage, replyingTo?.id);
    setNewMessage('');
    setReplyingTo(null);
    inputRef.current?.focus();
  }, [newMessage, isConnected, streamId, replyingTo]);

  const handleSendSuperChat = useCallback(() => {
    if (!newMessage.trim() || !isConnected) return;

    chatService.sendSuperChat(streamId, newMessage, superChatAmount);
    setNewMessage('');
    setShowSuperChat(false);
    toast({
      title: 'Super Chat Sent!',
      description: `$${superChatAmount} Super Chat sent`,
    });
  }, [newMessage, isConnected, streamId, superChatAmount, toast]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showSuperChat) {
        handleSendSuperChat();
      } else {
        handleSendMessage();
      }
    }
  }, [showSuperChat, handleSendSuperChat, handleSendMessage]);

  const handleReaction = useCallback((messageId: string, emoji: string) => {
    chatService.reactToMessage(messageId, emoji);
  }, []);

  const handleModerateMessage = useCallback((messageId: string, action: 'delete' | 'timeout' | 'ban') => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    switch (action) {
      case 'delete':
        chatService.deleteMessage(messageId, 'Inappropriate content');
        break;
      case 'timeout':
        chatService.timeoutUser(message.userId, 10, 'Inappropriate behavior');
        break;
      case 'ban':
        chatService.banUser(message.userId, 'Severe rule violation');
        break;
    }
  }, [messages]);

  const handleSettingsUpdate = useCallback(async (newSettings: Partial<ChatSettings>) => {
    try {
      const updatedSettings = await chatService.updateChatSettings(newSettings);
      setSettings(updatedSettings);
      toast({ title: 'Settings updated' });
    } catch (error) {
      toast({ title: 'Failed to update settings', variant: 'destructive' });
    }
  }, [toast]);

  const formatTimestamp = (timestamp: Date) => {
    if (!settings?.appearance.showTimestamps) return '';
    return timestamp.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const parsedMessages = useMemo(() => {
    const emoteRegex = new RegExp(`:(${emotes.map(e => e.name).join('|')}):`, 'g');
    return messages.map(msg => {
      const parsedContent = msg.message.replace(emoteRegex, (match, emoteName) => {
        const emote = emotes.find(e => e.name === emoteName);
        return emote ? `<img src="${emote.url}" alt="${emote.name}" class="inline-block h-5 w-5 mx-0.5" />` : match;
      });
      return { ...msg, parsedContent };
    });
  }, [messages, emotes]);

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
    <Card className={cn("flex flex-col h-full", className)}>
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowUserList(!showUserList)}>
                <Users className="h-4 w-4 mr-2" />
                {showUserList ? 'Hide' : 'Show'} User List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSettingsUpdate({ notifications: { ...settings?.notifications, sound: !settings?.notifications.sound } })}>
                {settings?.notifications.sound ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                Sound
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef as any}>
              <div className="space-y-4">
                {parsedMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex items-start gap-3",
                      settings?.appearance.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    )}
                  >
                    {settings?.appearance.showAvatars && (
                      <img 
                        src={message.userAvatar || 'https://via.placeholder.com/40'} 
                        alt={message.username}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{message.username}</span>
                        <UserRoleIcon role={users.find(u => u.userId === message.userId)?.role || 'viewer'} />
                        {formatTimestamp(message.timestamp) && (
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        )}
                      </div>
                      <div 
                        className="text-sm prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: message.parsedContent || '' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
          </div>

          {/* User List Sidebar */}
          <AnimatePresence>
            {showUserList && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 256, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-l overflow-hidden"
              >
                <div className="w-64 p-4 h-full flex flex-col">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Users ({users.length})
                  </h3>
                  <ScrollArea className="flex-1">
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
                                <UserRoleIcon role={user.role} />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        {/* Message Input */}
        <div className="w-full">
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
          
          <div className="relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                showSuperChat 
                  ? `Super Chat ($${superChatAmount})...` 
                  : room?.chatEnabled ? 'Send a message...' : 'Chat is disabled'
              }
              disabled={!isConnected || !room?.chatEnabled}
              className="pr-24"
              maxLength={500}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmotePicker(!showEmotePicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>
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
      </CardFooter>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 right-4 z-10"
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={scrollToBottom}
              className="shadow-lg"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound effect for new messages */}
      <audio
        ref={notificationSoundRef}
        preload="auto"
        src="/sounds/message-notification.mp3"
      />
    </Card>
  );
};

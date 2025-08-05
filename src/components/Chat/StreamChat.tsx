import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Ban, Clock, MoreVertical, Send, Trash2, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  role?: 'viewer' | 'moderator' | 'owner';
}

interface StreamChatProps {
  streamId: string;
  isLive?: boolean;
  height?: string;
}

export default function StreamChat({ streamId: _streamId, isLive = true, height = '500px' }: StreamChatProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      username: 'System',
      message: 'Welcome to the stream chat!',
      timestamp: new Date().toISOString(),
      role: 'moderator'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate WebSocket connection
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id || 'anonymous',
      username: user.name || 'Anonymous',
      message: newMessage,
      timestamp: new Date().toISOString(),
      role: 'viewer'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'owner':
        return <Badge variant="destructive" className="ml-2">Owner</Badge>;
      case 'moderator':
        return <Badge variant="secondary" className="ml-2">Mod</Badge>;
      default:
        return null;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'owner':
        return 'text-red-500';
      case 'moderator':
        return 'text-blue-500';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card className="flex flex-col" style={{ height }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Stream Chat</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" />
              {messages.length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={chatContainerRef}>
          <div className="space-y-2 py-2">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex items-start gap-3 group",
                  msg.userId === user?.id && "flex-row-reverse"
                )}
              >
                <Avatar className="w-8 h-8">
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center text-xs font-medium text-white">
                    {msg.username[0].toUpperCase()}
                  </div>
                </Avatar>
                
                <div className={cn(
                  "flex-1 space-y-1",
                  msg.userId === user?.id && "text-right"
                )}>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", getRoleColor(msg.role))}>
                      {msg.username}
                    </span>
                    {getRoleBadge(msg.role)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className={cn(
                    "inline-block px-3 py-2 rounded-lg text-sm",
                    msg.userId === user?.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}>
                    {msg.message}
                  </div>
                </div>
                
                {(user?.role === 'moderator' || user?.role === 'owner') && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => deleteMessage(msg.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Message
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Clock className="mr-2 h-4 w-4" />
                        Timeout User
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Ban className="mr-2 h-4 w-4" />
                        Ban User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isLive ? "Type a message..." : "Chat is disabled"}
              disabled={!isLive || !isConnected}
              className="flex-1"
            />
            <Button 
              type="submit"
              size="icon"
              disabled={!isLive || !isConnected || !newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
import { List } from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Paper,
  Divider,
  Chip,
  Menu,
  MenuItem /*, Badge */ /*, Tooltip */,
  CircularProgress,
  Alert} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Timer as TimerIcon /*, Clear as ClearIcon */,
  Person as PersonIcon} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  timestamp: string;
  deleted?: boolean;
  reply_to?: string;
}

interface ChatUser {
  id: string;
  username: string;
  role: 'viewer' | 'moderator' | 'streamer';
  avatar?: string;
}

interface StreamChatProps {
  streamId: string;
  currentUser: ChatUser;
  wsUrl?: string;
}

const StreamChat: React.FC<StreamChatProps> = ({
  streamId,
  currentUser,
  wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/chat/ws`}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const token = localStorage.getItem('token') || 'demo-token';
      const wsUrlWithParams = `${wsUrl}/${streamId}?token=${token}&username=${currentUser.username}`;
      
      ws.current = new WebSocket(wsUrlWithParams);

      ws.current.onopen = () => {
        setConnected(true);
        setLoading(false);
        setError(null);
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connected':
            console.log('Connected to chat:', data);
            break;
            
          case 'message':
            setMessages((prev) => [...prev, data.data]);
            break;
            
          case 'message_deleted':
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.message_id ? { ...msg, deleted: true } : msg
              )
            );
            break;
            
          case 'user_joined':
            setActiveUsers((prev) => prev + 1);
            break;
            
          case 'user_left':
            setActiveUsers((prev) => Math.max(0, prev - 1));
            break;
            
          case 'chat_cleared':
            setMessages([]);
            break;
            
          default:
            break;
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Retrying...');
      };

      ws.current.onclose = () => {
        setConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    // Load initial messages
    fetch(`/api/v1/chat/messages/${streamId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
      })
      .catch((err) => console.error('Failed to load messages:', err));

    return () => {
      ws.current?.close();
    };
  }, [streamId, wsUrl, currentUser.username]);

  // Send message
  const sendMessage = useCallback(() => {
    if (!inputMessage.trim() || !connected) return;

    const messageData = {
      type: 'message',
      message: inputMessage.trim()};

    ws.current?.send(JSON.stringify(messageData));
    setInputMessage('');
  }, [inputMessage, connected]);

  // Handle moderation actions
  const handleModeration = useCallback(
    async (action: 'delete' | 'timeout' | 'ban', message: ChatMessage) => {
      try {
        const response = await fetch('/api/v1/chat/moderate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`},
          body: JSON.stringify({
            action,
            message_id: action === 'delete' ? message.id : undefined,
            target_user_id: action !== 'delete' ? message.user_id : undefined,
            duration: action === 'timeout' ? 300 : undefined, // 5 min timeout
          })});

        if (!response.ok) throw new Error('Moderation action failed');
        
        setAnchorEl(null);
      } catch (error) { void error;
        console.error('Moderation error:', error);
        setError('Failed to perform moderation action');
      }
    },
    []
  );

  // Render message with moderation menu
  const renderMessage = (message: ChatMessage) => {
    const isOwnMessage = message.user_id === currentUser.id;
    const canModerate = currentUser.role === 'moderator' || currentUser.role === 'streamer';

    return (
      <ListItem
        key={message.id}
        alignItems="flex-start"
        sx={{
          opacity: message.deleted ? 0.5 : 1,
          '&:hover': {
            backgroundColor: 'action.hover'}}}
      >
        <ListItemAvatar>
          <Avatar sx={{ width: 32, height: 32 }}>
            {message.username[0].toUpperCase()}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" component="span">
                {message.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(message.timestamp), {
                  addSuffix: false})}
              </Typography>
            </Box>
          }
          secondary={
            message.deleted ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: 'italic' }}
              >
                [Message deleted]
              </Typography>
            ) : (
              <Typography variant="body2">{message.message}</Typography>
            )
          }
        />
        {canModerate && !isOwnMessage && !message.deleted && (
          <IconButton
            size="small"
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              setSelectedMessage(message);
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
      </ListItem>
    );
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper'}}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'}}
      >
        <Typography variant="h6">Stream Chat</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<PersonIcon />}
            label={activeUsers}
            size="small"
            color={connected ? 'success' : 'default'}
          />
          {!connected && (
            <CircularProgress size={20} />
          )}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {_error}
        </Alert>
      )}

      {/* Messages */}
      <Box
        ref={chatContainerRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 1}}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ p: 4 }}
          >
            No messages yet. Say hello!
          </Typography>
        ) : (
          <List dense>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>

      <Divider />

      {/* Input */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={connected ? 'Type a message...' : 'Connecting...'}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={!connected}
          InputProps={{
            endAdornment: (
              <IconButton
                size="small"
                onClick={sendMessage}
                disabled={!connected || !inputMessage.trim()}
                color="primary"
              >
                <SendIcon />
              </IconButton>
            )}}
        />
      </Box>

      {/* Moderation Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            if (selectedMessage) {
              handleModeration('delete', selectedMessage);
            }
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Message
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedMessage) {
              handleModeration('timeout', selectedMessage);
            }
          }}
        >
          <TimerIcon fontSize="small" sx={{ mr: 1 }} />
          Timeout User (5 min)
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedMessage) {
              handleModeration('ban', selectedMessage);
            }
          }}
        >
          <BlockIcon fontSize="small" sx={{ mr: 1 }} />
          Ban User
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default StreamChat;
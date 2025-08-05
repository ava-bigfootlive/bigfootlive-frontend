import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LiveChat } from './LiveChat';

// Mock chatService with simple implementation
jest.mock('@/services/chat', () => ({
  chatService: {
    connectToChatRoom: jest.fn(),
    disconnectFromChat: jest.fn(),
    getChatHistory: jest.fn().mockResolvedValue({ messages: [] }),
    getChatEmotes: jest.fn().mockResolvedValue([]),
    getChatSettings: jest.fn().mockResolvedValue({
      notifications: { sound: true },
      appearance: { showAvatars: true, showTimestamps: true, theme: 'light' },
    }),
    sendMessage: jest.fn(),
    sendSuperChat: jest.fn(),
    reactToMessage: jest.fn(),
    deleteMessage: jest.fn(),
    timeoutUser: jest.fn(),
    banUser: jest.fn(),
    updateChatSettings: jest.fn(),
  },
}));

// Mock useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockProps = {
  streamId: 'test-stream',
  userId: 'test-user',
  username: 'TestUser',
  userRole: 'viewer',
};

describe('LiveChat Component - Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the connectToChatRoom to simulate room updates
    const mockConnectToChatRoom = require('@/services/chat').chatService.connectToChatRoom as jest.Mock;
    mockConnectToChatRoom.mockImplementation(
      (streamId, userId, handleNewMessage, handleUserUpdate, handleRoomUpdate) => {
        // Simulate a room with chat enabled
        setTimeout(() => {
          handleRoomUpdate({ chatEnabled: true, totalMessages: 0 });
        }, 0);
      }
    );
  });

  it('renders the chat component', () => {
    render(<LiveChat {...mockProps} />);
    expect(screen.getByText('Live Chat')).toBeInTheDocument();
  });

  it('shows connecting status initially', () => {
    render(<LiveChat {...mockProps} />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('renders the message input after loading', async () => {
    render(<LiveChat {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Send a message/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LiveChat } from './LiveChat';
import { chatService } from '@/services/chat';
import { useToast } from '@/components/ui/use-toast';

// Mock chatService
jest.mock('@/services/chat', () => ({
  chatService: {
    connectToChatRoom: jest.fn(),
    disconnectFromChat: jest.fn(),
    getChatHistory: jest.fn(),
    getChatEmotes: jest.fn(),
    getChatSettings: jest.fn(),
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

const mockUser = {
  streamId: 'test-stream',
  userId: 'test-user',
  username: 'TestUser',
  userRole: 'viewer',
};

describe('LiveChat Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock initial data fetching
    (chatService.getChatHistory as jest.Mock).mockResolvedValue({ messages: [] });
    (chatService.getChatEmotes as jest.Mock).mockResolvedValue([]);
    (chatService.getChatSettings as jest.Mock).mockResolvedValue({
      notifications: { sound: true },
      appearance: { showAvatars: true, showTimestamps: true, theme: 'light' },
    });
  });

  it('renders the chat component and connects to the chat room', async () => {
    render(<LiveChat {...mockUser} />);
    
    expect(screen.getByText('Live Chat')).toBeInTheDocument();
    await waitFor(() => {
      expect(chatService.connectToChatRoom).toHaveBeenCalledWith(
        mockUser.streamId,
        mockUser.userId,
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('displays incoming messages', async () => {
    let handleNewMessage: (message: any) => void = () => {};
    (chatService.connectToChatRoom as any).mockImplementation((streamId: any, userId: any, onMessage: any) => {
      handleNewMessage = onMessage;
    });

    render(<LiveChat {...mockUser} />);
    
    const testMessage = {
      id: 'msg1',
      userId: 'user2',
      username: 'AnotherUser',
      message: 'Hello, world!',
      timestamp: new Date(),
      type: 'normal',
    };
    
    await waitFor(() => {
      handleNewMessage(testMessage);
    });
    
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
    expect(screen.getByText('AnotherUser')).toBeInTheDocument();
  });

  it('allows users to send a message', async () => {
    render(<LiveChat {...mockUser} />);
    
    await waitFor(() => {
      // Wait for component to be connected
      expect(screen.getByPlaceholderText('Send a message...')).toBeEnabled();
    });

    fireEvent.change(screen.getByPlaceholderText('Send a message...'), {
      target: { value: 'This is a test message' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    expect(chatService.sendMessage).toHaveBeenCalledWith(
      mockUser.streamId,
      'This is a test message',
      undefined
    );
  });

  it('handles super chat functionality', async () => {
    render(<LiveChat {...mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Send a message...')).toBeEnabled();
    });

    // Click super chat button
    const superChatButton = screen.getByRole('button', { name: /gift/i });
    fireEvent.click(superChatButton);
    
    // Select an amount
    await waitFor(() => {
      const tenDollarButton = screen.getByText('$10');
      fireEvent.click(tenDollarButton);
    });
    
    // Type a message
    fireEvent.change(screen.getByPlaceholderText(/Super Chat/), {
      target: { value: 'This is a super chat!' },
    });
    
    // Send super chat
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    expect(chatService.sendSuperChat).toHaveBeenCalledWith(
      mockUser.streamId,
      'This is a super chat!',
      10
    );
  });

  it('displays user list when toggled', async () => {
    let handleUserUpdate: (users: any[]) => void = () => {};
    (chatService.connectToChatRoom as any).mockImplementation((streamId: any, userId: any, onMessage: any, onUserUpdate: any) => {
      handleUserUpdate = onUserUpdate;
    });

    render(<LiveChat {...mockUser} />);
    
    // Mock users data
    const mockUsers = [
      { userId: 'user1', username: 'User1', role: 'streamer', isOnline: true },
      { userId: 'user2', username: 'User2', role: 'viewer', isOnline: true },
    ];
    
    await waitFor(() => {
      handleUserUpdate(mockUsers);
    });
    
    // Open settings dropdown and toggle user list
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);
    
    const showUserListOption = screen.getByText('Show User List');
    fireEvent.click(showUserListOption);
    
    // Check if users are displayed
    await waitFor(() => {
      expect(screen.getByText('User1')).toBeInTheDocument();
      expect(screen.getByText('User2')).toBeInTheDocument();
    });
  });

  it('handles emote picker functionality', async () => {
    (chatService.getChatEmotes as any).mockResolvedValue([
      { id: '1', name: 'smile', url: 'https://example.com/smile.png' }
    ]);

    render(<LiveChat {...mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Send a message...')).toBeEnabled();
    });

    // Click emote picker button
    const emoteButton = screen.getByRole('button', { name: /smile/i });
    fireEvent.click(emoteButton);
    
    // Should show emote picker
    await waitFor(() => {
      expect(screen.getByText('❤️')).toBeInTheDocument();
    });
    
    // Click an emoji
    fireEvent.click(screen.getByText('❤️'));
    
    // Should add emoji to input
    expect(screen.getByDisplayValue('❤️')).toBeInTheDocument();
  });

  it('handles keyboard shortcuts for sending messages', async () => {
    render(<LiveChat {...mockUser} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Send a message...')).toBeEnabled();
    });

    const input = screen.getByPlaceholderText('Send a message...');
    fireEvent.change(input, {
      target: { value: 'Test message' },
    });
    
    // Press Enter to send
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    expect(chatService.sendMessage).toHaveBeenCalledWith(
      mockUser.streamId,
      'Test message',
      undefined
    );
  });

  it('displays different message types with appropriate styling', async () => {
    let handleNewMessage: (message: any) => void = () => {};
    (chatService.connectToChatRoom as any).mockImplementation((streamId: any, userId: any, onMessage: any) => {
      handleNewMessage = onMessage;
    });

    render(<LiveChat {...mockUser} />);
    
    const donationMessage = {
      id: 'msg1',
      userId: 'user2',
      username: 'Donor',
      message: 'Thanks for the great stream!',
      timestamp: new Date(),
      type: 'donation',
      donationAmount: 25,
    };
    
    await waitFor(() => {
      handleNewMessage(donationMessage);
    });
    
    expect(screen.getByText('Thanks for the great stream!')).toBeInTheDocument();
    expect(screen.getByText('Donor')).toBeInTheDocument();
  });

  it('handles connection errors gracefully', async () => {
    let handleError: (error: string) => void = () => {};
    (chatService.connectToChatRoom as any).mockImplementation((streamId: any, userId: any, onMessage: any, onUserUpdate: any, onRoomUpdate: any, onError: any) => {
      handleError = onError;
    });

    const { toast } = useToast();
    render(<LiveChat {...mockUser} />);
    
    await waitFor(() => {
      handleError('Connection failed');
    });
    
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('cleans up connection on unmount', () => {
    const { unmount } = render(<LiveChat {...mockUser} />);
    
    unmount();
    
    expect(chatService.disconnectFromChat).toHaveBeenCalled();
  });

  it('handles sound settings toggle', async () => {
    render(<LiveChat {...mockUser} />);
    
    // Open settings dropdown
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);
    
    // Toggle sound setting
    const soundOption = screen.getByText('Sound');
    fireEvent.click(soundOption);
    
    expect(chatService.updateChatSettings).toHaveBeenCalled();
  });
});


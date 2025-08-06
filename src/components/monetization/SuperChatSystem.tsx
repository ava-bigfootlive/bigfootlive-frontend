import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Heart, 
  Star, 
  Crown, 
  Gift, 
  Zap, 
  TrendingUp,
  Users,
  MessageCircle,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { websocketService } from '@/services/websocket';
import { apiService } from '@/services/api';
import { FeatureGate, useMonetizationFlags } from '@/hooks/useFeatureFlags';

interface SuperChatMessage {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  message: string;
  amount: number;
  currency: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  timestamp: Date;
  highlighted: boolean;
  duration: number; // Duration in seconds the message stays pinned
}

interface MonetizationStats {
  totalRevenue: number;
  superChats: number;
  donations: number;
  subscribers: number;
  topDonators: Array<{
    username: string;
    amount: number;
    avatar?: string;
  }>;
  revenueToday: number;
  revenueThisMonth: number;
}

interface SuperChatSystemProps {
  eventId: string;
  isStreamer?: boolean;
  onSuperChat?: (superChat: SuperChatMessage) => void;
  className?: string;
}

const SUPER_CHAT_TIERS = {
  bronze: { min: 2, max: 9.99, color: 'bg-amber-600', duration: 5 },
  silver: { min: 10, max: 24.99, color: 'bg-gray-400', duration: 10 },
  gold: { min: 25, max: 49.99, color: 'bg-yellow-500', duration: 20 },
  platinum: { min: 50, max: 99.99, color: 'bg-blue-500', duration: 30 },
  diamond: { min: 100, max: 999.99, color: 'bg-purple-600', duration: 60 }
};

export const SuperChatSystem: React.FC<SuperChatSystemProps> = ({
  eventId,
  isStreamer = false,
  onSuperChat,
  className = ""
}) => {
  const [superChats, setSuperChats] = useState<SuperChatMessage[]>([]);
  const [pinnedSuperChat, setPinnedSuperChat] = useState<SuperChatMessage | null>(null);
  const [stats, setStats] = useState<MonetizationStats>({
    totalRevenue: 0,
    superChats: 0,
    donations: 0,
    subscribers: 0,
    topDonators: [],
    revenueToday: 0,
    revenueThisMonth: 0
  });

  // Super Chat Form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Connect to WebSocket for real-time Super Chat updates
    websocketService.connect();
    websocketService.joinEvent(eventId);

    // Listen for Super Chat messages
    websocketService.onChatMessage((data) => {
      if (data.type === 'super_chat') {
        const superChat: SuperChatMessage = {
          id: data.id,
          userId: data.userId,
          username: data.username,
          displayName: data.displayName,
          avatar: data.avatar,
          message: data.message,
          amount: data.amount,
          currency: data.currency || 'USD',
          tier: getTierFromAmount(data.amount),
          timestamp: new Date(data.timestamp),
          highlighted: true,
          duration: SUPER_CHAT_TIERS[getTierFromAmount(data.amount)].duration
        };

        setSuperChats(prev => [superChat, ...prev]);
        setPinnedSuperChat(superChat);
        onSuperChat?.(superChat);

        // Auto-remove pinned message after duration
        setTimeout(() => {
          setPinnedSuperChat(null);
        }, superChat.duration * 1000);
      }
    });

    // Load monetization stats if streamer
    if (isStreamer) {
      loadMonetizationStats();
    }

    return () => {
      websocketService.disconnect();
    };
  }, [eventId, isStreamer, onSuperChat]);

  const loadMonetizationStats = async () => {
    try {
      const response = await apiService.getEventAnalytics(eventId);
      if (response.success) {
        setStats(response.data.monetization || stats);
      }
    } catch (error) {
      console.error('Failed to load monetization stats:', error);
    }
  };

  const getTierFromAmount = (amount: number): SuperChatMessage['tier'] => {
    if (amount >= SUPER_CHAT_TIERS.diamond.min) return 'diamond';
    if (amount >= SUPER_CHAT_TIERS.platinum.min) return 'platinum';
    if (amount >= SUPER_CHAT_TIERS.gold.min) return 'gold';
    if (amount >= SUPER_CHAT_TIERS.silver.min) return 'silver';
    return 'bronze';
  };

  const getTierIcon = (tier: SuperChatMessage['tier']) => {
    switch (tier) {
      case 'diamond': return <Crown className="text-purple-400" size={16} />;
      case 'platinum': return <Star className="text-blue-400" size={16} />;
      case 'gold': return <Zap className="text-yellow-400" size={16} />;
      case 'silver': return <Gift className="text-gray-400" size={16} />;
      case 'bronze': return <Heart className="text-amber-600" size={16} />;
    }
  };

  const handleSuperChatSubmit = async () => {
    if (!message.trim() || amount < 2) return;

    setIsProcessing(true);
    
    try {
      // Process payment (integrate with Stripe, PayPal, etc.)
      const paymentResult = await processPayment(amount, paymentMethod);
      
      if (paymentResult.success) {
        // Send Super Chat via WebSocket
        websocketService.sendSuperChat(eventId, 'CurrentUser', message, amount);
        
        // Reset form
        setMessage('');
        setAmount(5);
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to send Super Chat:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayment = async (amount: number, method: string) => {
    // Mock payment processing - integrate with real payment provider
    return new Promise<{ success: boolean }>((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 2000);
    });
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const renderSuperChatMessage = (superChat: SuperChatMessage) => {
    const tier = SUPER_CHAT_TIERS[superChat.tier];
    
    return (
      <div
        key={superChat.id}
        className={`p-3 rounded-lg border-l-4 ${tier.color} bg-gradient-to-r from-background to-muted mb-2`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {superChat.avatar && (
              <img 
                src={superChat.avatar} 
                alt={superChat.username}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="font-semibold">{superChat.displayName}</span>
            {getTierIcon(superChat.tier)}
            <Badge variant="secondary">
              {formatCurrency(superChat.amount, superChat.currency)}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {superChat.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm">{superChat.message}</p>
      </div>
    );
  };

  if (isStreamer) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Monetization Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign size={20} />
              <span>Monetization Dashboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.revenueToday)}
                </div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.revenueThisMonth)}
                </div>
                <div className="text-xs text-muted-foreground">This Month</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.superChats}</div>
                <div className="text-xs text-muted-foreground">Super Chats</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.subscribers}</div>
                <div className="text-xs text-muted-foreground">Subscribers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pinned Super Chat */}
        {pinnedSuperChat && (
          <Card className="border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Crown className="text-yellow-600" size={16} />
                <span>Pinned Super Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderSuperChatMessage(pinnedSuperChat)}
            </CardContent>
          </Card>
        )}

        {/* Super Chat History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Super Chats</CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {superChats.length > 0 ? (
              superChats.map(renderSuperChatMessage)
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Gift size={48} className="mx-auto mb-4 opacity-50" />
                <p>No Super Chats yet</p>
                <p className="text-xs">Super Chats will appear here when viewers send them</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Donators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp size={20} />
              <span>Top Supporters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topDonators.map((donator, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    {donator.avatar && (
                      <img 
                        src={donator.avatar} 
                        alt={donator.username}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="font-medium">{donator.username}</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {formatCurrency(donator.amount)}
                  </span>
                </div>
              ))}
              
              {stats.topDonators.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  <Users size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No supporters yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Viewer Super Chat Interface
  return (
    <FeatureGate feature="monetization.superChat" fallback={
      <div className="text-center text-muted-foreground py-8">
        <Gift size={48} className="mx-auto mb-4 opacity-50" />
        <p>Super Chat is not available</p>
        <p className="text-xs">This feature is disabled for this platform</p>
      </div>
    }>
      <div className={`space-y-4 ${className}`}>
      {/* Super Chat Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            <DollarSign size={16} className="mr-2" />
            Send Super Chat
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Crown className="text-yellow-500" size={20} />
              <span>Send Super Chat</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  min="2"
                  max="999"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="pl-8"
                  placeholder="5"
                />
              </div>
              <div className="mt-2">
                <Badge variant={getTierFromAmount(amount) === 'diamond' ? 'default' : 'secondary'}>
                  {getTierFromAmount(amount).toUpperCase()} Tier
                </Badge>
                <span className="ml-2 text-xs text-muted-foreground">
                  Pinned for {SUPER_CHAT_TIERS[getTierFromAmount(amount)].duration}s
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message will be highlighted!"
                maxLength={200}
                rows={3}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {200 - message.length} characters remaining
              </div>
            </div>

            <div>
              <Label htmlFor="payment">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="apple">Apple Pay</SelectItem>
                  <SelectItem value="google">Google Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 space-y-2">
              <Button 
                onClick={handleSuperChatSubmit}
                disabled={!message.trim() || amount < 2 || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <DollarSign size={16} className="mr-2" />
                    Send {formatCurrency(amount)} Super Chat
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Your message will be highlighted and pinned for {SUPER_CHAT_TIERS[getTierFromAmount(amount)].duration} seconds
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recent Super Chats (Viewer View) */}
      {superChats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Super Chats</CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {superChats.slice(0, 5).map(renderSuperChatMessage)}
          </CardContent>
        </Card>
      )}
      </div>
    </FeatureGate>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Star, 
  Zap, 
  Heart, 
  CheckCircle, 
  Clock,
  Gift,
  Users,
  TrendingUp,
  Settings,
  CreditCard,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { websocketService } from '@/services/websocket';
import { apiService } from '@/services/api';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  benefits: string[];
  color: string;
  icon: React.ReactNode;
  popular?: boolean;
}

interface Subscription {
  id: string;
  userId: string;
  tierId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trial';
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  tier: SubscriptionTier;
}

interface SubscriptionStats {
  totalSubscribers: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  newSubscribers: number;
  churnRate: number;
  averageRevenue: number;
  topTier: string;
}

interface SubscriptionSystemProps {
  streamerId: string;
  viewerId?: string;
  isStreamer?: boolean;
  className?: string;
}

const DEFAULT_TIERS: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Supporter',
    price: 4.99,
    currency: 'USD',
    interval: 'monthly',
    benefits: [
      'Chat without ads',
      'Custom emotes',
      'Subscriber badge',
      'Priority support'
    ],
    color: 'bg-blue-500',
    icon: <Heart className="text-blue-400" size={20} />
  },
  {
    id: 'premium',
    name: 'VIP',
    price: 9.99,
    currency: 'USD',
    interval: 'monthly',
    benefits: [
      'All Supporter benefits',
      'Exclusive Discord access',
      'Monthly Q&A sessions',
      'Early access to content',
      'Custom username color'
    ],
    color: 'bg-purple-500',
    icon: <Star className="text-purple-400" size={20} />,
    popular: true
  },
  {
    id: 'legendary',
    name: 'Legendary',
    price: 24.99,
    currency: 'USD',
    interval: 'monthly',
    benefits: [
      'All VIP benefits',
      'Personal shoutouts',
      'Private Discord channel',
      'Exclusive merchandise',
      'Monthly 1-on-1 call',
      'Custom emote requests'
    ],
    color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    icon: <Crown className="text-yellow-400" size={20} />
  }
];

export const SubscriptionSystem: React.FC<SubscriptionSystemProps> = ({
  streamerId,
  viewerId,
  isStreamer = false,
  className = ""
}) => {
  const [tiers, setTiers] = useState<SubscriptionTier[]>(DEFAULT_TIERS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [stats, setStats] = useState<SubscriptionStats>({
    totalSubscribers: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    newSubscribers: 0,
    churnRate: 0,
    averageRevenue: 0,
    topTier: 'premium'
  });

  // Dialog states
  const [isSubscribeDialogOpen, setIsSubscribeDialogOpen] = useState(false);
  const [isManageTiersOpen, setIsManageTiersOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Tier management states
  const [editingTier, setEditingTier] = useState<SubscriptionTier | null>(null);
  const [newTierName, setNewTierName] = useState('');
  const [newTierPrice, setNewTierPrice] = useState(9.99);
  const [newTierBenefits, setNewTierBenefits] = useState(['']);

  useEffect(() => {
    loadSubscriptionData();
    
    if (isStreamer) {
      loadSubscriptionStats();
    }
    
    if (viewerId) {
      loadUserSubscription();
    }
  }, [streamerId, viewerId, isStreamer]);

  const loadSubscriptionData = async () => {
    try {
      const response = await apiService.getSubscriptionTiers(streamerId);
      if (response.success && response.data.length > 0) {
        setTiers(response.data);
      }
    } catch (error) {
      console.error('Failed to load subscription tiers:', error);
    }
  };

  const loadSubscriptionStats = async () => {
    try {
      const response = await apiService.getSubscriptionStats(streamerId);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load subscription stats:', error);
    }
  };

  const loadUserSubscription = async () => {
    if (!viewerId) return;
    
    try {
      const response = await apiService.getUserSubscription(viewerId, streamerId);
      if (response.success && response.data) {
        setCurrentSubscription(response.data);
      }
    } catch (error) {
      console.error('Failed to load user subscription:', error);
    }
  };

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!viewerId) return;
    
    setIsProcessing(true);
    
    try {
      // Process subscription payment
      const paymentResult = await processSubscriptionPayment(tier);
      
      if (paymentResult.success) {
        // Create subscription
        const response = await apiService.createSubscription({
          streamerId,
          tierId: tier.id,
          userId: viewerId
        });
        
        if (response.success) {
          setCurrentSubscription(response.data);
          setIsSubscribeDialogOpen(false);
          
          // Notify streamer via WebSocket
          websocketService.emit('new_subscriber', {
            streamerId,
            subscriber: {
              userId: viewerId,
              tier: tier.name,
              amount: tier.price
            }
          });
        }
      }
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;
    
    setIsProcessing(true);
    
    try {
      const response = await apiService.cancelSubscription(currentSubscription.id);
      if (response.success) {
        setCurrentSubscription({
          ...currentSubscription,
          status: 'cancelled',
          autoRenew: false
        });
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processSubscriptionPayment = async (tier: SubscriptionTier) => {
    // Mock payment processing - integrate with Stripe, PayPal, etc.
    return new Promise<{ success: boolean }>((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 2000);
    });
  };

  const addBenefit = () => {
    setNewTierBenefits([...newTierBenefits, '']);
  };

  const updateBenefit = (index: number, value: string) => {
    const updated = [...newTierBenefits];
    updated[index] = value;
    setNewTierBenefits(updated);
  };

  const removeBenefit = (index: number) => {
    setNewTierBenefits(newTierBenefits.filter((_, i) => i !== index));
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const getStatusBadge = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'past_due':
        return <Badge variant="outline">Past Due</Badge>;
      case 'trial':
        return <Badge className="bg-blue-500">Trial</Badge>;
      default:
        return null;
    }
  };

  const renderTierCard = (tier: SubscriptionTier, isSelected = false) => (
    <Card 
      key={tier.id} 
      className={`relative ${tier.popular ? 'border-2 border-purple-500' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-purple-500">Most Popular</Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-2">{tier.icon}</div>
        <CardTitle className="text-xl">{tier.name}</CardTitle>
        <div className="text-3xl font-bold">
          {formatCurrency(tier.price)}
          <span className="text-sm text-muted-foreground font-normal">
            /{tier.interval}
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-2 mb-4">
          {tier.benefits.map((benefit, index) => (
            <li key={index} className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm">{benefit}</span>
            </li>
          ))}
        </ul>
        
        {!isStreamer && (
          <Button 
            className="w-full"
            variant={currentSubscription?.tierId === tier.id ? "outline" : "default"}
            onClick={() => {
              setSelectedTier(tier);
              setIsSubscribeDialogOpen(true);
            }}
            disabled={currentSubscription?.tierId === tier.id}
          >
            {currentSubscription?.tierId === tier.id ? 'Current Plan' : `Subscribe for ${formatCurrency(tier.price)}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (isStreamer) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Subscription Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp size={20} />
              <span>Subscription Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalSubscribers}</div>
                <div className="text-xs text-muted-foreground">Total Subscribers</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.monthlyRevenue)}
                </div>
                <div className="text-xs text-muted-foreground">Monthly Revenue</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.yearlyRevenue)}
                </div>
                <div className="text-xs text-muted-foreground">Yearly Revenue</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{stats.newSubscribers}</div>
                <div className="text-xs text-muted-foreground">New This Month</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.churnRate}%</div>
                <div className="text-xs text-muted-foreground">Churn Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.averageRevenue)}
                </div>
                <div className="text-xs text-muted-foreground">Avg. Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Tiers Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Subscription Tiers</CardTitle>
            <Button onClick={() => setIsManageTiersOpen(true)}>
              <Settings size={16} className="mr-2" />
              Manage Tiers
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {tiers.map(tier => renderTierCard(tier))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Subscribers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users size={20} />
              <span>Recent Subscribers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptions.slice(0, 5).map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {subscription.userId.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">User {subscription.userId.slice(-8)}</div>
                      <div className="text-sm text-muted-foreground">
                        {subscription.tier.name} • {subscription.startDate.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(subscription.tier.price)}
                    </div>
                    {getStatusBadge(subscription.status)}
                  </div>
                </div>
              ))}
              
              {subscriptions.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No subscribers yet</p>
                  <p className="text-xs">Subscribers will appear here when users subscribe</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Viewer subscription interface
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Subscription Status */}
      {currentSubscription && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="text-green-600" size={20} />
              <span>Your Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">{currentSubscription.tier.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(currentSubscription.tier.price)}/{currentSubscription.tier.interval}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {currentSubscription.autoRenew ? 'Auto-renews' : 'Ends'} on{' '}
                  {currentSubscription.endDate?.toLocaleDateString()}
                </div>
              </div>
              
              <div className="text-right">
                {getStatusBadge(currentSubscription.status)}
                <div className="mt-2 space-x-2">
                  <Button size="sm" variant="outline">
                    Update Payment
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={handleCancelSubscription}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Subscription Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Support Your Favorite Streamer</CardTitle>
          <p className="text-muted-foreground">
            Choose a subscription tier to unlock exclusive perks and support the content you love.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {tiers.map(tier => renderTierCard(tier))}
          </div>
        </CardContent>
      </Card>

      {/* Subscribe Dialog */}
      <Dialog open={isSubscribeDialogOpen} onOpenChange={setIsSubscribeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Crown className="text-yellow-500" size={20} />
              <span>Subscribe to {selectedTier?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedTier && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="text-3xl font-bold">
                  {formatCurrency(selectedTier.price)}
                  <span className="text-lg text-muted-foreground font-normal">
                    /{selectedTier.interval}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Billed {selectedTier.interval} • Cancel anytime
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">You'll get:</h4>
                <ul className="space-y-1">
                  {selectedTier.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="text-green-500" size={14} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => handleSubscribe(selectedTier)}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CreditCard size={16} className="mr-2" />
                      Subscribe for {formatCurrency(selectedTier.price)}
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Your subscription will start immediately and auto-renew {selectedTier.interval}.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

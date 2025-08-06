import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  DollarSign, 
  Gift,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  MessageCircle,
  Volume2,
  Settings,
  Trophy,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { websocketService } from '@/services/websocket';
import { apiService } from '@/services/api';

interface Donation {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
  timestamp: Date;
  soundAlert?: string;
  featured: boolean;
}

interface DonationGoal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  endDate?: Date;
  isActive: boolean;
  reward?: string;
}

interface DonationStats {
  totalDonations: number;
  totalAmount: number;
  todayAmount: number;
  thisMonthAmount: number;
  averageDonation: number;
  topDonors: Array<{
    username: string;
    amount: number;
    avatar?: string;
  }>;
  recentDonations: Donation[];
}

interface DonationSystemProps {
  streamerId: string;
  viewerId?: string;
  isStreamer?: boolean;
  className?: string;
}

const QUICK_AMOUNTS = [5, 10, 20, 50, 100];
const SOUND_ALERTS = [
  { id: 'coin', name: 'Coin Drop', file: 'coin.mp3' },
  { id: 'cheer', name: 'Cheer', file: 'cheer.mp3' },
  { id: 'bell', name: 'Bell', file: 'bell.mp3' },
  { id: 'applause', name: 'Applause', file: 'applause.mp3' },
  { id: 'tada', name: 'Ta-da!', file: 'tada.mp3' },
];

export const DonationSystem: React.FC<DonationSystemProps> = ({
  streamerId,
  viewerId,
  isStreamer = false,
  className = ""
}) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DonationStats>({
    totalDonations: 0,
    totalAmount: 0,
    todayAmount: 0,
    thisMonthAmount: 0,
    averageDonation: 0,
    topDonors: [],
    recentDonations: []
  });
  const [goals, setGoals] = useState<DonationGoal[]>([]);

  // Donation form state
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);
  const [amount, setAmount] = useState<number>(10);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [soundAlert, setSoundAlert] = useState('coin');
  const [isProcessing, setIsProcessing] = useState(false);

  // Goal management state
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(100);
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalReward, setNewGoalReward] = useState('');

  // Settings state
  const [minDonationAmount, setMinDonationAmount] = useState(1);
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [showDonationGoal, setShowDonationGoal] = useState(true);
  const [featuredDonationMin, setFeaturedDonationMin] = useState(25);

  useEffect(() => {
    loadDonationData();
    
    if (isStreamer) {
      loadDonationStats();
      loadDonationGoals();
    }

    // WebSocket listeners for real-time donations
    websocketService.connect();
    websocketService.onDonation((donation: Donation) => {
      setDonations(prev => [donation, ...prev]);
      
      // Play sound alert if configured
      if (donation.soundAlert && isStreamer) {
        playSound(donation.soundAlert);
      }
    });

    return () => {
      websocketService.disconnect();
    };
  }, [streamerId, isStreamer]);

  const loadDonationData = async () => {
    try {
      const response = await apiService.getDonations(streamerId);
      if (response.success) {
        setDonations(response.data);
      }
    } catch (error) {
      console.error('Failed to load donations:', error);
    }
  };

  const loadDonationStats = async () => {
    try {
      const response = await apiService.getDonationStats(streamerId);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load donation stats:', error);
    }
  };

  const loadDonationGoals = async () => {
    try {
      const response = await apiService.getDonationGoals(streamerId);
      if (response.success) {
        setGoals(response.data);
      }
    } catch (error) {
      console.error('Failed to load donation goals:', error);
    }
  };

  const handleDonate = async () => {
    if (!viewerId || amount < minDonationAmount) return;

    setIsProcessing(true);

    try {
      // Process payment
      const paymentResult = await processDonationPayment(amount);
      
      if (paymentResult.success) {
        const donationData = {
          streamerId,
          userId: viewerId,
          amount,
          currency: 'USD',
          message: message.trim(),
          isAnonymous,
          soundAlert
        };

        // Send donation via API
        const response = await apiService.createDonation(donationData);
        
        if (response.success) {
          // Send real-time notification via WebSocket
          websocketService.emit('donation', {
            streamerId,
            donation: response.data
          });

          // Reset form
          setAmount(10);
          setMessage('');
          setIsAnonymous(false);
          setSoundAlert('coin');
          setIsDonationDialogOpen(false);
          
          // Show success message
          alert('Thank you for your donation!');
        }
      }
    } catch (error) {
      console.error('Donation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processDonationPayment = async (amount: number) => {
    // Mock payment processing - integrate with payment provider
    return new Promise<{ success: boolean }>((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 2000);
    });
  };

  const handleCreateGoal = async () => {
    if (!newGoalTitle.trim() || newGoalTarget <= 0) return;

    try {
      const goalData = {
        streamerId,
        title: newGoalTitle,
        description: newGoalDescription,
        targetAmount: newGoalTarget,
        currency: 'USD',
        reward: newGoalReward
      };

      const response = await apiService.createDonationGoal(goalData);
      
      if (response.success) {
        setGoals([response.data, ...goals]);
        
        // Reset form
        setNewGoalTitle('');
        setNewGoalTarget(100);
        setNewGoalDescription('');
        setNewGoalReward('');
        setIsGoalDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create donation goal:', error);
    }
  };

  const playSound = (soundFile: string) => {
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.volume = 0.5;
    audio.play().catch(console.error);
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const renderDonation = (donation: Donation) => (
    <div
      key={donation.id}
      className={`p-3 rounded-lg border ${donation.featured ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950' : 'border-border'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {!donation.isAnonymous && donation.avatar && (
            <img 
              src={donation.avatar} 
              alt={donation.username}
              className="w-6 h-6 rounded-full"
            />
          )}
          <div>
            <div className="font-semibold">
              {donation.isAnonymous ? 'Anonymous' : donation.displayName}
            </div>
            <div className="text-xs text-muted-foreground">
              {donation.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-500">
            {formatCurrency(donation.amount, donation.currency)}
          </Badge>
          {donation.featured && <Star className="text-yellow-500" size={16} />}
        </div>
      </div>
      
      {donation.message && (
        <p className="text-sm bg-muted p-2 rounded italic">
          "{donation.message}"
        </p>
      )}
    </div>
  );

  const renderGoal = (goal: DonationGoal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    
    return (
      <Card key={goal.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{goal.title}</CardTitle>
            <Badge variant={goal.isActive ? "default" : "secondary"}>
              {goal.isActive ? 'Active' : 'Completed'}
            </Badge>
          </div>
          {goal.description && (
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{formatCurrency(goal.currentAmount)}</span>
              <span>{formatCurrency(goal.targetAmount)}</span>
            </div>
            
            <Progress value={Math.min(progress, 100)} className="h-3" />
            
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{Math.round(progress)}% complete</span>
              {goal.endDate && (
                <span>Ends {goal.endDate.toLocaleDateString()}</span>
              )}
            </div>
            
            {goal.reward && (
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <Gift className="inline mr-1" size={14} />
                Reward: {goal.reward}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isStreamer) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Donation Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp size={20} />
              <span>Donation Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.todayAmount)}
                </div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.thisMonthAmount)}
                </div>
                <div className="text-xs text-muted-foreground">This Month</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.totalAmount)}
                </div>
                <div className="text-xs text-muted-foreground">All Time</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalDonations}</div>
                <div className="text-xs text-muted-foreground">Total Donations</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.averageDonation)}
                </div>
                <div className="text-xs text-muted-foreground">Average</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donation Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Trophy size={20} />
              <span>Donation Goals</span>
            </CardTitle>
            <Button onClick={() => setIsGoalDialogOpen(true)}>
              <Gift size={16} className="mr-2" />
              Create Goal
            </Button>
          </CardHeader>
          <CardContent>
            {goals.length > 0 ? (
              goals.map(renderGoal)
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                <p>No donation goals yet</p>
                <p className="text-xs">Create goals to motivate your community</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart size={20} />
              <span>Recent Donations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {donations.length > 0 ? (
              <div className="space-y-3">
                {donations.slice(0, 10).map(renderDonation)}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Heart size={48} className="mx-auto mb-4 opacity-50" />
                <p>No donations yet</p>
                <p className="text-xs">Donations will appear here when viewers donate</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Donors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users size={20} />
              <span>Top Supporters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topDonors.map((donor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    {donor.avatar && (
                      <img 
                        src={donor.avatar} 
                        alt={donor.username}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="font-medium">{donor.username}</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {formatCurrency(donor.amount)}
                  </span>
                </div>
              ))}
              
              {stats.topDonors.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  <Users size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No donors yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Goal Dialog */}
        <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Donation Goal</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="goalTitle">Goal Title</Label>
                <Input
                  id="goalTitle"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="New gaming setup"
                />
              </div>

              <div>
                <Label htmlFor="goalTarget">Target Amount ($)</Label>
                <Input
                  id="goalTarget"
                  type="number"
                  min="1"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="goalDescription">Description (Optional)</Label>
                <Textarea
                  id="goalDescription"
                  value={newGoalDescription}
                  onChange={(e) => setNewGoalDescription(e.target.value)}
                  placeholder="Help me upgrade my streaming setup!"
                />
              </div>

              <div>
                <Label htmlFor="goalReward">Reward for Completion (Optional)</Label>
                <Input
                  id="goalReward"
                  value={newGoalReward}
                  onChange={(e) => setNewGoalReward(e.target.value)}
                  placeholder="Special 24-hour stream!"
                />
              </div>

              <Button 
                onClick={handleCreateGoal}
                disabled={!newGoalTitle.trim() || newGoalTarget <= 0}
                className="w-full"
              >
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Viewer donation interface
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Active Goal Display */}
      {goals.filter(g => g.isActive).map(renderGoal)}

      {/* Donation Button */}
      <Dialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
            <Heart size={16} className="mr-2" />
            Send Donation
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Heart className="text-pink-500" size={20} />
              <span>Send Donation</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Quick Amounts</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {QUICK_AMOUNTS.map(quickAmount => (
                  <Button
                    key={quickAmount}
                    variant={amount === quickAmount ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(quickAmount)}
                  >
                    ${quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="customAmount">Custom Amount ($)</Label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="customAmount"
                  type="number"
                  min={minDonationAmount}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="donationMessage">Message (Optional)</Label>
              <Textarea
                id="donationMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something nice!"
                maxLength={200}
                rows={3}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {200 - message.length} characters remaining
              </div>
            </div>

            <div>
              <Label htmlFor="soundAlert">Sound Alert</Label>
              <Select value={soundAlert} onValueChange={setSoundAlert}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOUND_ALERTS.map(sound => (
                    <SelectItem key={sound.id} value={sound.id}>
                      <div className="flex items-center space-x-2">
                        <Volume2 size={14} />
                        <span>{sound.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {allowAnonymous && (
              <div className="flex items-center space-x-2">
                <Switch 
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous">Donate anonymously</Label>
              </div>
            )}

            <div className="pt-4">
              <Button 
                onClick={handleDonate}
                disabled={!amount || amount < minDonationAmount || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Heart size={16} className="mr-2" />
                    Donate {formatCurrency(amount)}
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-2">
                Your donation helps support this creator
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recent Donations (Viewer View) */}
      {donations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Donations</CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {donations.slice(0, 5).map(renderDonation)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

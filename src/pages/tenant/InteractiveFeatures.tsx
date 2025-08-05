/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { Activity, Archive, BarChart3, CheckCircle, Clock, Copy, Download, Edit, Eye, Hash, Heart, MessageSquare, MoreVertical, Pause, Plus, Search, Star, Target, ThumbsUp, Trash2, TrendingUp, Users, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Types
interface Poll {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'yes-no' | 'rating';
  options: PollOption[];
  status: 'draft' | 'active' | 'closed';
  streamId?: string;
  streamTitle?: string;
  created: Date;
  startedAt?: Date;
  closedAt?: Date;
  totalVotes: number;
  settings: {
    showResults: boolean;
    allowChange: boolean;
    anonymous: boolean;
  };
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface Question {
  id: string;
  text: string;
  author: string;
  streamId: string;
  streamTitle: string;
  status: 'pending' | 'approved' | 'answered' | 'hidden';
  votes: number;
  created: Date;
  answeredAt?: Date;
  answer?: string;
  isAnonymous: boolean;
  isPinned: boolean;
}

interface Reaction {
  type: string;
  emoji: string;
  count: number;
  label: string;
}

interface Checkpoint {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  streamId: string;
  streamTitle: string;
  type: 'chapter' | 'highlight' | 'announcement';
  created: Date;
  createdBy: string;
  isFeatured: boolean;
  clickCount: number;
}

// Poll Card Component
const PollCard: React.FC<{ poll: Poll }> = ({ poll }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'secondary';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'single':
        return <CheckCircle className="h-4 w-4" />;
      case 'multiple':
        return <Hash className="h-4 w-4" />;
      case 'yes-no':
        return <ThumbsUp className="h-4 w-4" />;
      case 'rating':
        return <Star className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{poll.question}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(poll.status)}>
                {poll.status}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {getTypeIcon(poll.type)}
                {poll.type.replace('-', ' ')}
              </span>
              {poll.streamTitle && (
                <span className="text-xs text-muted-foreground">
                  • {poll.streamTitle}
                </span>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Results
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Poll
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Poll Results Preview */}
        <div className="space-y-2">
          {poll.options.slice(0, 3).map((option) => (
            <div key={option.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate">{option.text}</span>
                <span className="text-muted-foreground">{option.percentage}%</span>
              </div>
              <Progress value={option.percentage} className="h-2" />
            </div>
          ))}
          {poll.options.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{poll.options.length - 3} more options
            </p>
          )}
        </div>

        <Separator />

        {/* Poll Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {poll.totalVotes} votes
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {poll.created.toLocaleDateString()}
            </span>
          </div>
          {poll.status === 'active' && (
            <Button size="sm" variant="outline">
              <Pause className="h-3 w-3 mr-1" />
              Close Poll
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Question Card Component
const QuestionCard: React.FC<{ question: Question }> = ({ question }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'success';
      case 'approved':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'hidden':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{question.text}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{question.isAnonymous ? 'Anonymous' : question.author}</span>
                <span>•</span>
                <span>{question.streamTitle}</span>
                <span>•</span>
                <span>{question.created.toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {question.isPinned && (
                <Badge variant="outline" className="text-xs">
                  Pinned
                </Badge>
              )}
              <Badge variant={getStatusColor(question.status)}>
                {question.status}
              </Badge>
            </div>
          </div>

          {question.answer && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Answer:</p>
                <p className="text-sm">{question.answer}</p>
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <ThumbsUp className="h-3 w-3 mr-1" />
                {question.votes}
              </Button>
            </div>
            <div className="flex items-center gap-1">
              {question.status === 'pending' && (
                <>
                  <Button variant="ghost" size="sm">
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <XCircle className="h-3 w-3" />
                  </Button>
                </>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Answer Question</DropdownMenuItem>
                  <DropdownMenuItem>Pin Question</DropdownMenuItem>
                  <DropdownMenuItem>Hide Question</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-danger">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Create Poll Dialog
const CreatePollDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [pollData, setPollData] = useState({
    question: '',
    type: 'single',
    options: ['', ''],
    settings: {
      showResults: true,
      allowChange: false,
      anonymous: false
    }
  });

  const addOption = () => {
    setPollData({
      ...pollData,
      options: [...pollData.options, '']
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...pollData.options];
    newOptions[index] = value;
    setPollData({ ...pollData, options: newOptions });
  };

  const removeOption = (index: number) => {
    if (pollData.options.length > 2) {
      setPollData({
        ...pollData,
        options: pollData.options.filter((_, i) => i !== index)
      });
    }
  };

  const handleCreate = () => {
    toast({
      title: "Poll Created",
      description: "Your poll has been created successfully"});
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Poll
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Poll</DialogTitle>
          <DialogDescription>
            Create an interactive poll for your audience
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="poll-question">Poll Question</Label>
            <Input
              id="poll-question"
              placeholder="What would you like to ask?"
              value={pollData.question}
              onChange={(e) => setPollData({ ...pollData, question: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Poll Type</Label>
            <RadioGroup value={pollData.type} onValueChange={(value) => setPollData({ ...pollData, type: value })}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="font-normal cursor-pointer">
                    Single Choice
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="multiple" id="multiple" />
                  <Label htmlFor="multiple" className="font-normal cursor-pointer">
                    Multiple Choice
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes-no" id="yes-no" />
                  <Label htmlFor="yes-no" className="font-normal cursor-pointer">
                    Yes/No
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rating" id="rating" />
                  <Label htmlFor="rating" className="font-normal cursor-pointer">
                    Rating (1-5)
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {pollData.type !== 'yes-no' && pollData.type !== 'rating' && (
            <div className="space-y-2">
              <Label>Answer Options</Label>
              <div className="space-y-2">
                {pollData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                    />
                    {pollData.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-4">
            <Label>Poll Settings</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-results" className="text-sm font-normal">
                  Show results in real-time
                </Label>
                <Switch
                  id="show-results"
                  checked={pollData.settings.showResults}
                  onCheckedChange={(checked) => 
                    setPollData({ 
                      ...pollData, 
                      settings: { ...pollData.settings, showResults: checked }
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allow-change" className="text-sm font-normal">
                  Allow voters to change their vote
                </Label>
                <Switch
                  id="allow-change"
                  checked={pollData.settings.allowChange}
                  onCheckedChange={(checked) => 
                    setPollData({ 
                      ...pollData, 
                      settings: { ...pollData.settings, allowChange: checked }
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="anonymous" className="text-sm font-normal">
                  Anonymous voting
                </Label>
                <Switch
                  id="anonymous"
                  checked={pollData.settings.anonymous}
                  onCheckedChange={(checked) => 
                    setPollData({ 
                      ...pollData, 
                      settings: { ...pollData.settings, anonymous: checked }
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!pollData.question}>
            Create Poll
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Interactive Features Component
export default function InteractiveFeatures() {
  const [activeTab, setActiveTab] = useState('polls');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const [polls] = useState<Poll[]>([
    {
      id: '1',
      question: 'What topic should we cover in the next webinar?',
      type: 'single',
      options: [
        { id: '1', text: 'Advanced Analytics', votes: 234, percentage: 45 },
        { id: '2', text: 'API Integration', votes: 156, percentage: 30 },
        { id: '3', text: 'Security Best Practices', votes: 98, percentage: 19 },
        { id: '4', text: 'Performance Optimization', votes: 31, percentage: 6 }
      ],
      status: 'active',
      streamTitle: 'Q4 Planning Session',
      created: new Date('2024-01-18'),
      totalVotes: 519,
      settings: {
        showResults: true,
        allowChange: false,
        anonymous: false
      }
    },
    {
      id: '2',
      question: 'Rate today\'s presentation',
      type: 'rating',
      options: [],
      status: 'closed',
      streamTitle: 'Product Launch Event',
      created: new Date('2024-01-15'),
      totalVotes: 892,
      settings: {
        showResults: true,
        allowChange: false,
        anonymous: true
      }
    }
  ]);

  const [questions] = useState<Question[]>([
    {
      id: '1',
      text: 'Can you explain more about the new pricing model?',
      author: 'John Doe',
      streamId: '1',
      streamTitle: 'Q4 Earnings Call',
      status: 'answered',
      votes: 45,
      created: new Date('2024-01-19'),
      answeredAt: new Date('2024-01-19'),
      answer: 'The new pricing model includes three tiers...',
      isAnonymous: false,
      isPinned: true
    },
    {
      id: '2',
      text: 'Will there be mobile app support?',
      author: 'Anonymous',
      streamId: '2',
      streamTitle: 'Product Launch',
      status: 'pending',
      votes: 32,
      created: new Date('2024-01-20'),
      isAnonymous: true,
      isPinned: false
    }
  ]);

  const reactions: Reaction[] = [
    { type: 'like', emoji: '👍', count: 1234, label: 'Like' },
    { type: 'love', emoji: '❤️', count: 892, label: 'Love' },
    { type: 'fire', emoji: '🔥', count: 567, label: 'Fire' },
    { type: 'applause', emoji: '👏', count: 445, label: 'Applause' },
    { type: 'laugh', emoji: '😂', count: 234, label: 'Laugh' },
    { type: 'wow', emoji: '😮', count: 123, label: 'Wow' }
  ];

  const [checkpoints] = useState<Checkpoint[]>([
    {
      id: '1',
      title: 'Opening Remarks',
      description: 'CEO introduces the quarterly results',
      timestamp: '00:02:30',
      streamId: '1',
      streamTitle: 'Q4 Earnings Call',
      type: 'chapter',
      created: new Date('2024-01-19'),
      createdBy: 'Admin',
      isFeatured: true,
      clickCount: 234
    },
    {
      id: '2',
      title: 'Product Demo',
      description: 'Live demonstration of new features',
      timestamp: '00:15:45',
      streamId: '2',
      streamTitle: 'Product Launch',
      type: 'highlight',
      created: new Date('2024-01-18'),
      createdBy: 'Admin',
      isFeatured: false,
      clickCount: 567
    }
  ]);

  // Analytics data
  const engagementData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    polls: Math.floor(Math.random() * 100) + 20,
    questions: Math.floor(Math.random() * 50) + 10,
    reactions: Math.floor(Math.random() * 500) + 100}));

  const reactionDistribution = reactions.map(r => ({
    name: r.label,
    value: r.count,
    emoji: r.emoji
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interactive Features</h1>
          <p className="text-muted-foreground">Engage your audience with polls, Q&A, reactions, and more</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <CreatePollDialog />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{polls.filter(p => p.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {polls.reduce((sum, p) => sum + p.totalVotes, 0).toLocaleString()} total votes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Q&A Questions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground">
              {questions.filter(q => q.status === 'pending').length} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reactions</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reactions.reduce((sum, r) => sum + r.count, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all streams
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checkpoints</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkpoints.length}</div>
            <p className="text-xs text-muted-foreground">
              {checkpoints.reduce((sum, c) => sum + c.clickCount, 0).toLocaleString()} clicks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="polls">
            <BarChart3 className="h-4 w-4 mr-2" />
            Polls
          </TabsTrigger>
          <TabsTrigger value="qa">
            <MessageSquare className="h-4 w-4 mr-2" />
            Q&A
          </TabsTrigger>
          <TabsTrigger value="reactions">
            <Heart className="h-4 w-4 mr-2" />
            Reactions
          </TabsTrigger>
          <TabsTrigger value="checkpoints">
            <Target className="h-4 w-4 mr-2" />
            Checkpoints
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Activity className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Polls Tab */}
        <TabsContent value="polls" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search polls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Polls</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {polls.map(poll => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        </TabsContent>

        {/* Q&A Tab */}
        <TabsContent value="qa" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Questions</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="answered">Answered</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Archive className="h-4 w-4 mr-2" />
                Archive Old
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {questions.map(question => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </TabsContent>

        {/* Reactions Tab */}
        <TabsContent value="reactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reaction Overview</CardTitle>
              <CardDescription>
                Real-time reactions from your audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {reactions.map(reaction => (
                  <Card key={reaction.type}>
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{reaction.emoji}</div>
                      <div className="text-2xl font-bold">{reaction.count.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">{reaction.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-4">Reaction Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reactionDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.emoji} ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reactionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Reaction Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reaction-burst" className="text-sm font-normal">
                      Enable reaction bursts
                    </Label>
                    <Switch id="reaction-burst" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="custom-reactions" className="text-sm font-normal">
                      Allow custom reactions
                    </Label>
                    <Switch id="custom-reactions" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reaction-cooldown" className="text-sm font-normal">
                      Reaction cooldown (seconds)
                    </Label>
                    <Input type="number" defaultValue="3" className="w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checkpoints Tab */}
        <TabsContent value="checkpoints" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Create navigational markers for your streams
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Checkpoint
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stream Checkpoints</CardTitle>
              <CardDescription>
                Help viewers navigate to important moments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checkpoints.map(checkpoint => (
                  <div key={checkpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-16 h-16 bg-muted rounded">
                        <Clock className="h-4 w-4 mb-1" />
                        <span className="text-xs font-mono">{checkpoint.timestamp}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{checkpoint.title}</h4>
                          {checkpoint.isFeatured && (
                            <Badge variant="secondary" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                        {checkpoint.description && (
                          <p className="text-sm text-muted-foreground">{checkpoint.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{checkpoint.streamTitle}</span>
                          <span>•</span>
                          <span>{checkpoint.clickCount} clicks</span>
                          <span>•</span>
                          <span>By {checkpoint.createdBy}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>
                          {checkpoint.isFeatured ? 'Unfeature' : 'Feature'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-danger">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Analytics</CardTitle>
              <CardDescription>
                Track audience interaction over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="polls" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="questions" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="reactions" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
                <CardDescription>
                  Most engaging interactive features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Product Feature Poll</p>
                      <p className="text-sm text-muted-foreground">892 votes</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">CEO Q&A Session</p>
                      <p className="text-sm text-muted-foreground">567 questions</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Launch Event Reactions</p>
                      <p className="text-sm text-muted-foreground">12.3k reactions</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Insights</CardTitle>
                <CardDescription>
                  Key metrics and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average poll participation</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <Progress value={67} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Q&A response rate</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reaction frequency</span>
                    <span className="font-medium">124/min</span>
                  </div>
                  <Progress value={75} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
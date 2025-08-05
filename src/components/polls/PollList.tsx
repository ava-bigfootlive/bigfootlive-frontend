import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { PollViewer } from './PollViewer';
import { PollCreator } from './PollCreator';
import { toast } from 'sonner';

interface Poll {
  id: string;
  ends_at: string;
  user_voted: boolean;
  user_vote_option_id: string;
  [key: string]: unknown;
}

interface PollListProps {
  streamId: string;
  canCreate?: boolean;
  className?: string;
}

export function PollList({ streamId, canCreate = false, className }: PollListProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreator, setShowCreator] = useState(false);

  const fetchPolls = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await api.get(`/polls/stream/${streamId}`);
      const allPolls = response.data || [];
      
      // Separate active and past polls
      const now = new Date();
      const active = allPolls.filter((poll: unknown) => 
        new Date(poll.ends_at) > now
      );
      const past = allPolls.filter((poll: unknown) => 
        new Date(poll.ends_at) <= now
      );

      setActivePolls(active);
      setPolls(past);
    } catch (error) { void error;
      console.error('Failed to fetch polls:', error);
      toast.error('Failed to load polls');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [streamId]);

  useEffect(() => {
    fetchPolls();
    
    // Refresh polls every 30 seconds
    const interval = setInterval(() => fetchPolls(false), 30000);
    return () => clearInterval(interval);
  }, [streamId, fetchPolls]);

  const handlePollCreated = (poll: unknown) => {
    setActivePolls([poll, ...activePolls]);
    setShowCreator(false);
    toast.success('Poll created successfully!');
  };

  const handleVote = async (pollId: string, optionId: string) => {
    // Update local state to reflect vote
    setActivePolls(prev => prev.map(poll => 
      poll.id === pollId ? { ...poll, user_voted: true, user_vote_option_id: optionId } : poll
    ));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Polls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Polls
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchPolls(false)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            {canCreate && (
              <Button
                size="sm"
                onClick={() => setShowCreator(!showCreator)}
              >
                {showCreator ? 'Cancel' : 'Create Poll'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showCreator && (
          <div className="mb-4">
            <PollCreator 
              streamId={streamId} 
              onPollCreated={handlePollCreated}
            />
          </div>
        )}

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active ({activePolls.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({polls.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {activePolls.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active polls
                </p>
              ) : (
                <div className="space-y-4">
                  {activePolls.map((poll) => (
                    <PollViewer
                      key={poll.id}
                      poll={poll}
                      onVote={handleVote}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {polls.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No past polls
                </p>
              ) : (
                <div className="space-y-4">
                  {polls.map((poll) => (
                    <PollViewer
                      key={poll.id}
                      poll={poll}
                      showResults={true}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
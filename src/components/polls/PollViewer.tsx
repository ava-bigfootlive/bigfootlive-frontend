import React, { useCallback, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Poll {
  id: string;
  question: string;
  type: string;
  options: Array<{
    id: string;
    text: string;
    vote_count?: number;
  }>;
  duration_seconds: number;
  created_at: string;
  ends_at: string;
  is_active: boolean;
  total_votes: number;
  user_voted: boolean;
  user_vote_option_id?: string;
  show_results_live: boolean;
  results?: Array<{
    option_id: string;
    option_text: string;
    votes: number;
    percentage: number;
  }>;
}

interface PollViewerProps {
  poll: Poll;
  onVote?: (pollId: string, optionId: string) => void;
  showResults?: boolean;
}

export function PollViewer({ poll, onVote, showResults = false }: PollViewerProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState(poll.user_voted);
  const [localResults, setLocalResults] = useState(poll.results);

  useEffect(() => {
    // Calculate time left
    const endTime = new Date(poll.ends_at).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0 && poll.is_active) {
        // Poll ended, fetch results
        fetchResults();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [poll.ends_at, poll.is_active, fetchResults]);

  const fetchResults = useCallback(async () => {
    try {
      const response = await api.get(`/polls/${poll.id}`);
      if (response.data.results) {
        setLocalResults(response.data.results);
      }
    } catch (error) {
      console.error('Failed to fetch poll results:', error);
    }
  }, [poll.id]);

  const handleVote = async () => {
    if (!selectedOption || hasVoted || !poll.is_active) return;

    setIsVoting(true);
    try {
      await api.post(`/polls/${poll.id}/vote`, {
        option_id: selectedOption
      });

      setHasVoted(true);
      toast.success('Vote submitted!');
      onVote?.(poll.id, selectedOption);

      // If showing results live, fetch updated results
      if (poll.show_results_live) {
        await fetchResults();
      }
    } catch (error: unknown) {
      console.error('Failed to vote:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to submit vote';
      toast.error(errorMessage || 'Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canShowResults = !poll.is_active || poll.show_results_live || showResults || hasVoted;
  const displayResults = canShowResults && localResults;

  const getTotalVotes = () => {
    if (displayResults) {
      return displayResults.reduce((sum, r) => sum + r.votes, 0);
    }
    return poll.total_votes || 0;
  };

  return (
    <Card className={cn(!poll.is_active && "opacity-75")}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{poll.question}</CardTitle>
          <div className="flex items-center gap-2">
            {poll.is_active ? (
              <Badge variant="default" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(timeLeft)}
              </Badge>
            ) : (
              <Badge variant="secondary">Ended</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {getTotalVotes()} votes
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {poll.options.map((option) => {
          const result = displayResults?.find(r => r.option_id === option.id);
          const isSelected = selectedOption === option.id || poll.user_vote_option_id === option.id;
          
          return (
            <div key={option.id} className="space-y-2">
              {!hasVoted && poll.is_active ? (
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedOption(option.id)}
                  disabled={isVoting}
                >
                  {option.text}
                </Button>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      {option.text}
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </span>
                    {result && (
                      <span className="text-sm text-muted-foreground">
                        {result.percentage}% ({result.votes})
                      </span>
                    )}
                  </div>
                  {result && (
                    <Progress value={result.percentage} className="h-2" />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {!hasVoted && poll.is_active && selectedOption && (
          <Button 
            onClick={handleVote} 
            disabled={isVoting}
            className="w-full"
          >
            {isVoting ? 'Submitting...' : 'Submit Vote'}
          </Button>
        )}

        {hasVoted && poll.is_active && !poll.show_results_live && (
          <p className="text-sm text-muted-foreground text-center">
            Results will be shown when the poll ends
          </p>
        )}
      </CardContent>
    </Card>
  );
}
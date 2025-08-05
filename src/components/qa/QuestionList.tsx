import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, HelpCircle, History, RefreshCw, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { QuestionCard } from './QuestionCard';
import { QuestionForm } from './QuestionForm';
import { toast } from 'sonner';

interface QuestionListProps {
  streamId: string;
  canAsk?: boolean;
  canModerate?: boolean;
  canAnswer?: boolean;
  className?: string;
}

export function QuestionList({ 
  streamId, 
  canAsk = true, 
  canModerate = false, 
  canAnswer = false,
  className 
}: QuestionListProps) {
  const [questions, setQuestions] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState<unknown>(null);

  const fetchQuestions = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setRefreshing(true);
    }

    try {
      const params = new URLSearchParams({
        sort_by: sortBy,
        page: reset ? '1' : page.toString(),
        page_size: '20'
      });

      if (status !== 'all' && canModerate) {
        params.append('status', status);
      }

      const response = await api.get(`/qa/streams/${streamId}/questions?${params}`);
      
      if (reset) {
        setQuestions(response.data.questions);
      } else {
        setQuestions(prev => [...prev, ...response.data.questions]);
      }
      
      setHasMore(response.data.has_more);
      
      // Fetch stats
      const statsResponse = await api.get(`/qa/streams/${streamId}/qa/stats`);
      setStats(statsResponse.data);
    } catch (error) { void error;
      console.error('Failed to fetch questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [streamId, sortBy, page, canModerate, status]);

  useEffect(() => {
    fetchQuestions(true);
  }, [streamId, status, sortBy, fetchQuestions]);

  const handleQuestionSubmitted = (question: unknown) => {
    setQuestions([question, ...questions]);
    setShowForm(false);
    if (stats) {
      setStats({
        ...stats,
        total_questions: stats.total_questions + 1,
        pending_questions: stats.pending_questions + 1
      });
    }
  };

  const handleQuestionUpdate = (updatedQuestion: unknown) => {
    setQuestions(prev => prev.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    ));
  };

  const handleQuestionDelete = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    fetchQuestions(false);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Q&A</CardTitle>
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
            <HelpCircle className="h-5 w-5" />
            Q&A
            {stats && (
              <span className="text-sm font-normal text-muted-foreground">
                ({stats.total_questions} questions)
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchQuestions(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            {canAsk && (
              <Button
                size="sm"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancel' : 'Ask Question'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-4">
            <QuestionForm 
              streamId={streamId} 
              onQuestionSubmitted={handleQuestionSubmitted}
            />
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.answered_questions}</div>
              <div className="text-xs text-muted-foreground">Answered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.pending_questions}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {stats.average_response_time ? `${Math.round(stats.average_response_time)}m` : '-'}
              </div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {canModerate && (
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Questions</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="answered">Answered</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Newest
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Oldest
                  </div>
                </SelectItem>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Popular
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[500px] pr-4">
            {questions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No questions yet. Be the first to ask!
              </p>
            ) : (
              <div className="space-y-3">
                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    canModerate={canModerate}
                    canAnswer={canAnswer}
                    onUpdate={handleQuestionUpdate}
                    onDelete={handleQuestionDelete}
                  />
                ))}
                
                {hasMore && (
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={refreshing}
                    className="w-full"
                  >
                    {refreshing ? 'Loading...' : 'Load More'}
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
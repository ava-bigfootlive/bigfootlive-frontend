import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, ChevronDown, ChevronUp, EyeOff, MessageSquare, MoreVertical, Pin, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  text: string;
  status: 'pending' | 'approved' | 'answered' | 'rejected' | 'hidden';
  asked_at: string;
  upvotes: number;
  is_pinned: boolean;
  is_anonymous: boolean;
  asker?: {
    id: string;
    name: string;
    avatar?: string;
  };
  answer?: {
    id: string;
    text: string;
    created_at: string;
  };
  answered_at?: string;
  answerer?: {
    id: string;
    name: string;
    avatar?: string;
  };
  user_vote?: number;
}

interface QuestionCardProps {
  question: Question;
  canModerate?: boolean;
  canAnswer?: boolean;
  onUpdate?: (question: Question) => void;
  onDelete?: (questionId: string) => void;
}

export function QuestionCard({ 
  question, 
  canModerate = false, 
  canAnswer = false,
  onUpdate,
  onDelete 
}: QuestionCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [localVote, setLocalVote] = useState(question.user_vote || 0);
  const [localUpvotes, setLocalUpvotes] = useState(question.upvotes);

  const handleVote = async (vote: number) => {
    if (isVoting) return;

    const newVote = localVote === vote ? 0 : vote;
    const voteDiff = newVote - localVote;

    setIsVoting(true);
    setLocalVote(newVote);
    setLocalUpvotes(localUpvotes + voteDiff);

    try {
      const response = await api.post(`/qa/questions/${question.id}/vote`, {
        vote: newVote
      });

      setLocalUpvotes(response.data.upvotes);
    } catch {
      // Revert on error
      setLocalVote(question.user_vote || 0);
      setLocalUpvotes(question.upvotes);
      toast.error('Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleModerate = async (action: 'approve' | 'reject' | 'hide') => {
    try {
      await api.post(`/qa/questions/${question.id}/moderate`, { action });
      toast.success(`Question ${action}d`);
      onUpdate?.({ ...question, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'hidden' });
    } catch {
      toast.error(`Failed to ${action} question`);
    }
  };

  const handlePin = async () => {
    try {
      await api.put(`/qa/questions/${question.id}`, {
        is_pinned: !question.is_pinned
      });
      toast.success(question.is_pinned ? 'Question unpinned' : 'Question pinned');
      onUpdate?.({ ...question, is_pinned: !question.is_pinned });
    } catch {
      toast.error('Failed to update pin status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await api.delete(`/qa/questions/${question.id}`);
      toast.success('Question deleted');
      onDelete?.(question.id);
    } catch {
      toast.error('Failed to delete question');
    }
  };

  const getStatusBadge = () => {
    switch (question.status) {
      case 'answered':
        return <Badge variant="default" className="text-xs">Answered</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="text-xs">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
      case 'hidden':
        return <Badge variant="outline" className="text-xs">Hidden</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className={cn(
      "transition-all",
      question.is_pinned && "border-primary",
      question.status === 'answered' && "bg-accent/5"
    )}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                localVote === 1 && "text-primary"
              )}
              onClick={() => handleVote(1)}
              disabled={isVoting}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{localUpvotes}</span>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                localVote === -1 && "text-destructive"
              )}
              onClick={() => handleVote(-1)}
              disabled={isVoting}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Question content */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {question.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                  {getStatusBadge()}
                </div>
                <p className="text-sm font-medium">{question.text}</p>
              </div>

              {(canModerate || canAnswer) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canAnswer && question.status !== 'answered' && (
                      <>
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Answer Question
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {canModerate && (
                      <>
                        <DropdownMenuItem onClick={handlePin}>
                          <Pin className="h-4 w-4 mr-2" />
                          {question.is_pinned ? 'Unpin' : 'Pin'} Question
                        </DropdownMenuItem>
                        {question.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleModerate('approve')}>
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleModerate('reject')}>
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => handleModerate('hide')}>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Answer */}
            {question.answer && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="text-sm">{question.answer.text}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {question.answerer && (
                    <>
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={question.answerer.avatar} />
                        <AvatarFallback>{question.answerer.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{question.answerer.name}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>Answered {formatDistanceToNow(new Date(question.answer.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {!question.is_anonymous && question.asker ? (
                <>
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={question.asker.avatar} />
                    <AvatarFallback>{question.asker.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{question.asker.name}</span>
                </>
              ) : (
                <span>Anonymous</span>
              )}
              <span>•</span>
              <span>{formatDistanceToNow(new Date(question.asked_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
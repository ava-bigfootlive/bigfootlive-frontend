import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { HelpCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface QuestionFormProps {
  streamId: string;
  onQuestionSubmitted?: (question: unknown) => void;
}

export function QuestionForm({ streamId, onQuestionSubmitted }: QuestionFormProps) {
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim() || text.trim().length < 10) {
      toast.error('Question must be at least 10 characters long');
      return;
    }

    if (text.length > 500) {
      toast.error('Question must be less than 500 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/qa/questions', {
        stream_id: streamId,
        text: text.trim(),
        is_anonymous: isAnonymous
      });

      toast.success('Question submitted successfully!');
      onQuestionSubmitted?.(response.data);
      
      // Reset form
      setText('');
      setIsAnonymous(false);
    } catch (error) { void error;
      console.error('Failed to submit question:', error);
      toast.error('Failed to submit question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Ask a Question
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="What would you like to know?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px]"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {text.length}/500 characters
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <Label htmlFor="anonymous" className="text-sm cursor-pointer">
                Ask anonymously
              </Label>
            </div>

            <Button type="submit" disabled={isSubmitting || !text.trim()}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Question'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Plus, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Poll {
  id: string;
  question: string;
  type: string;
  options: Array<{ id: string; text: string; vote_count: number }>;
  is_active: boolean;
  ends_at: string;
  total_votes: number;
}

interface PollCreatorProps {
  streamId: string;
  onPollCreated?: (poll: Poll) => void;
}

export function PollCreator({ streamId, onPollCreated }: PollCreatorProps) {
  const [question, setQuestion] = useState('');
  const [type, setType] = useState('single_choice');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    // Validate
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    setIsCreating(true);
    try {
      const response = await api.post('/polls', {
        stream_id: streamId,
        question: question.trim(),
        type,
        options: validOptions,
        duration_seconds: duration,
        allow_multiple_votes: allowMultiple,
        show_results_live: showResults
      });

      toast.success('Poll created successfully!');
      onPollCreated?.(response.data);
      
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setDuration(60);
      setAllowMultiple(false);
      setShowResults(true);
    } catch (error) { void error;
      console.error('Failed to create poll:', error);
      toast.error('Failed to create poll');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Poll</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question">Question</Label>
          <Textarea
            id="question"
            placeholder="What would you like to ask your audience?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Poll Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single_choice">Single Choice</SelectItem>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="yes_no">Yes/No</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Options</Label>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
              />
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {options.length < 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration: {duration} seconds</Label>
          <Slider
            id="duration"
            min={10}
            max={300}
            step={10}
            value={[duration]}
            onValueChange={(value) => setDuration(value[0])}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-multiple">Allow multiple votes</Label>
            <Switch
              id="allow-multiple"
              checked={allowMultiple}
              onCheckedChange={setAllowMultiple}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-results">Show results live</Label>
            <Switch
              id="show-results"
              checked={showResults}
              onCheckedChange={setShowResults}
            />
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isCreating}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {isCreating ? 'Creating...' : 'Create Poll'}
        </Button>
      </CardContent>
    </Card>
  );
}
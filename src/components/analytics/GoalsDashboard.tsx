import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import type { AnalyticsGoals } from '@/types/analytics';

const goalFormSchema = z.object({
  monthlyViewers: z.number().min(0, 'Must be a positive number'),
  monthlyRevenue: z.number().min(0, 'Must be a positive number'),
  avgWatchTime: z.number().min(0, 'Must be a positive number'),
});

interface GoalsDashboardProps {
  channelId: string;
}

export const GoalsDashboard: React.FC<GoalsDashboardProps> = React.memo(({ channelId }) => {
  const [goals, setGoals] = useState<AnalyticsGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      monthlyViewers: 0,
      monthlyRevenue: 0,
      avgWatchTime: 0,
    },
  });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const data = await analyticsService.getAnalyticsGoals(channelId);
        setGoals(data);
        form.reset(data);
      } catch (e) {
        setError('Failed to load goals.');
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, [channelId, form]);

  const onSubmit = useCallback(async (values: z.infer<typeof goalFormSchema>) => {
    try {
      const updatedGoals = await analyticsService.updateAnalyticsGoals(channelId, values);
      setGoals(updatedGoals);
    } catch (e) {
      setError('Failed to update goals.');
    }
  }, [channelId]);

  if (loading) return <div>Loading goals...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Track Your Goals</CardTitle>
            <CardDescription>Monitor your progress towards your streaming goals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Monthly Viewers Goal */}
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium">Monthly Viewers</p>
                    <Badge variant="secondary">{`${(goals?.progress.viewers || 0).toFixed(1)}%`}</Badge>
                  </div>
                  <Progress value={goals?.progress.viewers} />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{goals?.current.monthlyViewers.toLocaleString()}</span>
                    <span>Goal: {goals?.monthlyViewers.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Monthly Revenue Goal */}
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium">Monthly Revenue</p>
                    <Badge variant="secondary">{`${(goals?.progress.revenue || 0).toFixed(1)}%`}</Badge>
                  </div>
                  <Progress value={goals?.progress.revenue} />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>${goals?.current.monthlyRevenue.toLocaleString()}</span>
                    <span>Goal: ${goals?.monthlyRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Avg. Watch Time Goal */}
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium">Avg. Watch Time (minutes)</p>
                    <Badge variant="secondary">{`${(goals?.progress.watchTime || 0).toFixed(1)}%`}</Badge>
                  </div>
                  <Progress value={goals?.progress.watchTime} />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{goals?.current.avgWatchTime} min</span>
                    <span>Goal: {goals?.avgWatchTime} min</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Set Your Goals</CardTitle>
            <CardDescription>Update your monthly streaming goals.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="monthlyViewers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Viewers</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Revenue ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avgWatchTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avg. Watch Time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Save Goals</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

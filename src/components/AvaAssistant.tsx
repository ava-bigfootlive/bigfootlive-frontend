import { useCallback, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertCircle, BarChart3, Brain, CheckCircle2 as CheckCircle, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
// import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

interface Prediction {
  expected_viewers: number;
  peak_viewers: number;
  confidence: number;
}

interface Recommendation {
  container_size: string;
  estimated_cost: string;
  pre_scale_regions: string[];
}

interface Optimization {
  action: string;
  priority: string;
  impact: string;
  description: string;
  can_automate: boolean;
}

interface AvaAssistantProps {
  streamId?: string;
  isLive?: boolean;
}

export function AvaAssistant({ streamId, isLive }: AvaAssistantProps) {
  // const { user } = useAuthStore(); // Currently unused
  const [, setPredictionsLoading] = useState(false);
  const [, setOptimizationsLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);
  const [insights, setInsights] = useState<Record<string, unknown> | null>(null);
  const [reasoning, setReasoning] = useState<string[]>([]);

  // Fetch predictions for upcoming stream
  const fetchPredictions = useCallback(async () => {
    if (!streamId || isLive) return;

    setPredictionsLoading(true);
    try {
      const response = await api.post(
        `/ava/predict/${streamId}`,
        {
          scheduled_time: new Date().toISOString(),
          promoted: false,
          category: 'gaming'}
      );

      setPredictions(response.data.predictions);
      setRecommendations(response.data.recommendations);
      setReasoning(response.data.reasoning);
      setInsights(response.data.insights);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    } finally {
      setPredictionsLoading(false);
    }
  }, [streamId, isLive]);

  // Fetch optimizations for live stream
  const fetchOptimizations = useCallback(async () => {
    if (!streamId || !isLive) return;

    setOptimizationsLoading(true);
    try {
      const response = await api.post(
        `/ava/optimize/${streamId}`,
        {}
      );

      setOptimizations(response.data.optimizations);
    } catch (error) {
      console.error('Failed to fetch optimizations:', error);
    } finally {
      setOptimizationsLoading(false);
    }
  }, [streamId, isLive]);

  useEffect(() => {
    if (streamId) {
      if (isLive) {
        fetchOptimizations();
        // Refresh every 30 seconds
        const interval = setInterval(fetchOptimizations, 30000);
        return () => clearInterval(interval);
      } else {
        fetchPredictions();
      }
    }
  }, [streamId, isLive, fetchOptimizations, fetchPredictions]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (!streamId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Ava AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select a stream to see AI-powered insights and recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Ava AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={isLive ? 'optimize' : 'predict'}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predict" disabled={isLive}>
              Predictions
            </TabsTrigger>
            <TabsTrigger value="optimize" disabled={!isLive}>
              Live Optimization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predict" className="space-y-4">
            {predictions && recommendations && (
              <>
                {/* Predictions */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Expected Viewers
                          </span>
                        </div>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold">
                        {predictions.expected_viewers.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Peak: {predictions.peak_viewers.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Confidence
                          </span>
                        </div>
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-2xl font-bold">
                        {(predictions.confidence * 100).toFixed(0)}%
                      </p>
                      <Progress
                        value={predictions.confidence * 100}
                        className="mt-2"
                      />
                      <p className="text-sm text-muted-foreground">
                        {getConfidenceLabel(predictions.confidence)} confidence
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Container Size</span>
                      <span className="font-medium">
                        {recommendations.container_size.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Estimated Cost</span>
                      <span className="font-medium text-green-600">
                        {recommendations.estimated_cost}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm">Pre-scale Regions</span>
                      <div className="mt-1 flex gap-2">
                        {recommendations.pre_scale_regions.map((region) => (
                          <span
                            key={region}
                            className="rounded-full bg-primary/10 px-2 py-1 text-xs"
                          >
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reasoning */}
                {reasoning.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">AI Reasoning</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {reasoning.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                            <span className="text-sm">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Insights */}
                {insights && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Best Time:</strong> {insights.best_time_to_start}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="optimize" className="space-y-4">
            {optimizations.length > 0 ? (
              optimizations.map((opt, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          <span className="font-medium">{opt.action}</span>
                          <span
                            className={`text-xs font-medium ${getPriorityColor(
                              opt.priority
                            )}`}
                          >
                            {opt.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {opt.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-600">{opt.impact}</span>
                          {opt.can_automate && (
                            <span className="text-primary">
                              Can be automated
                            </span>
                          )}
                        </div>
                      </div>
                      {opt.can_automate && (
                        <Button size="sm" variant="outline">
                          Enable
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your stream is running optimally. No actions needed.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
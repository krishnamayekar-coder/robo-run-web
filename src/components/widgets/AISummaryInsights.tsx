import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ChevronRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AISummaryInsightsProps {
  isPersonal?: boolean;
}

export function AISummaryInsights({ isPersonal = false }: AISummaryInsightsProps) {
  const insights: Array<{ type: string; icon: any; text: string }> = [];
  const recommendations: Array<{ title: string; impact: string; description: string }> = [];

  const impactColors = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    low: "bg-success/10 text-success border-success/20",
  };

  return (
    <div className="widget animate-fade-in stagger-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="widget-title mb-0">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Summary & Insights
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] gap-1.5 bg-primary/5">
            <Zap className="h-3 w-3 text-primary" />
            Confidence: 94%
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        {/* Key Insights */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Insights</span>
          <div className="space-y-2">
            {insights.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">
                AI insights not available
              </div>
            ) : (
              insights.map((insight, index) => {
              const Icon = insight.icon;
              const bgColor = insight.type === "positive" 
                ? "bg-success/5 border-success/20" 
                : insight.type === "warning" 
                ? "bg-warning/5 border-warning/20" 
                : "bg-primary/5 border-primary/20";
              const iconColor = insight.type === "positive" 
                ? "text-success" 
                : insight.type === "warning" 
                ? "text-warning" 
                : "text-primary";

              return (
              <div 
                key={index} 
                className={`flex items-start gap-3 p-3 rounded-lg glass-card border ${bgColor} transition-all hover:shadow-sm cursor-pointer`}
              >
                  <Icon className={`h-4 w-4 mt-0.5 ${iconColor}`} />
                  <span className="text-sm text-foreground">{insight.text}</span>
                </div>
              );
            }))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">AI Recommendations</span>
          <div className="space-y-2">
            {recommendations.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">
                No recommendations available
              </div>
            ) : (
              recommendations.map((rec, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg glass-card transition-colors cursor-pointer group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{rec.title}</span>
                    <Badge variant="outline" className={`text-[10px] ${impactColors[rec.impact as keyof typeof impactColors]}`}>
                      {rec.impact} impact
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{rec.description}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            )))}
          </div>
        </div>

        {/* Predictive Analysis */}
        <div className="p-4 rounded-lg glass-card border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Sprint Prediction</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion Probability</span>
              <span className="font-medium text-success">87%</span>
            </div>
            <Progress value={87} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Based on current velocity and remaining work, the sprint is likely to complete on time with 87% confidence.
            </p>
          </div>
        </div>

        <Button variant="outline" className="w-full text-sm gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Detailed Report
        </Button>
      </div>
    </div>
  );
}

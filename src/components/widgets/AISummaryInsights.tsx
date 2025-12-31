import { useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetAISummaryQuery } from "@/store/api";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AISummaryInsightsProps {
  isPersonal?: boolean;
}

export function AISummaryInsights({ isPersonal = false }: AISummaryInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: aiSummaryData, isLoading } = useGetAISummaryQuery();
  
  const insights = (aiSummaryData?.summary || []).map((text, index) => {
    const cleanText = text.trim().replace(/^\.\s*/, '');
    let type = "info";
    let icon = TrendingUp;
    
    if (cleanText.toLowerCase().includes("risk") || cleanText.toLowerCase().includes("stale") || cleanText.toLowerCase().includes("blocker") || cleanText.toLowerCase().includes("backlog")) {
      type = "warning";
      icon = AlertTriangle;
    } else if (cleanText.toLowerCase().includes("success") || cleanText.toLowerCase().includes("improved") || cleanText.toLowerCase().includes("good")) {
      type = "positive";
      icon = TrendingUp;
    } else {
      type = "info";
      icon = Lightbulb;
    }
    
    return { type, icon, text: cleanText };
  });
  
  const recommendations = aiSummaryData?.recommendations || [];

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
            Confidence: {aiSummaryData?.confidence || 0}%
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded ? (
        <div className="space-y-6">
          {/* Key Insights */}
          <div className="space-y-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Insights</span>
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-sm text-muted-foreground p-3 text-center">
                  Loading AI insights...
                </div>
              ) : insights.length === 0 ? (
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
              {isLoading ? (
                <div className="text-sm text-muted-foreground p-3 text-center">
                  Loading recommendations...
                </div>
              ) : recommendations.length === 0 ? (
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
                    <span className="text-xs text-muted-foreground">{rec.text}</span>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-6 pr-4">
            {/* Key Insights */}
            <div className="space-y-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Insights</span>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground p-3 text-center">
                    Loading AI insights...
                  </div>
                ) : insights.length === 0 ? (
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
                {isLoading ? (
                  <div className="text-sm text-muted-foreground p-3 text-center">
                    Loading recommendations...
                  </div>
                ) : recommendations.length === 0 ? (
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
                      <span className="text-xs text-muted-foreground">{rec.text}</span>
                    </div>
                  </div>
                )))}
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

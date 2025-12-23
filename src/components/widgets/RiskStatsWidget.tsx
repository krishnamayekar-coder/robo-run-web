import { AlertCircle, Clock, Flame, GitPullRequest, TrendingUp, TrendingDown } from "lucide-react";
import { useGetPRBottlenecksQuery, useGetTeamInsightsQuery } from "@/store/api";

interface RiskCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  severity: "critical" | "high" | "medium" | "low";
  trend: "up" | "down";
  trendValue: number;
}

function RiskCard({ icon, label, value, severity, trend, trendValue }: RiskCardProps) {
  const severityClasses = {
    critical: "bg-destructive/10 border-destructive/20 text-destructive",
    high: "bg-warning/10 border-warning/20 text-warning",
    medium: "bg-primary/10 border-primary/20 text-primary",
    low: "bg-success/10 border-success/20 text-success",
  };

  const iconBgClasses = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-warning text-warning-foreground",
    medium: "bg-primary text-primary-foreground",
    low: "bg-success text-success-foreground",
  };

  return (
    <div className={`metric-card border ${severityClasses[severity]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${iconBgClasses[severity]}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'down' ? 'text-success' : 'text-destructive'}`}>
          {trend === 'down' ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
          <span>{trendValue}%</span>
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label mt-1">{label}</div>
    </div>
  );
}

interface RiskStatsWidgetProps {
  isPersonal?: boolean;
}

export function RiskStatsWidget({ isPersonal = false }: RiskStatsWidgetProps) {
  const { data: bottlenecksData, isLoading: bottlenecksLoading } = useGetPRBottlenecksQuery();
  const { data: teamInsights, isLoading: insightsLoading } = useGetTeamInsightsQuery();

  const isLoading = bottlenecksLoading || insightsLoading;

  const openBottlenecks = bottlenecksData?.bottlenecks?.filter(pr => pr.state === "open") || [];
  const criticalBottlenecks = openBottlenecks.filter(pr => pr.idle_days >= 7).length;
  const highBottlenecks = openBottlenecks.filter(pr => pr.idle_days >= 3 && pr.idle_days < 7).length;
  const totalStuckPRs = openBottlenecks.length;
  const highPriorityInactive = teamInsights?.team_metrics_summary?.high_priority_inactive?.count || 0;

  const riskData: Array<{
    icon: React.ReactNode;
    label: string;
    value: number;
    severity: "critical" | "high" | "medium" | "low";
    trend: "up" | "down";
    trendValue: number;
  }> = [
    {
      icon: <GitPullRequest className="h-4 w-4" />,
      label: "PRs Stuck",
      value: totalStuckPRs,
      severity: totalStuckPRs >= 5 ? "critical" : totalStuckPRs >= 3 ? "high" : totalStuckPRs > 0 ? "medium" : "low",
      trend: totalStuckPRs > 0 ? "up" : "down",
      trendValue: totalStuckPRs > 0 ? 10 : 0,
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: "Critical PRs (>7 days)",
      value: criticalBottlenecks,
      severity: criticalBottlenecks > 0 ? "critical" : "low",
      trend: criticalBottlenecks > 0 ? "up" : "down",
      trendValue: criticalBottlenecks > 0 ? 15 : 0,
    },
    {
      icon: <AlertCircle className="h-4 w-4" />,
      label: "High Priority Inactive",
      value: highPriorityInactive,
      severity: highPriorityInactive >= 5 ? "critical" : highPriorityInactive >= 2 ? "high" : highPriorityInactive > 0 ? "medium" : "low",
      trend: highPriorityInactive > 0 ? "up" : "down",
      trendValue: highPriorityInactive > 0 ? 8 : 0,
    },
    {
      icon: <Flame className="h-4 w-4" />,
      label: "High Risk PRs (3-7 days)",
      value: highBottlenecks,
      severity: highBottlenecks > 0 ? "high" : "low",
      trend: highBottlenecks > 0 ? "up" : "down",
      trendValue: highBottlenecks > 0 ? 12 : 0,
    },
  ];

  return (
    <div className="widget animate-fade-in stagger-2">
      <h2 className="widget-title">
        <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse-subtle" />
        {isPersonal ? "My Risk Stats" : "Risk Stats Overview"}
      </h2>
      {isLoading ? (
        <div className="text-sm text-muted-foreground p-3 text-center">
          Loading risk statistics...
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {riskData.map((risk, index) => (
            <RiskCard key={index} {...risk} />
          ))}
        </div>
      )}
    </div>
  );
}

import { AlertCircle, Clock, Flame, GitPullRequest, TrendingUp, TrendingDown } from "lucide-react";
import { useGetPRBottlenecksQuery, useGetTeamInsightsQuery, useGetSprintProgressQuery } from "@/store/api";
import { useMemo } from "react";

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
  // Get sprint progress to find active sprint
  const { data: sprintProgressData } = useGetSprintProgressQuery();
  
  // Extract active sprint_id
  const activeSprintId = useMemo(() => {
    if (sprintProgressData?.sprints) {
      const activeSprint = sprintProgressData.sprints.find(sprint => sprint.state === "active");
      return activeSprint?.sprint_id;
    }
    return undefined;
  }, [sprintProgressData]);
  
  const { data: bottlenecksData, isLoading: bottlenecksLoading } = useGetPRBottlenecksQuery();
  
  // Only call insights API if we have sprint_id
  const { data: teamInsights, isLoading: insightsLoading } = useGetTeamInsightsQuery(
    activeSprintId ? { sprint_id: activeSprintId } : { sprint_id: 0 },
    {
      skip: !activeSprintId,
    }
  );

  const isLoading = bottlenecksLoading || insightsLoading;

  const allBottlenecks = bottlenecksData?.bottlenecks || [];
  
  const openBottlenecks = allBottlenecks.filter(pr => {
    const state = pr.state?.toLowerCase();
    return state === "open" || state === "draft";
  });
  
  const prsStuck = openBottlenecks.filter(pr => pr.idle_days > 0).length;
  
  const criticalIncidents = openBottlenecks.filter(pr => pr.idle_days >= 7).length;
  
  const highPriorityPastDue = teamInsights?.team_metrics_summary?.high_priority_inactive?.count || 0;
  
  const atRiskJira = teamInsights?.pending_vs_completed?.pending || 0;
  
  const riskStatsOverview = prsStuck + criticalIncidents + highPriorityPastDue + atRiskJira;
  
  const calculateTrendPercent = (value: number, maxRange: number) => {
    if (maxRange === 0) return 0;
    return Math.min(Math.round((value / maxRange) * 100), 100);
  };

  const riskData: Array<{
    icon: React.ReactNode;
    label: string;
    value: number;
    severity: "critical" | "high" | "medium" | "low";
    trend: "up" | "down";
    trendValue: number;
  }> = [
    {
      icon: <AlertCircle className="h-4 w-4" />,
      label: "Risk Stats Overview",
      value: riskStatsOverview,
      severity: riskStatsOverview >= 20 ? "critical" : riskStatsOverview >= 10 ? "high" : riskStatsOverview > 0 ? "medium" : "low",
      trend: riskStatsOverview > 0 ? "up" : "down",
      trendValue: calculateTrendPercent(riskStatsOverview, 150),
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: "At-Risk Jira",
      value: atRiskJira,
      severity: atRiskJira >= 50 ? "critical" : atRiskJira >= 20 ? "high" : atRiskJira > 0 ? "medium" : "low",
      trend: atRiskJira > 0 ? "up" : "down",
      trendValue: calculateTrendPercent(atRiskJira, 50),
    },
    {
      icon: <Flame className="h-4 w-4" />,
      label: "High Priority – Past Due",
      value: highPriorityPastDue,
      severity: highPriorityPastDue >= 5 ? "critical" : highPriorityPastDue >= 2 ? "high" : highPriorityPastDue > 0 ? "medium" : "low",
      trend: highPriorityPastDue > 0 ? "up" : "down",
      trendValue: calculateTrendPercent(highPriorityPastDue, 6),
    },
    {
      icon: <GitPullRequest className="h-4 w-4" />,
      label: "PRs Stuck",
      value: prsStuck,
      severity: prsStuck >= 5 ? "critical" : prsStuck >= 3 ? "high" : prsStuck > 0 ? "medium" : "low",
      trend: prsStuck > 0 ? "up" : "down",
      trendValue: calculateTrendPercent(prsStuck, 25),
    },
    {
      icon: <GitPullRequest className="h-4 w-4" />,
      label: "Critical Incidents",
      value: criticalIncidents,
      severity: criticalIncidents >= 5 ? "critical" : criticalIncidents >= 2 ? "high" : criticalIncidents > 0 ? "medium" : "low",
      trend: criticalIncidents > 0 ? "up" : "down",
      trendValue: calculateTrendPercent(criticalIncidents, 60),
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {riskData.map((risk, index) => (
            <RiskCard key={index} {...risk} />
          ))}
        </div>
      )}
    </div>
  );
}

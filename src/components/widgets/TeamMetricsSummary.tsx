import { TicketCheck, GitPullRequest, GitCommit, AlertTriangle, AlertOctagon, TrendingUp, TrendingDown } from "lucide-react";
import { useGetTeamInsightsQuery, useGetGitRecentQuery, useGetSprintProgressQuery } from "@/store/api";
import { useMemo } from "react";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  colorClass: string;
}

function MetricCard({ icon, label, value, change, changeLabel, colorClass }: MetricCardProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="metric-card group">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colorClass} transition-transform group-hover:scale-105`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'trend-up' : 'trend-down'}`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{isPositive ? '+' : ''}{change}%</span>
        </div>
      </div>
      <div className="stat-value text-foreground">{value}</div>
      <div className="stat-label mt-1">{label}</div>
      <div className="text-[10px] text-muted-foreground mt-2">{changeLabel}</div>
    </div>
  );
}

function parseDeltaPercent(deltaStr: string | null | undefined): number {
  if (!deltaStr || typeof deltaStr !== 'string') {
    return 0;
  }
  const match = deltaStr.match(/[+-]?(\d+\.?\d*)/);
  return match ? parseFloat(match[0]) : 0;
}

interface TeamMetricsSummaryProps {
  isPersonal?: boolean;
}

export function TeamMetricsSummary({ isPersonal = false }: TeamMetricsSummaryProps) {
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
  
  // Only call insights API if we have sprint_id
  const { data: teamInsights, isLoading: insightsLoading } = useGetTeamInsightsQuery(
    activeSprintId ? { sprint_id: activeSprintId } : { sprint_id: 0 },
    {
      skip: !activeSprintId,
    }
  );
  const { data: gitData, isLoading: gitLoading } = useGetGitRecentQuery();

  const isLoading = insightsLoading || gitLoading;

  const prefix = isPersonal ? "My " : "Total ";
  
  const commitsCount = gitData?.recent_commits?.length || 0;
  const prsCount = gitData?.recent_pull_requests?.length || 0;
  const combinedCommitsPRsDelta = teamInsights?.team_metrics_summary?.commits_prs?.delta_percent
    ? parseDeltaPercent(teamInsights.team_metrics_summary.commits_prs.delta_percent)
    : 0;
  const combinedCommitsPRsComparison = teamInsights?.team_metrics_summary?.commits_prs?.comparison || "vs last sprint";
  
  const metrics = teamInsights?.team_metrics_summary ? [
    {
      icon: <TicketCheck className="h-5 w-5 text-primary" />,
      label: `${prefix}Jira Tickets`,
      value: teamInsights.team_metrics_summary.total_jira_tickets.count,
      change: parseDeltaPercent(teamInsights.team_metrics_summary.total_jira_tickets.delta_percent),
      changeLabel: teamInsights.team_metrics_summary.total_jira_tickets.comparison || "vs last sprint",
      colorClass: "bg-primary/10",
    },
    {
      icon: <GitCommit className="h-5 w-5 text-success" />,
      label: `${prefix}Commits`,
      value: commitsCount,
      change: combinedCommitsPRsDelta,
      changeLabel: combinedCommitsPRsComparison,
      colorClass: "bg-success/10",
    },
    {
      icon: <GitPullRequest className="h-5 w-5 text-primary" />,
      label: `${prefix}Pull Requests`,
      value: prsCount,
      change: combinedCommitsPRsDelta,
      changeLabel: combinedCommitsPRsComparison,
      colorClass: "bg-primary/10",
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-warning" />,
      label: "High Priority Inactive",
      value: teamInsights.team_metrics_summary.high_priority_inactive.count,
      change: parseDeltaPercent(teamInsights.team_metrics_summary.high_priority_inactive.delta_percent),
      changeLabel: teamInsights.team_metrics_summary.high_priority_inactive.comparison || "vs last sprint",
      colorClass: "bg-warning/10",
    },
    {
      icon: <AlertOctagon className="h-5 w-5 text-destructive" />,
      label: `${prefix}Incidents`,
      value: 0,
      change: 0,
      changeLabel: "vs last sprint",
      colorClass: "bg-destructive/10",
    },
  ] : [];

  return (
    <div className="widget animate-fade-in">
      <h2 className="widget-title">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-subtle" />
        {isPersonal ? "My Metrics Summary" : "Team Metrics Summary"}
      </h2>
      {isLoading ? (
        <div className="text-sm text-muted-foreground p-3">Loading metrics...</div>
      ) : metrics.length === 0 ? (
        <div className="text-sm text-muted-foreground p-3">No metrics available</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      )}
    </div>
  );
}

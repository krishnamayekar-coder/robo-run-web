import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WeeklyAnalyticsChartProps {
  isPersonal?: boolean;
}

import { useGetGitRecentQuery } from "@/store/api";
import { useMemo } from "react";

export function WeeklyAnalyticsChart({ isPersonal = false }: WeeklyAnalyticsChartProps) {
  const { data: gitData, isLoading } = useGetGitRecentQuery();

  const data = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayData = days.map((day) => ({ day, commits: 0, prs: 0 }));

    if (gitData?.recent_commits) {
      gitData.recent_commits.forEach((commit) => {
        const date = new Date(commit.timestamp);
        const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
        if (dayIndex >= 0 && dayIndex < 7) {
          dayData[dayIndex].commits += 1;
        }
      });
    }

    if (gitData?.recent_pull_requests) {
      gitData.recent_pull_requests.forEach((pr) => {
        const date = new Date(pr.timestamp);
        const dayIndex = (date.getDay() + 6) % 7;
        if (dayIndex >= 0 && dayIndex < 7) {
          dayData[dayIndex].prs += 1;
        }
      });
    }

    return dayData;
  }, [gitData]);

  const totalCommits = data.reduce((sum, d) => sum + d.commits, 0);
  const totalPRs = data.reduce((sum, d) => sum + d.prs, 0);
  const peakDay = data.reduce((max, d) => (d.commits > max.commits ? d : max), data[0]);

  return (
    <div className="widget animate-fade-in stagger-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="widget-title mb-0">
          <Calendar className="h-4 w-4 text-primary" />
          {isPersonal ? "My Weekly Activity" : "Weekly Commit & PR Analytics"}
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Commits: {totalCommits}
          </Badge>
          <Badge variant="outline" className="text-[10px] gap-1">
            <span className="w-2 h-2 rounded-full bg-success" />
            PRs: {totalPRs}
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground p-3 text-center h-64 flex items-center justify-center">
          Loading analytics...
        </div>
      ) : (
        <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 12 }} 
              className="fill-muted-foreground"
              axisLine={{ className: "stroke-border" }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              className="fill-muted-foreground"
              axisLine={{ className: "stroke-border" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "10px" }}
              formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="commits"
              name="Commits"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
            />
            <Line
              type="monotone"
              dataKey="prs"
              name="Pull Requests"
              stroke="hsl(var(--success))"
              strokeWidth={2.5}
              dot={{ fill: "hsl(var(--success))", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: "hsl(var(--success))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      )}

      {!isLoading && (
        <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-center gap-3">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-xs text-muted-foreground">
            Peak productivity on <span className="font-medium text-foreground">{peakDay.day}</span> with {peakDay.commits} commits.
            {!isPersonal && " Team activity based on recent commits and PRs."}
          </span>
        </div>
      )}
    </div>
  );
}

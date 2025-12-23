import { Progress } from "@/components/ui/progress";
import { Calendar, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { useGetSprintProgressQuery } from "@/store/api";

interface SprintProgressProps {
  isPersonal?: boolean;
}

export function SprintProgress({ isPersonal = false }: SprintProgressProps) {
  const { data: sprintData, isLoading } = useGetSprintProgressQuery();

  const activeSprint = sprintData?.sprints?.find((s) => s.state === "active") || sprintData?.sprints?.[0];

  if (isLoading) {
    return (
      <div className="widget animate-fade-in stagger-3">
        <h2 className="widget-title">
          <Target className="h-4 w-4 text-primary" />
          {isPersonal ? "My Sprint Progress" : "Sprint Progress"}
        </h2>
        <div className="text-sm text-muted-foreground p-3">Loading sprint data...</div>
      </div>
    );
  }

  if (!activeSprint) {
    return (
      <div className="widget animate-fade-in stagger-3">
        <h2 className="widget-title">
          <Target className="h-4 w-4 text-primary" />
          {isPersonal ? "My Sprint Progress" : "Sprint Progress"}
        </h2>
        <div className="text-sm text-muted-foreground p-3">No active sprint</div>
      </div>
    );
  }

  const progressPercent = activeSprint.progress_percent ?? 0;
  const daysRemaining = activeSprint.days_remaining ?? 0;
  const daysTotal = activeSprint.days_total ?? 1;
  const daysPercent = Math.round(((daysTotal - daysRemaining) / daysTotal) * 100);
  const isOnTrack = progressPercent >= daysPercent - 10;

  return (
    <div className="widget animate-fade-in stagger-3">
      <h2 className="widget-title">
        <Target className="h-4 w-4 text-primary" />
        {isPersonal ? "My Sprint Progress" : "Sprint Progress"}
      </h2>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-foreground">{activeSprint.name}</span>
            {isOnTrack && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/10 text-success">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                On Track
              </span>
            )}
          </div>
          {daysRemaining > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {daysRemaining} days left
            </div>
          )}
        </div>

        {activeSprint.progress_percent !== null && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">
                {progressPercent}%
              </span>
            </div>
            <Progress value={progressPercent} className="h-2.5 bg-muted" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progressPercent}% complete</span>
              <span>{activeSprint.status}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Time Elapsed</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="stat-value text-lg">{daysPercent}%</span>
              <span className="text-xs text-muted-foreground">of sprint</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">State</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="stat-value text-lg text-xs">{activeSprint.state}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle } from "lucide-react";
import { useGetWorkloadDistributionQuery } from "@/store/api";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  initials: string;
  load: number;
  capacity: number;
  status: "online" | "away" | "offline";
  openIssues: number;
  highPriorityIssues: number;
  maxIdleDays: number;
}

function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getStatusFromIdleDays(maxIdleDays: number): "online" | "away" | "offline" {
  if (maxIdleDays <= 1) return "online";
  if (maxIdleDays <= 3) return "away";
  return "offline";
}

function calculateLoad(openIssues: number, highPriorityIssues: number): number {
  const baseLoad = Math.min(openIssues * 2, 100);
  const highPriorityPenalty = highPriorityIssues * 5;
  return Math.min(baseLoad + highPriorityPenalty, 150);
}

export function WorkloadDistribution() {
  const { data: workloadData, isLoading } = useGetWorkloadDistributionQuery();
  
  let workloadArray: any[] = [];
  if (Array.isArray(workloadData)) {
    workloadArray = workloadData;
  } else if (workloadData && typeof workloadData === 'object') {
    const dataObj = workloadData as any;
    if (Array.isArray(dataObj.data)) {
      workloadArray = dataObj.data;
    } else if (Array.isArray(dataObj.workload)) {
      workloadArray = dataObj.workload;
    }
  }
  
  const teamMembers: TeamMember[] = workloadArray.map((item) => {
    const load = calculateLoad(item.open_issues, item.high_priority_issues);
    return {
      id: item.user_id,
      name: item.name,
      role: "Developer",
      initials: getInitials(item.name),
      load: Math.round(load),
      capacity: item.open_issues,
      status: getStatusFromIdleDays(item.max_idle_days),
      openIssues: item.open_issues,
      highPriorityIssues: item.high_priority_issues,
      maxIdleDays: item.max_idle_days,
    };
  }).sort((a, b) => b.load - a.load);

  const getLoadColor = (load: number) => {
    if (load >= 100) return "bg-destructive";
    if (load >= 80) return "bg-warning";
    return "bg-success";
  };

  const getLoadTextColor = (load: number) => {
    if (load >= 100) return "text-destructive";
    if (load >= 80) return "text-warning";
    return "text-success";
  };

  const statusColors = {
    online: "bg-success",
    away: "bg-warning",
    offline: "bg-muted-foreground/40",
  };

  const overloadedCount = teamMembers.filter((m) => m.load >= 100).length;

  return (
    <div className="widget animate-fade-in stagger-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="widget-title mb-0">
          <Users className="h-4 w-4 text-primary" />
          Sprint Load Overview
        </h2>
        {overloadedCount > 0 && (
          <Badge variant="outline" className="text-[10px] gap-1 priority-high">
            <AlertTriangle className="h-3 w-3" />
            {overloadedCount} overloaded
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground p-3 text-center">
            Loading workload data...
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-sm text-muted-foreground p-3 text-center">
          Sprint Load Overview data not available
          </div>
        ) : (
          teamMembers.map((member) => (
          <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <div className="relative">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{member.initials}</AvatarFallback>
              </Avatar>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${statusColors[member.status]}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-foreground">{member.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{member.role}</span>
                    {member.highPriorityIssues > 0 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 priority-high">
                        {member.highPriorityIssues} high priority
                      </Badge>
                    )}
                    {member.maxIdleDays > 3 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 priority-warning">
                        {member.maxIdleDays}d idle
                      </Badge>
                    )}
                  </div>
                </div>
                <span className={`text-sm font-semibold shrink-0 ml-2 ${getLoadTextColor(member.load)}`}>
                  {member.load}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={Math.min(member.load, 100)} 
                  className="h-2 flex-1" 
                  style={{ 
                    ['--progress-background' as string]: member.load >= 100 
                      ? 'hsl(var(--destructive))' 
                      : member.load >= 80 
                      ? 'hsl(var(--warning))' 
                      : 'hsl(var(--success))' 
                  }}
                />
                <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                  {member.openIssues} issues
                </span>
              </div>
            </div>
          </div>
        )))}
      </div>

      {teamMembers.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">AI Suggestion:</span> Monitor team workload to ensure balanced distribution.
          </span>
        </div>
      )}
    </div>
  );
}

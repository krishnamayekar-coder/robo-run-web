import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GitCommit, GitPullRequest, TicketCheck, MessageSquare, Clock } from "lucide-react";
import { useGetRecentActivityQuery, useGetGitRecentQuery } from "@/store/api";
import { formatDistanceToNow } from "date-fns";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Activity {
  id: string;
  type: "commit" | "pr" | "jira" | "comment";
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  action: string;
  target: string;
  time: string;
  timestamp: string; // Original timestamp for sorting
}

interface RecentActivityProps {
  isPersonal?: boolean;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTimeAgo(timestamp: string): string {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return "recently";
  }
}

export function RecentActivity({ isPersonal = false }: RecentActivityProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 7);
  
  const fromDateStr = fromDate.toISOString().split('T')[0];
  const toDateStr = toDate.toISOString().split('T')[0];

  const { data: jiraData, isLoading: jiraLoading } = useGetRecentActivityQuery({
    from_date: fromDateStr,
    to_date: toDateStr,
  });
  
  const { data: gitData, isLoading: gitLoading } = useGetGitRecentQuery();

  const buildAllActivities = (): Activity[] => {
    const allActivities: Activity[] = [];

    if (jiraData?.data) {
      jiraData.data.forEach((item) => {
        const assignee = item.assignee || "Unknown";
        allActivities.push({
          id: item.id,
          type: "jira",
          user: {
            name: assignee,
            initials: getInitials(assignee),
          },
          action: "updated",
          target: `${item.issue_id}: ${item.raw?.fields?.summary || "Issue"}`,
          time: formatTimeAgo(item.timestamp),
          timestamp: item.timestamp,
        });
      });
    }

    if (gitData?.recent_commits) {
      gitData.recent_commits.forEach((commit) => {
        const emailPart = commit.author_email?.split("@")[0] || "unknown";
        const name = emailPart.replace(/\./g, " ") || "Unknown";
        allActivities.push({
          id: commit.id,
          type: "commit",
          user: {
            name: name,
            initials: getInitials(name),
          },
          action: "committed",
          target: commit.message || "commit",
          time: formatTimeAgo(commit.timestamp),
          timestamp: commit.timestamp,
        });
      });
    }

    if (gitData?.recent_pull_requests) {
      gitData.recent_pull_requests.forEach((pr) => {
        const authorName = pr.author_login || "Unknown";
        allActivities.push({
          id: pr.id,
          type: "pr",
          user: {
            name: authorName,
            initials: getInitials(authorName),
          },
          action: pr.action === "closed" && pr.merged ? "merged PR" : pr.action === "closed" ? "closed PR" : "opened PR",
          target: `#${pr.pr_number}: ${pr.title}`,
          time: formatTimeAgo(pr.timestamp),
          timestamp: pr.timestamp,
        });
      });
    }

    allActivities.sort((a, b) => {
      try {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA; // Most recent first
      } catch {
        return 0;
      }
    });

    return allActivities;
  };

  const allActivities = buildAllActivities();
  const displayActivities = allActivities.slice(0, 5);
  const isLoading = jiraLoading || gitLoading;

  const typeConfig = {
    commit: { icon: GitCommit, color: "text-success", bg: "bg-success/10" },
    pr: { icon: GitPullRequest, color: "text-primary", bg: "bg-primary/10" },
    jira: { icon: TicketCheck, color: "text-warning", bg: "bg-warning/10" },
    comment: { icon: MessageSquare, color: "text-muted-foreground", bg: "bg-muted" },
  };

  return (
    <div className="widget animate-fade-in stagger-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="widget-title mb-0">
          <Clock className="h-4 w-4 text-primary" />
          {isPersonal ? "My Recent Activity" : "Recent Activity"}
        </h2>
        <Badge variant="outline" className="text-[10px]">
          Last 24h
        </Badge>
      </div>

      <div className="space-y-1">
        {isLoading ? (
          <div className="text-sm text-muted-foreground p-3">Loading activity...</div>
        ) : displayActivities.length === 0 ? (
          <div className="text-sm text-muted-foreground p-3">No recent activity</div>
        ) : (
          displayActivities.map((activity) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;

          return (
            <div 
              key={activity.id} 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{activity.user.initials}</AvatarFallback>
              </Avatar>

              <div className={`p-1.5 rounded-md ${config.bg}`}>
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{activity.user.name}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-medium text-primary group-hover:underline">{activity.target}</span>
                </p>
              </div>

              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{activity.time}</span>
            </div>
          );
        }))}
      </div>

      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="w-full mt-3 py-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
      >
        View all activity →
      </button>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {isPersonal ? "My Recent Activity" : "All Recent Activity"}
            </DrawerTitle>
            <DrawerDescription>
              Showing all activities from the last 7 days
            </DrawerDescription>
          </DrawerHeader>
          
          <ScrollArea className="h-[60vh] px-4">
            <div className="space-y-1 pb-4">
              {isLoading ? (
                <div className="text-sm text-muted-foreground p-3 text-center">Loading activity...</div>
              ) : allActivities.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 text-center">No recent activity</div>
              ) : (
                allActivities.map((activity) => {
                  const config = typeConfig[activity.type];
                  const Icon = config.icon;

                  return (
                    <div 
                      key={activity.id} 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{activity.user.initials}</AvatarFallback>
                      </Avatar>

                      <div className={`p-1.5 rounded-md ${config.bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{activity.user.name}</span>{" "}
                          <span className="text-muted-foreground">{activity.action}</span>{" "}
                          <span className="font-medium text-primary group-hover:underline">{activity.target}</span>
                        </p>
                      </div>

                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{activity.time}</span>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

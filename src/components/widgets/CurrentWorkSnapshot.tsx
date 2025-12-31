import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, GitBranch, GitCommit, TicketCheck } from "lucide-react";
import { useGetGitRecentQuery, useGetRecentActivityQuery } from "@/store/api";
import { formatDistanceToNow } from "date-fns";

interface WorkItem {
  id: string;
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  assignee: {
    name: string;
    avatar?: string;
    initials: string;
  };
  status: string;
  lastUpdate: string;
}

interface CurrentWorkSnapshotProps {
  isPersonal?: boolean;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  const namePart = name.split("@")[0];
  const parts = namePart.split(".");
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  }
  return namePart
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

function mapPriority(priority: string | null | undefined): "critical" | "high" | "medium" | "low" {
  if (!priority) return "low";
  const lower = priority.toLowerCase();
  if (lower.includes("critical") || lower.includes("highest")) return "critical";
  if (lower.includes("high")) return "high";
  if (lower.includes("medium")) return "medium";
  return "low";
}

export function CurrentWorkSnapshot({ isPersonal = false }: CurrentWorkSnapshotProps) {
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

  const jiraItems: WorkItem[] = ((jiraData as any)?.jira_recent_activities?.slice(0, 5) || []).map((item: any) => ({
    id: item.jira_ticket_id || "N/A",
    title: item.jira_title || "Issue",
    priority: mapPriority(item.priority),
    assignee: {
      name: item.assignee || "Unassigned",
      initials: getInitials(item.assignee),
    },
    status: item.jira_status || "Unknown",
    lastUpdate: item.time_ago || formatTimeAgo(item.last_activity_time),
  }));

  const prItems: WorkItem[] = gitData?.recent_pull_requests?.slice(0, 5).map((pr) => ({
    id: `#${pr.pr_number}`,
    title: pr.title,
    priority: pr.state === "open" ? "high" : "medium",
    assignee: {
      name: pr.author_login || "Unknown",
      initials: getInitials(pr.author_login || "Unknown"),
    },
    status: pr.state === "open" ? "Open" : pr.merged ? "Merged" : "Closed",
    lastUpdate: formatTimeAgo(pr.timestamp),
  })) || [];

  const commitItems: WorkItem[] = gitData?.recent_commits?.slice(0, 5).map((commit) => {
    const commitId = commit.commit_sha || "N/A";
    const commitMessage = commit.message || "Commit";
    const authorEmail = commit.author_email || "";
    const authorName = authorEmail.includes("@") 
      ? authorEmail.split("@")[0].replace(/\./g, " ") 
      : authorEmail || "Unknown";
    
    return {
      id: typeof commitId === "string" && commitId.length > 7 ? commitId.substring(0, 7) : commitId,
      title: commitMessage,
      priority: "medium" as const,
      assignee: {
        name: authorName,
        initials: getInitials(authorEmail || authorName),
      },
      status: commit.repo?.split("/").pop() || "repo",
      lastUpdate: formatTimeAgo(commit.timestamp),
    };
  }) || [];

  const isLoading = jiraLoading || gitLoading;

  const priorityClasses = {
    critical: "priority-critical",
    high: "priority-high",
    medium: "priority-medium",
    low: "priority-low",
  };

  const WorkItemRow = ({ item }: { item: WorkItem }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer">
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="h-8 w-8 border border-border cursor-pointer">
            <AvatarImage src={item.assignee.avatar} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{item.assignee.initials}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>{item.assignee.name}</p>
        </TooltipContent>
      </Tooltip>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">{item.id}</span>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityClasses[item.priority]}`}>
            {item.priority}
          </Badge>
        </div>
        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {item.title}
        </p>
      </div>
      <div className="text-right shrink-0">
        <Badge variant="secondary" className="text-[10px] mb-1">{item.status}</Badge>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="whitespace-nowrap">{item.lastUpdate}</span>
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="widget animate-fade-in stagger-4">
        <h2 className="widget-title">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-subtle" />
          {isPersonal ? "My Work Snapshot" : "Current Work Snapshot"}
        </h2>

        {isLoading ? (
          <div className="text-sm text-muted-foreground p-3">Loading work items...</div>
        ) : (
          <Tabs defaultValue="jira" className="w-full">
          <div className="glass-card rounded-xl p-1.5 w-full mb-4">
            <TabsList className="w-full grid grid-cols-3 h-auto bg-transparent border-0 shadow-none p-0 gap-1">
              <TabsTrigger 
                value="jira" 
                className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm h-9 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors"
              >
                <TicketCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Jira Tickets</span>
                <span className="sm:hidden">Jira</span>
                <Badge variant="secondary" className="text-[10px] ml-1">{jiraItems.length}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="commits" 
                className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm h-9 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors"
              >
                <GitCommit className="h-4 w-4" />
                <span className="hidden sm:inline">Commits</span>
                <span className="sm:hidden">Commits</span>
                <Badge variant="secondary" className="text-[10px] ml-1">{commitItems.length}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="prs" 
                className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm h-9 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors"
              >
                <GitBranch className="h-4 w-4" />
                <span className="hidden sm:inline">Pull Requests</span>
                <span className="sm:hidden">PRs</span>
                <Badge variant="secondary" className="text-[10px] ml-1">{prItems.length}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="jira" className="mt-0">
            {jiraItems.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">No Jira items</div>
            ) : (
              <div className="space-y-1">
                {jiraItems.map((item, index) => (
                  <WorkItemRow key={item.id || `jira-${index}`} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="commits" className="mt-0">
            {commitItems.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">No commits</div>
            ) : (
              <div className="space-y-1">
                {commitItems.map((item, index) => (
                  <WorkItemRow key={item.id || `commit-${index}`} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prs" className="mt-0">
            {prItems.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 text-center">No pull requests</div>
            ) : (
              <div className="space-y-1">
                {prItems.map((item, index) => (
                  <WorkItemRow key={item.id || `pr-${index}`} item={item} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        )}
      </div>
    </TooltipProvider>
  );
}

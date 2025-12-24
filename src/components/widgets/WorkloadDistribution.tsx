import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, AlertTriangle, Ticket, GitPullRequest, GitCommit, TicketCheck } from "lucide-react";
import { useGetWorkloadDistributionQuery } from "@/store/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  assignedStoryPoints: number;
  avgStoryPointsLast3Sprints: number;
  loadLabel: string;
  tooltip: string;
  activeJiraTickets: number;
  highPriorityTickets: number;
  prsAwaitingReview: number;
}

export function WorkloadDistribution() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: workloadData, isLoading } = useGetWorkloadDistributionQuery();
  
  // Handle new response structure with workload and pull_requests
  const workload = workloadData?.workload || [];
  const pullRequests = workloadData?.pull_requests || [];
  
  // Calculate PRs awaiting review per user
  // Match PR authors to workload users by name (flexible matching)
  // Only count PRs that are open (not closed/merged)
  const prsByAuthor = pullRequests.reduce((acc, pr) => {
    const status = pr.status?.toUpperCase();
    if (status === "OPEN" || status === "DRAFT") {
      const author = pr.author.toLowerCase().replace(/[^a-z0-9]/g, '');
      acc[author] = (acc[author] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Create a mapping from user names to PR counts
  const getPRCountForUser = (userName: string): number => {
    const normalizedUserName = userName.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Try exact match first
    if (prsByAuthor[normalizedUserName]) {
      return prsByAuthor[normalizedUserName];
    }
    // Try matching by first name or last name
    const nameParts = normalizedUserName.split(/\s+/);
    for (const part of nameParts) {
      if (part.length > 3 && prsByAuthor[part]) {
        return prsByAuthor[part];
      }
    }
    // Try matching PR authors that contain user name parts
    for (const [author, count] of Object.entries(prsByAuthor)) {
      if (nameParts.some(part => part.length > 3 && author.includes(part))) {
        return count;
      }
    }
    return 0;
  };
  
  // Calculate average open issues for load calculation
  const avgOpenIssues = workload.length > 0 
    ? workload.reduce((sum, item) => sum + item.open_issues, 0) / workload.length 
    : 0;
  
  // Map workload to team members
  const teamMembers: TeamMember[] = workload.map((item) => {
    // Calculate load label based on open issues vs average
    const loadRatio = avgOpenIssues > 0 ? item.open_issues / avgOpenIssues : 1;
    let loadLabel = "🟢 Balanced";
    let tooltip = "Load is based on assigned story points compared to historical sprint averages.";
    
    if (loadRatio > 1.5) {
      loadLabel = "🔴 Overloaded";
      tooltip = "Assigned work significantly exceeds historical sprint capacity";
    } else if (loadRatio > 1.2) {
      loadLabel = "🟡 High";
      tooltip = "Assigned work is above normal capacity but still manageable";
    } else {
      tooltip = "Assigned work is within normal sprint capacity";
    }
    
    // Get PRs awaiting review for this user
    const prsAwaitingReview = getPRCountForUser(item.name);
    
    return {
      id: item.user_id,
      name: item.name,
      role: "Developer", // Default role since not in API response
      assignedStoryPoints: 0, // Not available in new structure
      avgStoryPointsLast3Sprints: 0, // Not available in new structure
      loadLabel: loadLabel,
      tooltip: tooltip,
      activeJiraTickets: item.open_issues,
      highPriorityTickets: item.high_priority_issues,
      prsAwaitingReview: prsAwaitingReview,
    };
  });

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    setSheetOpen(true);
  };

  const getLoadLabelTooltip = (loadLabel: string): string => {
    // Remove emojis and special characters, normalize for matching
    // Handle both Unicode escape sequences and actual emojis
    const cleanLabel = loadLabel
      .replace(/\\u[\dA-F]{4}/gi, '') // Remove Unicode escape sequences like \ud83d\udfe2
      .replace(/[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}]/gu, '') // Remove emojis
      .replace(/[^\w\s]/g, '') // Remove special characters
      .trim()
      .toLowerCase();
    
    if (cleanLabel.includes('balanced')) {
      return "Assigned work is within normal sprint capacity";
    } else if (cleanLabel.includes('high')) {
      return "Assigned work is above normal capacity but still manageable";
    } else if (cleanLabel.includes('overloaded')) {
      return "Assigned work significantly exceeds historical sprint capacity";
    }
    // Fallback to a default message
    return "Load is based on assigned story points compared to historical sprint averages.";
  };

  // Calculate overloaded count - only show if:
  // 1. Per-person load states are shown (they are)
  // 2. "Overloaded" is clearly defined (check if any member has "Overloaded" in load_label)
  // 3. The count is actionable (we calculate it from the data)
  const overloadedMembers = teamMembers.filter(m => 
    m.loadLabel && m.loadLabel.toLowerCase().includes('overloaded')
  );
  const overloadedCount = overloadedMembers.length > 0 ? overloadedMembers.length : null;

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={100}>
      <div className="widget animate-fade-in stagger-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="widget-title mb-0">
          <Users className="h-4 w-4 text-primary" />
          Sprint Load Overview
        </h2>
        {overloadedCount !== null && overloadedCount > 0 && (
          <Badge variant="outline" className="text-[10px] gap-1 priority-high">
            <AlertTriangle className="h-3 w-3" />
            {overloadedCount} overloaded
          </Badge>
        )}
      </div>

      <div className="space-y-4 overflow-visible">
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
            <div 
              key={member.id} 
              onClick={() => handleMemberClick(member)}
              className="p-3 rounded-lg glass-card transition-all hover:shadow-sm cursor-pointer overflow-visible"
            >
              {/* Name + Role */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{member.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{member.role}</div>
                </div>
                {member.loadLabel && (
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <span 
                        onClick={(e) => e.stopPropagation()}
                        className="inline-block"
                      >
                        <Badge variant="outline" className="text-[10px] px-2 py-1 cursor-help">
                          {member.loadLabel}
                        </Badge>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      align="center"
                      className="max-w-[180px] !z-[99999] whitespace-normal"
                      sideOffset={8}
                      alignOffset={0}
                      avoidCollisions={true}
                      collisionPadding={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                      <p className="text-xs leading-relaxed whitespace-normal">
                        {getLoadLabelTooltip(member.loadLabel)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-4 text-xs mb-3">
                <div className="flex items-center gap-1.5">
                  <Ticket className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{member.activeJiraTickets}</span>
                  <span className="text-muted-foreground">Open Issues</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-foreground">{member.highPriorityTickets}</span>
                  <span className="text-muted-foreground">High Priority</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GitPullRequest className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{member.prsAwaitingReview}</span>
                  <span className="text-muted-foreground">PRs Review</span>
                </div>
              </div>

              {/* Icons and Counts Row */}
            
            </div>
          ))
        )}
      </div>


      {/* Sheet for member details */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold">
              {selectedMember?.name} - {selectedMember?.role}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
            Project Name
            <br />
            Sprint Number
            </SheetDescription>
          </SheetHeader>
          
          {selectedMember && (
            <div className="mt-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-lg glass-card text-center">
                  <Ticket className="h-5 w-5 text-primary mx-auto mb-1" />
                  <div className="text-2xl font-bold text-foreground">{selectedMember.activeJiraTickets}</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
                <div className="p-3 rounded-lg glass-card text-center">
                  <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-1" />
                  <div className="text-2xl font-bold text-destructive">{selectedMember.highPriorityTickets}</div>
                  <div className="text-xs text-muted-foreground">High Priority</div>
                </div>
                <div className="p-3 rounded-lg glass-card text-center">
                  <GitPullRequest className="h-5 w-5 text-primary mx-auto mb-1" />
                  <div className="text-2xl font-bold text-foreground">{selectedMember.prsAwaitingReview}</div>
                  <div className="text-xs text-muted-foreground">PRs Review</div>
                </div>
              </div>

              {/* Tabs for detailed view */}
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
                      <Badge variant="secondary" className="text-[10px] ml-1">{selectedMember.activeJiraTickets}</Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="commits" 
                      className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm h-9 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <GitCommit className="h-4 w-4" />
                      <span className="hidden sm:inline">Commits</span>
                      <span className="sm:hidden">Commits</span>
                      <Badge variant="secondary" className="text-[10px] ml-1">0</Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="prs" 
                      className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm h-9 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <GitPullRequest className="h-4 w-4" />
                      <span className="hidden sm:inline">Pull Requests</span>
                      <span className="sm:hidden">PRs</span>
                      <Badge variant="secondary" className="text-[10px] ml-1">{selectedMember.prsAwaitingReview}</Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="jira" className="mt-0">
                  <div className="text-sm text-muted-foreground p-3 text-center rounded-lg glass-card">
                    Jira tickets data will be displayed here
                  </div>
                </TabsContent>

                <TabsContent value="commits" className="mt-0">
                  <div className="text-sm text-muted-foreground p-3 text-center rounded-lg glass-card">
                    Commits data will be displayed here
                  </div>
                </TabsContent>

                <TabsContent value="prs" className="mt-0">
                  <div className="text-sm text-muted-foreground p-3 text-center rounded-lg glass-card">
                    Pull requests data will be displayed here
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
      </div>
    </TooltipProvider>
  );
}

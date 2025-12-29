import { Users, Mail, Calendar, GitCommit, GitPullRequest, Ticket, AlertTriangle } from "lucide-react";
import { useGetTeamMembersQuery } from "@/store/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { TeamMembersResponse } from "@/store/types";
import { formatDistanceToNow } from "date-fns";

interface TeamMembersProps {
  projectId: string;
  isPersonal?: boolean;
}

// Dummy data for demonstration
const dummyData: TeamMembersResponse = {
  project_id: "project-1",
  project_name: "AI Work Tracker",
  members: [
    {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@company.com",
      role: "Senior Developer",
      avatar_url: undefined,
      project_id: "project-1",
      project_name: "AI Work Tracker",
      open_issues: 5,
      high_priority_issues: 2,
      commits_count: 24,
      prs_count: 8,
      prs_open: 3,
      last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      workload_status: "balanced",
    },
    {
      id: "user-2",
      name: "Jane Smith",
      email: "jane.smith@company.com",
      role: "Frontend Developer",
      avatar_url: undefined,
      project_id: "project-1",
      project_name: "AI Work Tracker",
      open_issues: 8,
      high_priority_issues: 1,
      commits_count: 18,
      prs_count: 5,
      prs_open: 2,
      last_active: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      workload_status: "high",
    },
    {
      id: "user-3",
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      role: "Backend Developer",
      avatar_url: undefined,
      project_id: "project-1",
      project_name: "AI Work Tracker",
      open_issues: 12,
      high_priority_issues: 4,
      commits_count: 15,
      prs_count: 6,
      prs_open: 4,
      last_active: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      workload_status: "overloaded",
    },
    {
      id: "user-4",
      name: "Sarah Williams",
      email: "sarah.williams@company.com",
      role: "DevOps Engineer",
      avatar_url: undefined,
      project_id: "project-1",
      project_name: "AI Work Tracker",
      open_issues: 3,
      high_priority_issues: 0,
      commits_count: 30,
      prs_count: 10,
      prs_open: 1,
      last_active: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      workload_status: "balanced",
    },
  ],
  total_members: 4,
};

function getWorkloadBadgeVariant(status: string): "default" | "secondary" | "destructive" {
  switch (status) {
    case "overloaded":
      return "destructive";
    case "high":
      return "default";
    default:
      return "secondary";
  }
}

function getWorkloadLabel(status: string): string {
  switch (status) {
    case "overloaded":
      return "🔴 Overloaded";
    case "high":
      return "🟡 High";
    default:
      return "🟢 Balanced";
  }
}

export function TeamMembers({ projectId, isPersonal = true }: TeamMembersProps) {
  const { data, isLoading, error } = useGetTeamMembersQuery({ project_id: projectId });

  // Use dummy data if API fails or returns empty, or if still loading
  const displayData = (!isLoading && !error && data && data.members.length > 0)
    ? data
    : (!isLoading ? dummyData : null);

  if (isLoading) {
    return (
      <div className="widget animate-fade-in">
        <h2 className="widget-title">Team Members</h2>
        <div className="text-sm text-muted-foreground p-3">Loading team members...</div>
      </div>
    );
  }

  if (error && !displayData) {
    return (
      <div className="widget animate-fade-in">
        <h2 className="widget-title">Team Members</h2>
        <div className="text-sm text-muted-foreground p-3">Failed to load team members</div>
      </div>
    );
  }

  return (
    <div className="widget animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="widget-title mb-0">
          <Users className="h-4 w-4 text-primary" />
          Team Members
        </h2>
        <Badge variant="outline">
          {displayData?.total_members || 0} members
        </Badge>
      </div>

      {!displayData && (
        <div className="text-xs text-muted-foreground p-2 mb-2 bg-warning/10 border border-warning/20 rounded">
          ⚠️ Showing dummy data for demonstration
        </div>
      )}

      {displayData && (
        <div className="mb-2">
          <p className="text-xs text-muted-foreground">
            Project: <span className="font-medium text-foreground">{displayData.project_name}</span>
          </p>
        </div>
      )}

      <div className="space-y-3">
        {displayData?.members.length === 0 ? (
          <div className="text-sm text-muted-foreground p-3 text-center">
            No team members found for this project
          </div>
        ) : (
          displayData?.members.map((member) => (
            <Card key={member.id} className="p-4 glass-card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src={member.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{member.name}</h3>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    <Badge 
                      variant={getWorkloadBadgeVariant(member.workload_status)}
                      className="text-[10px]"
                    >
                      {getWorkloadLabel(member.workload_status)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{member.email}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 p-2 rounded bg-muted/50">
                      <Ticket className="h-3.5 w-3.5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">{member.open_issues}</div>
                        <div className="text-muted-foreground">Open Issues</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded bg-muted/50">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      <div>
                        <div className="font-medium text-foreground">{member.high_priority_issues}</div>
                        <div className="text-muted-foreground">High Priority</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded bg-muted/50">
                      <GitCommit className="h-3.5 w-3.5 text-success" />
                      <div>
                        <div className="font-medium text-foreground">{member.commits_count}</div>
                        <div className="text-muted-foreground">Commits</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded bg-muted/50">
                      <GitPullRequest className="h-3.5 w-3.5 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">{member.prs_open}</div>
                        <div className="text-muted-foreground">Open PRs</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Active {formatDistanceToNow(new Date(member.last_active), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


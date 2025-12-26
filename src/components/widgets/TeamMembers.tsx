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

import { Users } from "lucide-react";
import { useGetTeamMembersQuery, useGetUsersDetailsQuery } from "@/store/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TeamMembersResponse, TeamMember, UsersDetailsResponse } from "@/store/types";

interface TeamMembersProps {
  projectId: string;
  isPersonal?: boolean;
}

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
  // Check user role to determine if they can access /users/details
  const userRole = localStorage.getItem('userRole') || '';
  const isManager = userRole === 'MANAGER' || userRole === 'DEV_MANAGER' || userRole.includes('MANAGER');
  
  // Use the new /users/details API only if user is a manager
  const { data: usersData, isLoading: usersLoading, error: usersError } = useGetUsersDetailsQuery(undefined, {
    skip: !isManager, // Skip if user is not a manager
  });
  
  // Keep the old endpoint as fallback (always try this one, unless we have usersData)
  const { data: teamData, isLoading: teamLoading, error: teamError } = useGetTeamMembersQuery({ project_id: projectId }, {
    skip: !!usersData || (!isManager && !usersError), // Skip if usersData is available, or if not manager and usersError exists
  });

  const isLoading = usersLoading || teamLoading;
  const error = usersError || teamError;
  
  // Debug logging (remove in production)
  if (usersError) {
    console.error('Users Details API Error:', usersError);
  }
  if (usersData) {
    console.log('Users Details API Response:', usersData);
  }

  // Transform users/details response to TeamMembersResponse format
  const transformUsersData = (usersData: UsersDetailsResponse | undefined): TeamMembersResponse | null => {
    if (!usersData) {
      console.log('No usersData provided');
      return null;
    }
    
    console.log('Transforming usersData:', usersData);
    
    // Handle different possible response structures
    let users: any[] = [];
    
    if (Array.isArray(usersData)) {
      users = usersData;
    } else if (usersData.users && Array.isArray(usersData.users)) {
      users = usersData.users;
    } else if (usersData.data && Array.isArray(usersData.data)) {
      users = usersData.data;
    } else if (typeof usersData === 'object') {
      // Try to find any array property
      const keys = Object.keys(usersData);
      for (const key of keys) {
        if (Array.isArray((usersData as any)[key])) {
          users = (usersData as any)[key];
          console.log(`Found users array in key: ${key}`);
          break;
        }
      }
    }
    
    console.log('Extracted users array:', users);
    
    if (!Array.isArray(users) || users.length === 0) {
      console.log('No valid users array found or array is empty');
      return null;
    }

    const members: TeamMember[] = users.map((user) => {
      // Map actual API response fields - prioritize display_name from API
      const userId = user.id || user.user_id || user.email || `user-${Math.random()}`;
      const userName = user.display_name || user.name || user.full_name || user.username || user.email?.split('@')[0] || "Unknown";
      const userEmail = user.email || user.email_address || "";
      const userRole = user.role || user.job_title || user.position || "Developer";
      
      // Activity metrics - these may not be in the API response, so default to 0
      const openIssues = user.open_issues || user.active_issues || user.jira_tickets || 0;
      const highPriorityIssues = user.high_priority_issues || user.critical_issues || 0;
      const commitsCount = user.commits_count || user.commits || user.total_commits || 0;
      const prsCount = user.prs_count || user.pull_requests || user.total_prs || 0;
      const prsOpen = user.prs_open || user.open_prs || user.active_prs || 0;
      
      // Calculate workload status based on available data
      // Since API doesn't provide activity metrics, default to "balanced"
      const workloadStatus = user.workload_status || "balanced" as "balanced" | "high" | "overloaded";
      
      // Use created_at as last_active if no last_active field (API provides created_at)
      const lastActive = user.last_active || user.last_activity || user.updated_at || user.created_at || new Date().toISOString();

      return {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole,
        avatar_url: user.avatar_url || user.avatar || user.profile_picture,
        project_id: projectId,
        project_name: user.org_name || "AI Work Tracker",
        open_issues: openIssues,
        high_priority_issues: highPriorityIssues,
        commits_count: commitsCount,
        prs_count: prsCount,
        prs_open: prsOpen,
        last_active: lastActive,
        workload_status: workloadStatus,
      };
    });

    // Use org_name from first user if available, otherwise default
    const projectName = members.length > 0 && members[0].project_name !== "AI Work Tracker" 
      ? members[0].project_name 
      : "AI Work Tracker";

    return {
      project_id: projectId,
      project_name: projectName,
      members,
      total_members: members.length,
    };
  };

  // Only use API data - no dummy data fallback
  const transformedUsersData = transformUsersData(usersData);
  const displayData = transformedUsersData 
    || (!isLoading && !error && teamData && teamData.members && teamData.members.length > 0 ? teamData : null);

  // Enhanced debugging
  if (!isLoading && !error) {
    console.log('TeamMembers Debug:', {
      hasUsersData: !!usersData,
      usersDataStructure: usersData ? Object.keys(usersData) : null,
      transformedUsersData: transformedUsersData ? { membersCount: transformedUsersData.members.length } : null,
      hasTeamData: !!teamData,
      teamDataMembers: teamData?.members?.length || 0,
      displayData: displayData ? { membersCount: displayData.members.length } : null,
      userRole,
      isManager,
    });
  }

  if (isLoading) {
    return (
      <div className="widget animate-fade-in">
        <h2 className="widget-title">Team Members</h2>
        <div className="text-sm text-muted-foreground p-3">Loading team members...</div>
      </div>
    );
  }

  if (error && !displayData) {
    // Extract detailed error information
    const errorObj = usersError || teamError;
    const errorStatus = (errorObj as any)?.status;
    const errorData = (errorObj as any)?.data;
    const errorMessage = errorData?.message || errorData?.error || (errorObj as any)?.error || 'Failed to fetch team members';
    const isFetchError = errorStatus === 'FETCH_ERROR' || errorMessage.includes('Failed to fetch') || errorMessage.includes('TypeError');
    const isCorsError = errorMessage.includes('CORS') || errorMessage.includes('Access-Control-Allow-Origin') || 
                       (isFetchError && errorMessage.includes('fetch'));
    const isAuthError = errorStatus === 401 || errorStatus === 403;
    const isPermissionError = errorMessage.includes('Only managers') || errorMessage.includes('managers can view') || (errorStatus === 403 && usersError);
    
    // Show permission-specific message
    if (isPermissionError) {
      return (
        <div className="widget animate-fade-in">
          <h2 className="widget-title">Team Members</h2>
          <div className="text-sm text-muted-foreground p-4 space-y-3 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-muted/50">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="font-medium text-foreground">Manager Access Required</div>
              <div className="text-xs text-muted-foreground max-w-sm">
                The Team Members feature is only available to users with Manager or Dev Manager roles.
                <br />
                <span className="mt-1 block">Your current role: <span className="font-medium text-foreground">{userRole || 'Unknown'}</span></span>
              </div>
              {teamError && (
                <div className="text-xs text-destructive mt-2">
                  Also unable to load project-specific team members.
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    // Show network/CORS error message
    if (isFetchError || isCorsError) {
      return (
        <div className="widget animate-fade-in">
          <h2 className="widget-title">Team Members</h2>
          <div className="text-sm text-muted-foreground p-4 space-y-3">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="p-3 rounded-full bg-destructive/10">
                <Users className="h-6 w-6 text-destructive" />
              </div>
              <div className="font-medium text-foreground">Network Connection Error</div>
              <div className="text-xs text-muted-foreground max-w-sm space-y-2">
                <p>Unable to connect to the API server. This is typically caused by:</p>
                <ul className="list-disc list-inside text-left space-y-1 max-w-xs mx-auto">
                  <li><strong>CORS Policy:</strong> Backend needs to allow requests from <code className="text-[10px] bg-muted px-1 py-0.5 rounded">{window.location.origin}</code></li>
                  <li><strong>Network Issue:</strong> API server may be down or unreachable</li>
                  <li><strong>Firewall/Proxy:</strong> Network restrictions blocking the request</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="text-[10px] opacity-75">
                    <strong>Debug Info:</strong>
                    <br />API Base URL: <code className="bg-muted px-1 py-0.5 rounded">{import.meta.env.VITE_API_BASE_URL || 'https://2qlyp5edzh.execute-api.us-east-1.amazonaws.com'}</code>
                    <br />Endpoint: {usersError ? '/users/details' : `/projects/${projectId}/team-members`}
                    <br />User Role: {userRole || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="widget animate-fade-in">
        <h2 className="widget-title">Team Members</h2>
        <div className="text-sm text-muted-foreground p-3 space-y-2">
          <div>Failed to load team members.</div>
          <div className="text-xs text-destructive">
            Error: {errorMessage}
            {errorStatus && <span className="ml-2">(Status: {errorStatus})</span>}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Please check:
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>API endpoint is accessible</li>
              {isCorsError && (
                <li className="text-destructive font-medium">
                  CORS Error: Backend needs to allow requests from {window.location.origin}
                </li>
              )}
              {isAuthError && !isPermissionError && (
                <li className="text-destructive font-medium">
                  Authentication Error: Token may be expired or invalid. Try logging out and back in.
                </li>
              )}
              {!isCorsError && !isAuthError && <li>Authentication token is valid</li>}
            </ul>
            <div className="mt-2 text-[10px] opacity-75">
              Check browser console (F12) for detailed error logs.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && !displayData) {
    // Determine why data is not available
    const hasUsersDataButNoTransform = !!usersData && !transformedUsersData;
    const hasTeamDataButEmpty = !!teamData && (!teamData.members || teamData.members.length === 0);
    const noDataAtAll = !usersData && !teamData;
    
    return (
      <div className="widget animate-fade-in">
        <h2 className="widget-title">Team Members</h2>
        <div className="text-sm text-muted-foreground p-4 space-y-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="p-3 rounded-full bg-muted/50">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="font-medium text-foreground">No Team Members Available</div>
            <div className="text-xs text-muted-foreground max-w-sm space-y-2">
              {hasUsersDataButNoTransform && (
                <p>
                  API returned data but couldn't parse the response structure.
                  <br />
                  <span className="text-[10px] opacity-75 mt-1 block">
                    Check browser console (F12) for transformation details.
                  </span>
                </p>
              )}
              {hasTeamDataButEmpty && (
                <p>
                  The project has no team members assigned yet.
                </p>
              )}
              {noDataAtAll && (
                <p>
                  No team member data was returned from the API.
                  {!isManager && (
                    <>
                      <br />
                      <span className="mt-1 block">
                        Note: You need Manager role to access /users/details endpoint.
                        <br />
                        Current role: <span className="font-medium text-foreground">{userRole || 'Unknown'}</span>
                      </span>
                    </>
                  )}
                </p>
              )}
              <div className="mt-3 pt-3 border-t border-border/30 text-[10px] opacity-75">
                <strong>Debug Info:</strong>
                <br />API Response: {usersData ? 'Received' : 'None'}
                <br />Project Data: {teamData ? `Received (${teamData.members?.length || 0} members)` : 'None'}
                <br />User Role: {userRole || 'Unknown'}
                <br />Is Manager: {isManager ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>
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

      <div className="space-y-2">
        {displayData?.members.length === 0 ? (
          <div className="text-sm text-muted-foreground p-3 text-center">
            No team members found for this project
          </div>
        ) : (
          displayData?.members.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-10 w-10 border border-primary/20">
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                {member.name && (
                  <div className="font-medium text-foreground truncate">
                    {member.name}
                  </div>
                )}
                {member.email && (
                  <div className="text-xs text-muted-foreground truncate">
                    {member.email}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


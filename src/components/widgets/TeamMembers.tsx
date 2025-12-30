import { Users } from "lucide-react";
import { useGetTeamMembersQuery, useGetUsersDetailsQuery } from "@/store/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TeamMembersResponse, TeamMember, UsersDetailsResponse } from "@/store/types";

interface TeamMembersProps {
  projectId: string;
}

export function TeamMembers({ projectId }: TeamMembersProps) {
  const userRole = localStorage.getItem('userRole') || '';
  const isManager = userRole === 'MANAGER' || userRole === 'DEV_MANAGER' || userRole.includes('MANAGER');
  
  const { data: usersData, isLoading: usersLoading, error: usersError } = useGetUsersDetailsQuery(undefined, {
    skip: !isManager,
  });
  
  const { data: teamData, isLoading: teamLoading, error: teamError } = useGetTeamMembersQuery({ project_id: projectId }, {
    skip: !!usersData || (!isManager && !usersError),
  });

  const isLoading = usersLoading || teamLoading;
  const error = usersError || teamError;

  const transformUsersData = (usersData: UsersDetailsResponse | undefined): TeamMembersResponse | null => {
    if (!usersData) {
      return null;
    }
    
    let users: any[] = [];
    
    if (Array.isArray(usersData)) {
      users = usersData;
    } else if (usersData.users && Array.isArray(usersData.users)) {
      users = usersData.users;
    } else if (usersData.data && Array.isArray(usersData.data)) {
      users = usersData.data;
    } else if (typeof usersData === 'object') {
      const keys = Object.keys(usersData);
      for (const key of keys) {
        if (Array.isArray((usersData as any)[key])) {
          users = (usersData as any)[key];
          break;
        }
      }
    }
    
    if (!Array.isArray(users) || users.length === 0) {
      return null;
    }

    const members: TeamMember[] = users.map((user) => {
      const userId = user.id || user.user_id || user.email || `user-${Math.random()}`;
      const userName = user.display_name || user.name || user.full_name || user.username || user.email?.split('@')[0] || "Unknown";
      const userEmail = user.email || user.email_address || "";
      const userRole = user.role || user.job_title || user.position || "Developer";
      
      const openIssues = user.open_issues || user.active_issues || user.jira_tickets || 0;
      const highPriorityIssues = user.high_priority_issues || user.critical_issues || 0;
      const commitsCount = user.commits_count || user.commits || user.total_commits || 0;
      const prsCount = user.prs_count || user.pull_requests || user.total_prs || 0;
      const prsOpen = user.prs_open || user.open_prs || user.active_prs || 0;
      
      const workloadStatus = user.workload_status || "balanced" as "balanced" | "high" | "overloaded";
      
      const lastActive = user.last_active || user.last_activity || user.updated_at || user.created_at || new Date().toISOString();

      return {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole,
        avatar_url: user.avatar_url || user.avatar || user.profile_picture,
        project_id: projectId,
        project_name: user.org_name || "Activity Tracker",
        open_issues: openIssues,
        high_priority_issues: highPriorityIssues,
        commits_count: commitsCount,
        prs_count: prsCount,
        prs_open: prsOpen,
        last_active: lastActive,
        workload_status: workloadStatus,
      };
    });

    const projectName = members.length > 0 && members[0].project_name !== "Activity Tracker" 
      ? members[0].project_name 
      : "Activity Tracker";

    return {
      project_id: projectId,
      project_name: projectName,
      members,
      total_members: members.length,
    };
  };

  const transformedUsersData = transformUsersData(usersData);
  const displayData = transformedUsersData 
    || (!isLoading && !error && teamData && teamData.members && teamData.members.length > 0 ? teamData : null);

  if (isLoading) {
    return (
      <div className="widget animate-fade-in">
        <h2 className="widget-title">Team Members</h2>
        <div className="text-sm text-muted-foreground p-3">Loading team members...</div>
      </div>
    );
  }

  if (error && !displayData) {
    const errorObj = usersError || teamError;
    const errorStatus = (errorObj as any)?.status;
    const errorData = (errorObj as any)?.data;
    const errorMessage = errorData?.message || errorData?.error || (errorObj as any)?.error || 'Failed to fetch team members';
    const isFetchError = errorStatus === 'FETCH_ERROR' || errorMessage.includes('Failed to fetch') || errorMessage.includes('TypeError');
    const isCorsError = errorMessage.includes('CORS') || errorMessage.includes('Access-Control-Allow-Origin') || 
                       (isFetchError && errorMessage.includes('fetch'));
    const isAuthError = errorStatus === 401 || errorStatus === 403;
    const isPermissionError = errorMessage.includes('Only managers') || errorMessage.includes('managers can view') || (errorStatus === 403 && usersError);
    
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {displayData?.members.length === 0 ? (
          <div className="col-span-full text-sm text-muted-foreground p-3 text-center">
            No team members found for this project
          </div>
        ) : (
          displayData?.members.map((member) => (
            <div 
              key={member.id} 
              className="flex flex-col items-center gap-2 p-3 rounded-lg glass-card border border-border/50 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group"
            >
              <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 w-full text-center min-w-0">
                {member.name && (
                  <div className="font-medium text-sm text-foreground truncate w-full" title={member.name}>
                    {member.name}
                  </div>
                )}
                {member.email && (
                  <div className="text-xs text-muted-foreground truncate w-full mt-0.5" title={member.email}>
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


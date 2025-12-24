export interface RecentActivityItem {
  id: string;
  issue_id: string;
  assignee: string;
  reporter: string;
  status: string;
  priority: string;
  timestamp: string;
  raw: any;
  source: string;
}

export interface RecentActivityResponse {
  status: number;
  message: string;
  data: RecentActivityItem[];
}

export interface GitCommit {
  id: string;
  repo: string;
  commit_sha: string;
  author_email: string;
  message: string;
  files: string[];
  timestamp: string;
}

export interface PullRequest {
  id: string;
  github_id: number;
  repo: string;
  pr_number: number;
  title: string;
  action: string;
  state: string;
  author_login: string;
  head_sha: string;
  merged: boolean;
  timestamp: string;
}

export interface GitRecentResponse {
  message: string;
  user_role: string;
  user_record: {
    id: string;
    email: string;
    role: string;
    created_at: string;
  };
  recent_commits: GitCommit[];
  recent_pull_requests: PullRequest[];
}

export interface Sprint {
  sprint_id: number;
  board_id: number | null;
  name: string;
  state: string;
  goal: string | null;
  start_date: string;
  end_date: string;
  status: string;
  progress_percent: number | null;
  days_total: number | null;
  days_remaining: number | null;
  last_update: string;
}

export interface SprintProgressResponse {
  count: number;
  sprints: Sprint[];
}

export interface IssuesPerUser {
  user: string;
  total_issues: number;
}

export interface TeamMetrics {
  total_jira_tickets: {
    count: number;
    delta_percent: string;
    comparison: string;
  };
  commits_prs: {
    count: number;
    delta_percent: string;
    comparison: string;
  };
  high_priority_inactive: {
    count: number;
    delta_percent: string;
    comparison: string;
  };
}

export interface TeamInsightsResponse {
  issues_per_user: IssuesPerUser[];
  completed_today: any[];
  completed_week: any[];
  pending_vs_completed: {
    completed: number;
    pending: number;
  };
  top_active_users: Array<{
    user: string | null;
    comments: number;
  }>;
  avg_resolution_time_hours: number;
  team_metrics_summary: TeamMetrics;
}

export interface PRBottleneck {
  pr_number: number;
  title: string;
  state: string;
  author: string;
  idle_days: number;
  last_updated: string;
  last_updated_ago: string;
  commits: number;
  files_changed: number;
  additions: number;
  deletions: number;
  total_changes: number;
  base_branch: string;
  head_branch: string;
  url: string;
}

export interface PRBottlenecksResponse {
  bottlenecks: PRBottleneck[];
}

export interface WorkloadItem {
  user_id: string;
  name: string;
  open_issues: number;
  high_priority_issues: number;
  subtasks: number;
  max_idle_days: number;
}

export interface FocusToday {
  active_jira_tickets: number;
  high_priority_tickets: number;
  prs_awaiting_review: number;
  subtasks: number;
}

export interface SprintLoadOverviewItem {
  name: string;
  role: string;
  assigned_story_points: number;
  avg_story_points_last_3_sprints: number;
  load_label: string;
  tooltip: string;
  focus_today: FocusToday;
}

export interface SprintLoadSummary {
  overloaded_count: number | null;
}

export interface WorkloadPullRequest {
  pr_id: string;
  repo: string;
  pr_number: number;
  title: string;
  status: string;
  author: string;
  jira_ticket: string | null;
  created: string;
  ci_status: string | null;
  duration: string;
  description: string | null;
}

export interface WorkloadDistributionResponse {
  workload: WorkloadItem[];
  pull_requests: WorkloadPullRequest[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResult {
  AccessToken: string;
  ExpiresIn: number;
  TokenType: string;
  RefreshToken: string;
  IdToken: string;
}

export interface LoginResponse {
  message: string;
  role: string;
  auth_result: AuthResult;
}


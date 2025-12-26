import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '@/lib/auth';
import type {
  RecentActivityResponse,
  GitRecentResponse,
  SprintProgressResponse,
  TeamInsightsResponse,
  PRBottlenecksResponse,
  WorkloadDistributionResponse,
  LoginRequest,
  LoginResponse,
  IntegrationSourcesResponse,
  IntegrationSource,
  ConnectIntegrationRequest,
  SyncIntegrationResponse,
  TeamMembersResponse,
  UsersDetailsResponse,
} from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://2qlyp5edzh.execute-api.us-east-1.amazonaws.com';
const API_KEY = import.meta.env.VITE_API_KEY || 'my-secret-api-key';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        // Check if token already has "Bearer" prefix, if not add it
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        headers.set('Authorization', authToken);
      } else {
        console.warn('No auth token found in localStorage');
      }
      headers.set('X-API-KEY', API_KEY);
      headers.set('accept', 'application/json');
      return headers;
    },
  }),
  // Auto-refetch queries on window focus to keep data fresh
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ['RecentActivity', 'GitActivity', 'SprintProgress', 'TeamInsights', 'PRBottlenecks', 'WorkloadDistribution', 'SprintLoadOverview', 'IntegrationSources', 'TeamMembers'],
  endpoints: (builder) => ({
    getRecentActivity: builder.query<RecentActivityResponse, { from_date: string; to_date: string }>({
      query: ({ from_date, to_date }) => ({
        url: '/activity/recent',
        params: { from_date, to_date },
      }),
      providesTags: ['RecentActivity'],
    }),
    
    getGitRecent: builder.query<GitRecentResponse, void>({
      query: () => '/git/recent',
      providesTags: ['GitActivity'],
    }),
    
    getSprintProgress: builder.query<SprintProgressResponse, void>({
      query: () => '/jira/sprint/progress',
      providesTags: ['SprintProgress'],
    }),
    
    getTeamInsights: builder.query<TeamInsightsResponse, void>({
      query: () => '/jira/team/insights',
      providesTags: ['TeamInsights'],
    }),
    
    getPRBottlenecks: builder.query<PRBottlenecksResponse, void>({
      query: () => '/prs/bottlenecks',
      providesTags: ['PRBottlenecks'],
    }),
    
    getWorkloadDistribution: builder.query<WorkloadDistributionResponse, void>({
      query: () => '/developers/workload',
      providesTags: ['WorkloadDistribution', 'SprintLoadOverview'],
    }),
    
    getTeamMembers: builder.query<TeamMembersResponse, { project_id: string }>({
      query: ({ project_id }) => ({
        url: `/projects/${project_id}/team-members`,
      }),
      providesTags: ['TeamMembers'],
    }),
    
    getUsersDetails: builder.query<UsersDetailsResponse, void>({
      query: () => ({
        url: '/users/details',
      }),
      providesTags: ['TeamMembers'],
    }),
    
    getIntegrationSources: builder.query<IntegrationSourcesResponse, void>({
      query: () => '/integrations',
      providesTags: ['IntegrationSources'],
    }),
    
    connectIntegration: builder.mutation<IntegrationSource, ConnectIntegrationRequest>({
      query: (body) => ({
        url: '/integrations/connect',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['IntegrationSources'],
    }),
    
    disconnectIntegration: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/integrations/${id}/disconnect`,
        method: 'POST',
      }),
      invalidatesTags: ['IntegrationSources'],
    }),
    
    syncIntegration: builder.mutation<SyncIntegrationResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/integrations/${id}/sync`,
        method: 'POST',
      }),
      invalidatesTags: ['IntegrationSources'],
    }),
    
    getTeamMembers: builder.query<TeamMembersResponse, { project_id: string }>({
      query: ({ project_id }) => ({
        url: `/projects/${project_id}/team-members`,
      }),
      providesTags: ['TeamMembers'],
    }),
    
    getIntegrationSources: builder.query<IntegrationSourcesResponse, void>({
      query: () => '/integrations',
      providesTags: ['IntegrationSources'],
    }),
    
    connectIntegration: builder.mutation<IntegrationSource, ConnectIntegrationRequest>({
      query: (body) => ({
        url: '/integrations/connect',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['IntegrationSources'],
    }),
    
    disconnectIntegration: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/integrations/${id}/disconnect`,
        method: 'POST',
      }),
      invalidatesTags: ['IntegrationSources'],
    }),
    
    syncIntegration: builder.mutation<SyncIntegrationResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/integrations/${id}/sync`,
        method: 'POST',
      }),
      invalidatesTags: ['IntegrationSources'],
    }),
    
    login: builder.mutation<LoginResponse, LoginRequest>({
      queryFn: async (credentials) => {
        try {
          const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'X-API-KEY': API_KEY,
              'accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });
          
          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Login failed' }));
            return { error: { status: response.status, data: error } };
          }
          
          const data = await response.json();
          return { data };
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } };
        }
      },
    }),
  }),
});

export const {
  useGetRecentActivityQuery,
  useGetGitRecentQuery,
  useGetSprintProgressQuery,
  useGetTeamInsightsQuery,
  useGetPRBottlenecksQuery,
  useGetWorkloadDistributionQuery,
  useGetTeamMembersQuery,
  useGetUsersDetailsQuery,
  useGetIntegrationSourcesQuery,
  useConnectIntegrationMutation,
  useDisconnectIntegrationMutation,
  useSyncIntegrationMutation,
  useLoginMutation,
} = api;

export type {
  RecentActivityItem,
  RecentActivityResponse,
  GitCommit,
  PullRequest,
  GitRecentResponse,
  Sprint,
  SprintProgressResponse,
  IssuesPerUser,
  TeamMetrics,
  TeamInsightsResponse,
  PRBottleneck,
  PRBottlenecksResponse,
  WorkloadItem,
  WorkloadDistributionResponse,
  SprintLoadOverviewItem,
  FocusToday,
  SprintLoadSummary,
  TeamMember,
  TeamMembersResponse,
  IntegrationType,
  IntegrationStatus,
  IntegrationSource,
  IntegrationSourcesResponse,
  ConnectIntegrationRequest,
  SyncIntegrationResponse,
  TeamMember,
  TeamMembersResponse,
  IntegrationType,
  IntegrationStatus,
  IntegrationSource,
  IntegrationSourcesResponse,
  ConnectIntegrationRequest,
  SyncIntegrationResponse,
} from './types';


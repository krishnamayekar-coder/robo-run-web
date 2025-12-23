import { useState, useEffect, useMemo } from "react";
import { Header, TimeFilterOption } from "@/components/layout/Header";
import { TeamMetricsSummary } from "@/components/widgets/TeamMetricsSummary";
import { RiskStatsWidget } from "@/components/widgets/RiskStatsWidget";
import { SprintProgress } from "@/components/widgets/SprintProgress";
import { CurrentWorkSnapshot } from "@/components/widgets/CurrentWorkSnapshot";
import { WeeklyAnalyticsChart } from "@/components/widgets/WeeklyAnalyticsChart";
import { AISummaryInsights } from "@/components/widgets/AISummaryInsights";
import { WorkloadDistribution } from "@/components/widgets/WorkloadDistribution";
import { RecentActivity } from "@/components/widgets/RecentActivity";
import { DetailedRiskDetection } from "@/components/widgets/DetailedRiskDetection";
import { ConfluenceContributions } from "@/components/widgets/ConfluenceContributions";
import { AIAssistant } from "@/components/widgets/AIAssistant";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { CustomiseDrawer, WidgetConfig } from "@/components/CustomiseDrawer";
import { FileText, Layout, Users, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "team-metrics", name: "Team Metrics Summary", icon: "📊", visible: true, order: 0 },
  { id: "risk-stats", name: "Risk Stats Overview", icon: "⚠️", visible: true, order: 1 },
  { id: "current-work", name: "Current Work Snapshot", icon: "💼", visible: true, order: 2 },
  { id: "weekly-analytics", name: "Weekly Commit & PR Analytics", icon: "📈", visible: true, order: 3 },
  { id: "detailed-risk", name: "Detailed Risk Detection", icon: "🔍", visible: true, order: 4 },
  { id: "sprint-progress", name: "Sprint Progress", icon: "🏃", visible: true, order: 5 },
  { id: "workload", name: "Workload Distribution", icon: "👥", visible: true, order: 6 },
  { id: "ai-insights", name: "AI Summary Insights", icon: "✨", visible: true, order: 7 },
  { id: "recent-activity", name: "Recent Activity", icon: "🕐", visible: true, order: 8 },
  { id: "confluence", name: "Confluence Contributions", icon: "📝", visible: true, order: 9 },
];

const PROJECTS = [
  { id: "project-1", name: "AI Work Tracker" },
];

export default function Dashboard() {
  const [isMyDashboard, setIsMyDashboard] = useState(false);
  const [selectedProject, setSelectedProject] = useState(PROJECTS[0].id);
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>("current-sprint");
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem("dashboard-widgets");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_WIDGETS;
      }
    }
    return DEFAULT_WIDGETS;
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("dashboard-widgets", JSON.stringify(widgets));
  }, [widgets]);

  const widgetMap = useMemo(() => {
    const map: Record<string, { component: React.ReactNode; column: "left" | "right" }> = {
      "team-metrics": { component: <TeamMetricsSummary key="team-metrics" isPersonal={isMyDashboard} />, column: "left" },
      "risk-stats": { component: <RiskStatsWidget key="risk-stats" isPersonal={isMyDashboard} />, column: "left" },
      "current-work": { component: <CurrentWorkSnapshot key="current-work" isPersonal={isMyDashboard} />, column: "left" },
      "weekly-analytics": { component: <WeeklyAnalyticsChart key="weekly-analytics" isPersonal={isMyDashboard} />, column: "left" },
      "detailed-risk": { component: <DetailedRiskDetection key="detailed-risk" isPersonal={isMyDashboard} />, column: "left" },
      "sprint-progress": { component: <SprintProgress key="sprint-progress" isPersonal={isMyDashboard} />, column: "right" },
      "workload": { component: !isMyDashboard ? <WorkloadDistribution key="workload" /> : null, column: "right" },
      "ai-insights": { component: <AISummaryInsights key="ai-insights" isPersonal={isMyDashboard} />, column: "right" },
      "recent-activity": { component: <RecentActivity key="recent-activity" isPersonal={isMyDashboard} />, column: "right" },
      "confluence": { component: <ConfluenceContributions key="confluence" isPersonal={isMyDashboard} />, column: "right" },
    };
    return map;
  }, [isMyDashboard]);

  const leftWidgets = useMemo(() => {
    return widgets
      .filter(w => w.visible && widgetMap[w.id]?.column === "left")
      .sort((a, b) => a.order - b.order)
      .map(w => widgetMap[w.id]?.component)
      .filter(Boolean);
  }, [widgets, widgetMap]);

  const rightWidgets = useMemo(() => {
    return widgets
      .filter(w => w.visible && widgetMap[w.id]?.column === "right")
      .sort((a, b) => a.order - b.order)
      .map(w => widgetMap[w.id]?.component)
      .filter(Boolean);
  }, [widgets, widgetMap]);

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Your dashboard report has been generated successfully.",
    });
  };

  return (
    <>
      <Helmet>
        <title>{isMyDashboard ? "My Dashboard" : "Team Insights"} | AI WorkTracker</title>
        <meta name="description" content="AI-powered team analytics and work tracking dashboard. Monitor sprint progress, detect risks, and get actionable insights." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden transition-colors duration-300">
        <Header 
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
          projects={PROJECTS}
        />
        
        <main className="p-3 sm:p-4 md:p-6 max-w-[1600px] mx-auto w-full">
          {/* Page Title and Actions */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                {isMyDashboard ? "My Dashboard" : "Team Insights"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isMyDashboard 
                  ? "Your personal work metrics and activity" 
                  : "Overview of team performance and analytics"
                }
              </p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-3 glass-card rounded-xl px-2 sm:px-3 py-2 h-10">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Users className={`h-4 w-4 sm:h-3.5 sm:w-3.5 transition-colors cursor-pointer ${
                    !isMyDashboard ? 'text-primary' : 'text-muted-foreground'
                  }`} onClick={() => !isMyDashboard || setIsMyDashboard(false)} />
                  <Label htmlFor="dashboard-toggle" className={`hidden sm:block text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                    !isMyDashboard ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    Team Insights
                  </Label>
                </div>
                <Switch
                  id="dashboard-toggle"
                  checked={isMyDashboard}
                  onCheckedChange={setIsMyDashboard}
                  className="data-[state=checked]:bg-primary scale-90 sm:scale-100"
                />
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Label htmlFor="dashboard-toggle" className={`hidden sm:block text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                    isMyDashboard ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    My Dashboard
                  </Label>
                  <User className={`h-4 w-4 sm:h-3.5 sm:w-3.5 transition-colors cursor-pointer ${
                    isMyDashboard ? 'text-primary' : 'text-muted-foreground'
                  }`} onClick={() => isMyDashboard || setIsMyDashboard(true)} />
                </div>
              </div>

              <div
                onClick={handleGenerateReport}
                className="glass-card rounded-xl px-3 py-2 h-10 flex items-center cursor-pointer transition-all duration-300 hover:translate-y-[-1px]"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground hidden sm:inline">Generate Report</span>
                </div>
              </div>

              <div
                onClick={() => setCustomiseOpen(true)}
                className="glass-card rounded-xl px-3 py-2 h-10 flex items-center cursor-pointer transition-all duration-300 hover:translate-y-[-1px]"
              >
                <div className="flex items-center gap-2">
                  <Layout className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground hidden sm:inline">Customise</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2 cols wide */}
            <div className="lg:col-span-2 space-y-6">
              {leftWidgets.length > 0 ? (
                leftWidgets
              ) : (
                <div className="glass-widget rounded-2xl p-8 text-center">
                  <p className="text-muted-foreground">No widgets visible. Customise your dashboard to add sections.</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {rightWidgets.length > 0 ? (
                rightWidgets
              ) : (
                <div className="glass-widget rounded-2xl p-8 text-center">
                  <p className="text-muted-foreground">No widgets visible. Customise your dashboard to add sections.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <AIAssistant />
        
        <CustomiseDrawer
          open={customiseOpen}
          onOpenChange={setCustomiseOpen}
          widgets={widgets}
          onWidgetsChange={setWidgets}
          defaultWidgets={DEFAULT_WIDGETS}
        />
      </div>
    </>
  );
}

import { useState, useEffect, useMemo } from "react";
import { Header, TimeFilterOption } from "@/components/layout/Header";
import { TeamMetricsSummary } from "@/components/widgets/TeamMetricsSummary";
import { RiskStatsWidget } from "@/components/widgets/RiskStatsWidget";
import { SprintProgress } from "@/components/widgets/SprintProgress";
import { CurrentWorkSnapshot } from "@/components/widgets/CurrentWorkSnapshot";
import { WeeklyAnalyticsChart } from "@/components/widgets/WeeklyAnalyticsChart";
import { AISummaryInsights } from "@/components/widgets/AISummaryInsights";
import { WorkloadDistribution } from "@/components/widgets/WorkloadDistribution";
// import { RecentActivity } from "@/components/widgets/RecentActivity";
import { DetailedRiskDetection } from "@/components/widgets/DetailedRiskDetection";
import { ConfluenceContributions } from "@/components/widgets/ConfluenceContributions";
import { AIAssistant } from "@/components/widgets/AIAssistant";
import { IntegrationSources } from "@/components/widgets/IntegrationSources";
import { TeamMembers } from "@/components/widgets/TeamMembers";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { CustomiseDrawer, WidgetConfig } from "@/components/CustomiseDrawer";
import { FileText, Layout, Users, User, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLazyGenerateReportQuery } from "@/store/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: "team-metrics",
    name: "Team Metrics Summary",
    icon: "📊",
    visible: true,
    order: 0,
  },
  {
    id: "risk-stats",
    name: "Risk Stats Overview",
    icon: "⚠️",
    visible: true,
    order: 1,
  },
  {
    id: "current-work",
    name: "Current Work Snapshot",
    icon: "💼",
    visible: true,
    order: 2,
  },
  {
    id: "weekly-analytics",
    name: "Weekly Commit & PR Analytics",
    icon: "📈",
    visible: true,
    order: 3,
  },
  {
    id: "detailed-risk",
    name: "Detailed Risk Detection",
    icon: "🔍",
    visible: true,
    order: 4,
  },
  {
    id: "sprint-progress",
    name: "Sprint Progress",
    icon: "🏃",
    visible: true,
    order: 5,
  },
  {
    id: "workload",
    name: "Workload Distribution",
    icon: "👥",
    visible: true,
    order: 6,
  },
  {
    id: "ai-insights",
    name: "AI Summary Insights",
    icon: "✨",
    visible: true,
    order: 7,
  },
  // { id: "recent-activity", name: "Recent Activity", icon: "🕐", visible: true, order: 8 },
  {
    id: "confluence",
    name: "Confluence Contributions",
    icon: "📝",
    visible: true,
    order: 9,
  },
  {
    id: "team-members",
    name: "Team Members",
    icon: "👥",
    visible: true,
    order: 10,
  },
  {
    id: "integrations",
    name: "Integration Sources",
    icon: "🔌",
    visible: true,
    order: 11,
  },
];

const PROJECTS = [{ id: "project-1", name: "Activity Tracker" }];

export default function Dashboard() {
  const [isMyDashboard, setIsMyDashboard] = useState(false);
  const [selectedProject, setSelectedProject] = useState(PROJECTS[0].id);
  const [customiseOpen, setCustomiseOpen] = useState(false);
  const [timeFilter, setTimeFilter] =
    useState<TimeFilterOption>("current-sprint");
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
  const [generateReport, { isLoading: isGeneratingReport }] =
    useLazyGenerateReportQuery();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isDetailed, setIsDetailed] = useState(false);

  useEffect(() => {
    localStorage.setItem("dashboard-widgets", JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const endOfYear = new Date(currentDate.getFullYear(), 11, 31);
    setStartDate(startOfYear);
    setEndDate(endOfYear);
  }, []);

  const widgetMap = useMemo(() => {
    const map: Record<
      string,
      { component: React.ReactNode; column: "left" | "right" | "bottom" }
    > = {
      "team-metrics": {
        component: (
          <TeamMetricsSummary key="team-metrics" isPersonal={isMyDashboard} />
        ),
        column: "left",
      },
      "risk-stats": {
        component: (
          <RiskStatsWidget key="risk-stats" isPersonal={isMyDashboard} />
        ),
        column: "left",
      },
      "current-work": {
        component: (
          <CurrentWorkSnapshot key="current-work" isPersonal={isMyDashboard} />
        ),
        column: "left",
      },
      "weekly-analytics": {
        component: (
          <WeeklyAnalyticsChart
            key="weekly-analytics"
            isPersonal={isMyDashboard}
          />
        ),
        column: "left",
      },
      "detailed-risk": {
        component: (
          <DetailedRiskDetection
            key="detailed-risk"
            isPersonal={isMyDashboard}
          />
        ),
        column: "left",
      },
      "sprint-progress": {
        component: (
          <SprintProgress key="sprint-progress" isPersonal={isMyDashboard} />
        ),
        column: "right",
      },
      workload: {
        component: !isMyDashboard ? (
          <WorkloadDistribution key="workload" />
        ) : null,
        column: "right",
      },
      "ai-insights": {
        component: (
          <AISummaryInsights key="ai-insights" isPersonal={isMyDashboard} />
        ),
        column: "right",
      },
      // "recent-activity": { component: <RecentActivity key="recent-activity" isPersonal={isMyDashboard} />, column: "right" },
      confluence: {
        component: (
          <ConfluenceContributions
            key="confluence"
            isPersonal={isMyDashboard}
          />
        ),
        column: "right",
      },
      integrations: {
        component: <IntegrationSources key="integrations" />,
        column: "bottom",
      },
      "team-members": {
        component: (
          <TeamMembers key="team-members" projectId={selectedProject} />
        ),
        column: "bottom",
      },
    };
    return map;
  }, [isMyDashboard, selectedProject]);

  const leftWidgets = useMemo(() => {
    return widgets
      .filter((w) => w.visible && widgetMap[w.id]?.column === "left")
      .sort((a, b) => a.order - b.order)
      .map((w) => widgetMap[w.id]?.component)
      .filter(Boolean);
  }, [widgets, widgetMap]);

  const rightWidgets = useMemo(() => {
    return widgets
      .filter((w) => w.visible && widgetMap[w.id]?.column === "right")
      .sort((a, b) => a.order - b.order)
      .map((w) => widgetMap[w.id]?.component)
      .filter(Boolean);
  }, [widgets, widgetMap]);

  const bottomWidgets = useMemo(() => {
    return widgets
      .filter((w) => w.visible && widgetMap[w.id]?.column === "bottom")
      .sort((a, b) => a.order - b.order)
      .map((w) => widgetMap[w.id]?.component)
      .filter(Boolean);
  }, [widgets, widgetMap]);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await generateReport({
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        is_detailed: isDetailed,
      }).unwrap();

      const data = (response as any).data || response;

      const pdf = new jsPDF();
      let yPosition = 20;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const maxWidth = pdf.internal.pageSize.width - 2 * margin;

      const addPageIfNeeded = () => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      pdf.setFontSize(18);
      pdf.setFont(undefined, "bold");
      pdf.text("Activity Tracker Report", margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont(undefined, "normal");
      pdf.text(
        `Period: ${format(startDate, "PPP")} to ${format(endDate, "PPP")}`,
        margin,
        yPosition
      );
      yPosition += 5;
      pdf.text(
        `Report Type: ${isDetailed ? "Detailed" : "Summary"}`,
        margin,
        yPosition
      );
      yPosition += 10;

      if (data.jira_issues && Array.isArray(data.jira_issues)) {
        addPageIfNeeded();
        pdf.setFontSize(14);
        pdf.setFont(undefined, "bold");
        pdf.text("Jira Issues", margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.setFont(undefined, "normal");

        const header = [
          "ID",
          "Ticket",
          "Status",
          "Priority",
          "Assignee",
          "Reporter",
        ];
        const colWidths = [15, 40, 30, 25, 35, 35];
        let xPos = margin;

        pdf.setFont(undefined, "bold");
        header.forEach((text, i) => {
          pdf.text(text, xPos, yPosition);
          xPos += colWidths[i];
        });
        yPosition += 6;

        pdf.setFont(undefined, "normal");
        const jiraIssues = isDetailed
          ? data.jira_issues
          : data.jira_issues.slice(0, 20);

        jiraIssues.forEach((issue: any[]) => {
          addPageIfNeeded();
          xPos = margin;
          const issueId = String(issue[0] || "N/A");
          const ticket = String(issue[1] || "N/A");
          const status = String(issue[2] || "N/A");
          const priority = String(issue[3] || "N/A");
          const assignee = String(issue[5] || "N/A");
          const reporter = String(issue[6] || "N/A");

          pdf.text(issueId.substring(0, 10), xPos, yPosition);
          xPos += colWidths[0];
          pdf.text(ticket.substring(0, 20), xPos, yPosition);
          xPos += colWidths[1];
          pdf.text(status.substring(0, 15), xPos, yPosition);
          xPos += colWidths[2];
          pdf.text(priority.substring(0, 12), xPos, yPosition);
          xPos += colWidths[3];
          pdf.text(assignee.substring(0, 17), xPos, yPosition);
          xPos += colWidths[4];
          pdf.text(reporter.substring(0, 17), xPos, yPosition);
          yPosition += 6;
        });
        yPosition += 5;
      }

      if (
        data.github_pull_requests &&
        Array.isArray(data.github_pull_requests)
      ) {
        addPageIfNeeded();
        pdf.setFontSize(14);
        pdf.setFont(undefined, "bold");
        pdf.text("GitHub Pull Requests", margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.setFont(undefined, "normal");

        const header = ["PR #", "Title", "State", "Author", "Merged"];
        const colWidths = [20, 80, 25, 30, 20];
        let xPos = margin;

        pdf.setFont(undefined, "bold");
        header.forEach((text, i) => {
          pdf.text(text, xPos, yPosition);
          xPos += colWidths[i];
        });
        yPosition += 6;

        pdf.setFont(undefined, "normal");
        const prs = isDetailed
          ? data.github_pull_requests
          : data.github_pull_requests.slice(0, 20);

        prs.forEach((pr: any[]) => {
          addPageIfNeeded();
          xPos = margin;
          const prNumber = String(pr[3] || "N/A");
          const title = String(pr[4] || "N/A");
          const state = String(pr[6] || "N/A");
          const author = String(pr[7] || "N/A");
          const merged = pr[9] ? "Yes" : "No";

          pdf.text(prNumber, xPos, yPosition);
          xPos += colWidths[0];
          pdf.text(title.substring(0, 40), xPos, yPosition);
          xPos += colWidths[1];
          pdf.text(state, xPos, yPosition);
          xPos += colWidths[2];
          pdf.text(author.substring(0, 15), xPos, yPosition);
          xPos += colWidths[3];
          pdf.text(merged, xPos, yPosition);
          yPosition += 6;
        });
        yPosition += 5;
      }

      if (
        data.jira_sprint_progress &&
        Array.isArray(data.jira_sprint_progress)
      ) {
        addPageIfNeeded();
        pdf.setFontSize(14);
        pdf.setFont(undefined, "bold");
        pdf.text("Sprint Progress", margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.setFont(undefined, "normal");

        const header = ["Sprint Name", "State", "Start Date", "End Date"];
        const colWidths = [60, 30, 40, 40];
        let xPos = margin;

        pdf.setFont(undefined, "bold");
        header.forEach((text, i) => {
          pdf.text(text, xPos, yPosition);
          xPos += colWidths[i];
        });
        yPosition += 6;

        pdf.setFont(undefined, "normal");
        const sprints = isDetailed
          ? data.jira_sprint_progress
          : data.jira_sprint_progress.slice(0, 20);

        sprints.forEach((sprint: any[]) => {
          addPageIfNeeded();
          xPos = margin;
          const sprintName = String(sprint[3] || "N/A");
          const state = String(sprint[4] || "N/A");
          const startDate = sprint[5]
            ? format(new Date(sprint[5]), "MMM dd, yyyy")
            : "N/A";
          const endDate = sprint[6]
            ? format(new Date(sprint[6]), "MMM dd, yyyy")
            : "N/A";

          pdf.text(sprintName.substring(0, 30), xPos, yPosition);
          xPos += colWidths[0];
          pdf.text(state, xPos, yPosition);
          xPos += colWidths[1];
          pdf.text(startDate, xPos, yPosition);
          xPos += colWidths[2];
          pdf.text(endDate, xPos, yPosition);
          yPosition += 6;
        });
      }

      const fileName = `activity-report-${format(
        startDate,
        "yyyy-MM-dd"
      )}-to-${format(endDate, "yyyy-MM-dd")}.pdf`;
      pdf.save(fileName);

    toast({
      title: "Report Generated",
        description: `Your ${
          isDetailed ? "detailed" : "summary"
        } report has been downloaded successfully.`,
      });

      setReportDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.data?.message ||
          error?.message ||
          "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {isMyDashboard ? "My Dashboard" : "Team Insights"} | Activity Tracker
        </title>
        <meta
          name="description"
          content="AI-powered team analytics and work tracking dashboard. Monitor sprint progress, detect risks, and get actionable insights."
        />
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
                  : "Overview of team performance and analytics"}
              </p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-3 glass-card rounded-xl px-2 sm:px-3 py-2 h-10">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Users
                    className={`h-4 w-4 sm:h-3.5 sm:w-3.5 transition-colors cursor-pointer ${
                      !isMyDashboard ? "text-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => !isMyDashboard || setIsMyDashboard(false)}
                  />
                  <Label
                    htmlFor="dashboard-toggle"
                    className={`hidden sm:block text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                      !isMyDashboard
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    Team Insights
                  </Label>
                </div>
                <Switch
                  id="dashboard-toggle"
                  checked={isMyDashboard}
                  onCheckedChange={setIsMyDashboard}
                  disabled
                  className="data-[state=checked]:bg-primary scale-90 sm:scale-100"
                />
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Label
                    htmlFor="dashboard-toggle"
                    className={`hidden sm:block text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                      isMyDashboard
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    My Dashboard
                  </Label>
                  <User
                    className={`h-4 w-4 sm:h-3.5 sm:w-3.5 transition-colors cursor-pointer ${
                      isMyDashboard ? "text-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => isMyDashboard || setIsMyDashboard(true)}
                  />
                </div>
              </div>

              <div
                onClick={() => setReportDialogOpen(true)}
                className="glass-card rounded-xl px-3 py-2 h-10 flex items-center cursor-pointer transition-all duration-300 hover:translate-y-[-1px]"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground hidden sm:inline">
                    Generate Report
                  </span>
                </div>
              </div>

              <div
                onClick={() => setCustomiseOpen(true)}
                className="glass-card rounded-xl px-3 py-2 h-10 flex items-center cursor-pointer transition-all duration-300 hover:translate-y-[-1px]"
              >
                <div className="flex items-center gap-2">
                  <Layout className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground hidden sm:inline">
                    Customise
                  </span>
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
                  <p className="text-muted-foreground">
                    No widgets visible. Customise your dashboard to add
                    sections.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {rightWidgets.length > 0 ? (
                rightWidgets
              ) : (
                <div className="glass-widget rounded-2xl p-8 text-center">
                  <p className="text-muted-foreground">
                    No widgets visible. Customise your dashboard to add
                    sections.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section - Full width horizontal layout */}
          {bottomWidgets.length > 0 && (
            <div className="mt-6 space-y-6">{bottomWidgets}</div>
          )}
        </main>

        <AIAssistant />
        
        <CustomiseDrawer
          open={customiseOpen}
          onOpenChange={setCustomiseOpen}
          widgets={widgets}
          onWidgetsChange={setWidgets}
          defaultWidgets={DEFAULT_WIDGETS}
        />

        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Generate Activity Tracker Report
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Select the date range and report type for your activity tracker
                report.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-date" className="text-sm font-medium">
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="start-date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-date" className="text-sm font-medium">
                    End Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="end-date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <Checkbox
                  id="detailed-report"
                  checked={isDetailed}
                  onCheckedChange={(checked) => setIsDetailed(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="detailed-report"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Generate Detailed PDF
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Include complete data list (Summary includes top 20 items
                    per section)
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setReportDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport || !startDate || !endDate}
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

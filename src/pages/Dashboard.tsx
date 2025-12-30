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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";

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
  { id: "integrations", name: "Integration Sources", icon: "🔌", visible: true, order: 10 },
  { id: "team-members", name: "Team Members", icon: "👥", visible: true, order: 11 },
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
  const [generateReport, { isLoading: isGeneratingReport }] = useLazyGenerateReportQuery();
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
      "integrations": { component: <IntegrationSources key="integrations" isPersonal={isMyDashboard} />, column: "right" },
      "team-members": { component: <TeamMembers key="team-members" projectId={selectedProject} isPersonal={isMyDashboard} />, column: "right" },
    };
    return map;
  }, [isMyDashboard, selectedProject]);

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

  const generatePDFFromData = (reportData: any, isDetailed: boolean, fromDate: Date, toDate: Date) => {
    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const lineHeight = 6;

    const addNewPage = () => {
      doc.addPage();
      yPos = 20;
    };

    const checkPageBreak = (requiredSpace: number = 15) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        addNewPage();
      }
    };

    const addSectionHeader = (text: string, fontSize: number = 14) => {
      checkPageBreak(20);
      doc.setFontSize(fontSize);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(31, 81, 255);
      doc.text(text, margin, yPos);
      yPos += lineHeight * 1.5;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += lineHeight * 1.5;
      doc.setTextColor(0, 0, 0);
    };

    const addSubHeader = (text: string) => {
      checkPageBreak(15);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(text, margin + 5, yPos);
      yPos += lineHeight * 1.2;
    };

    const addTableRow = (columns: string[], columnWidths: number[], isHeader: boolean = false) => {
      checkPageBreak(10);
      const startX = margin + 5;
      let xPos = startX;
      
      doc.setFontSize(8);
      doc.setFont(undefined, isHeader ? 'bold' : 'normal');
      if (isHeader) {
        doc.setFillColor(240, 240, 240);
        doc.rect(startX - 2, yPos - 5, pageWidth - 2 * margin - 10, lineHeight + 2, 'F');
      }
      
      columns.forEach((text, index) => {
        const width = columnWidths[index];
        doc.text(text.substring(0, 25), xPos, yPos);
        xPos += width;
      });
      yPos += lineHeight + 2;
    };

    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(31, 81, 255);
    doc.text("Activity Tracker Report", margin, yPos);
    yPos += lineHeight * 2;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Type: ${isDetailed ? 'Detailed' : 'Summary'}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Period: ${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`, margin, yPos);
    yPos += lineHeight * 2;
    if (startDate && endDate) {
      doc.text(`Period: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`, margin, yPos);
      yPos += lineHeight * 2;
    }
    doc.setTextColor(0, 0, 0);

    const maxItems = isDetailed ? 1000 : 20;

    if (reportData.data.jira_issues && reportData.data.jira_issues.length > 0) {
      addSectionHeader("Jira Issues", 14);
      const issuesToShow = isDetailed ? reportData.data.jira_issues : reportData.data.jira_issues.slice(0, maxItems);
      const columnWidths = [25, 30, 25, 20, 35, 40];
      addTableRow(['Issue ID', 'Status', 'Priority', 'Assignee', 'Reporter', 'Last Updated'], columnWidths, true);
      
      issuesToShow.forEach((issue: any[]) => {
        const issueId = issue[1] || 'N/A';
        const status = issue[2] || 'N/A';
        const priority = issue[3] || 'N/A';
        const assignee = issue[5] || 'Unassigned';
        const reporter = issue[6] || 'N/A';
        const lastUpdate = issue[9] ? format(new Date(issue[9]), 'MMM dd, yyyy') : 'N/A';
        addTableRow([issueId, status, priority, assignee.substring(0, 15), reporter.substring(0, 15), lastUpdate], columnWidths);
      });
      
      if (!isDetailed && reportData.data.jira_issues.length > maxItems) {
        checkPageBreak(10);
        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(`... and ${reportData.data.jira_issues.length - maxItems} more issues (Select Detailed Report for full list)`, margin + 5, yPos);
        yPos += lineHeight * 1.5;
        doc.setTextColor(0, 0, 0);
      }
      yPos += lineHeight;
    }

    if (reportData.data.github_pull_requests && reportData.data.github_pull_requests.length > 0) {
      addSectionHeader("GitHub Pull Requests", 14);
      const prsToShow = isDetailed ? reportData.data.github_pull_requests : reportData.data.github_pull_requests.slice(0, maxItems);
      const columnWidths = [20, 45, 25, 25, 30];
      addTableRow(['PR #', 'Title', 'State', 'Merged', 'Author'], columnWidths, true);
      
      prsToShow.forEach((pr: any[]) => {
        const prNumber = pr[3] || 'N/A';
        const title = (pr[4] || 'N/A').substring(0, 30);
        const state = pr[5] || 'N/A';
        const merged = pr[9] ? 'Yes' : 'No';
        const author = pr[7] || 'N/A';
        const date = pr[10] ? format(new Date(pr[10]), 'MMM dd, yyyy') : 'N/A';
        addTableRow([`#${prNumber}`, title, state, merged, author], columnWidths);
      });
      yPos += lineHeight;
    }

    if (reportData.data.jira_sprint_progress && reportData.data.jira_sprint_progress.length > 0) {
      addSectionHeader("Sprint Progress", 14);
      const sprintsToShow = isDetailed ? reportData.data.jira_sprint_progress : reportData.data.jira_sprint_progress.slice(0, maxItems);
      const columnWidths = [50, 25, 35, 35];
      addTableRow(['Sprint Name', 'State', 'Start Date', 'End Date'], columnWidths, true);
      
      sprintsToShow.forEach((sprint: any[]) => {
        const sprintName = sprint[3] || 'N/A';
        const state = sprint[4] || 'N/A';
        const start = sprint[5] ? format(new Date(sprint[5]), 'MMM dd, yyyy') : 'N/A';
        const end = sprint[6] ? format(new Date(sprint[6]), 'MMM dd, yyyy') : 'N/A';
        addTableRow([sprintName, state, start, end], columnWidths);
      });
      yPos += lineHeight;
    }

    if (!isDetailed) {
      checkPageBreak(15);
      doc.setFontSize(9);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text("Note: This is a summary report. Select 'Detailed PDF' option for complete data.", margin, yPos);
    }

    return doc;
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fromDateStr = format(startDate, 'yyyy-MM-dd');
      const toDateStr = format(endDate, 'yyyy-MM-dd');
      
      const result = await generateReport({
        from_date: fromDateStr,
        to_date: toDateStr,
        type: 'full',
      }).unwrap();
      
      const pdfDoc = generatePDFFromData(result, isDetailed, startDate, endDate);
      const filename = `activity-tracker-report-${fromDateStr}-to-${toDateStr}-${isDetailed ? 'detailed' : 'summary'}.pdf`;
      pdfDoc.save(filename);
      
      setReportDialogOpen(false);
    toast({
      title: "Report Generated",
        description: `Your ${isDetailed ? 'detailed' : 'summary'} report has been downloaded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
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
                onClick={() => setReportDialogOpen(true)}
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

        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Generate Activity Tracker Report</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Select the date range and report type for your activity tracker report.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-date" className="text-sm font-medium">Start Date</Label>
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
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
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
                  <Label htmlFor="end-date" className="text-sm font-medium">End Date</Label>
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
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
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
                    Include complete data list (Summary includes top 20 items per section)
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateReport} disabled={isGeneratingReport || !startDate || !endDate}>
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

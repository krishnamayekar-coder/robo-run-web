import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, AlertTriangle, AlertCircle, ChevronRight, Lightbulb, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetPRBottlenecksQuery } from "@/store/api";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
  type: string;
  impactScore: number;
  mitigation: string;
  url?: string;
  state?: string;
}

interface DetailedRiskDetectionProps {
  isPersonal?: boolean;
}

function getSeverityFromIdleDays(idleDays: number): "critical" | "high" | "medium" {
  if (idleDays >= 7) return "critical";
  if (idleDays >= 3) return "high";
  return "medium";
}

function calculateImpactScore(idleDays: number, totalChanges: number): number {
  const idleScore = Math.min(idleDays * 7, 50);
  const changeScore = Math.min(totalChanges / 10, 30);
  const criticalBonus = idleDays >= 7 ? 20 : 0;
  return Math.min(Math.round(idleScore + changeScore + criticalBonus), 100);
}

function getMitigation(idleDays: number, state: string): string {
  if (state === "closed") return "PR has been closed";
  if (idleDays >= 7) return "Urgent: Request immediate review or assign additional reviewers";
  if (idleDays >= 3) return "Request review from team lead or break into smaller PRs";
  return "Follow up with reviewers to unblock";
}

export function DetailedRiskDetection({ isPersonal = false }: DetailedRiskDetectionProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: bottlenecksData, isLoading } = useGetPRBottlenecksQuery();

  const allRisks: RiskItem[] = (bottlenecksData?.bottlenecks || [])
    .map((pr) => ({
      id: `pr-${pr.pr_number}`,
      title: `PR #${pr.pr_number}: ${pr.title}`,
      description: `Idle for ${pr.idle_days} days • ${pr.commits} commits • ${pr.files_changed} files changed • ${pr.total_changes} total changes`,
      severity: getSeverityFromIdleDays(pr.idle_days),
      type: "PR Bottleneck",
      impactScore: calculateImpactScore(pr.idle_days, pr.total_changes),
      mitigation: getMitigation(pr.idle_days, pr.state),
      url: pr.url,
      state: pr.state, // Include state for conditional rendering
    }))
    .sort((a, b) => {
      // Sort open PRs first, then by impact score
      if (a.state === "open" && b.state !== "open") return -1;
      if (a.state !== "open" && b.state === "open") return 1;
      return b.impactScore - a.impactScore;
    });

  const displayRisks = allRisks.slice(0, 3);

  const severityConfig = {
    critical: { icon: AlertOctagon, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
    high: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
    medium: { icon: AlertCircle, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  };

  return (
    <div className="widget animate-fade-in stagger-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="widget-title mb-0">
          <AlertOctagon className="h-4 w-4 text-destructive" />
          {isPersonal ? "My Risk Detection" : "Detailed Risk Detection"}
        </h2>
        <div className="flex gap-2">
          {["critical", "high", "medium"].map((sev) => {
            // Only count open PRs in badges
            const count = allRisks.filter((r) => r.severity === sev && r.state === "open").length;
            if (count === 0) return null;
            const config = severityConfig[sev as keyof typeof severityConfig];
            return (
              <Badge key={sev} variant="outline" className={`text-[10px] ${config.bg} ${config.color} ${config.border}`}>
                {count} {sev}
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-sm text-muted-foreground p-3 text-center">
            Loading risk analysis...
          </div>
        ) : displayRisks.length === 0 ? (
          <div className="text-sm text-muted-foreground p-3 text-center">
            No risks detected. All PRs are up to date.
          </div>
        ) : (
          displayRisks.map((risk) => {
          const config = severityConfig[risk.severity];
          const Icon = config.icon;

          return (
            <div 
              key={risk.id} 
              className={`p-4 rounded-lg border ${config.border} ${config.bg} transition-all hover:shadow-sm cursor-pointer group`}
              onClick={() => risk.url && window.open(risk.url, '_blank')}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{risk.title}</span>
                      <Badge variant="secondary" className="text-[10px]">{risk.type}</Badge>
                      {risk.state === "closed" && (
                        <Badge variant="outline" className="text-[10px] bg-muted">Closed</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{risk.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${config.color}`}>{risk.impactScore}</div>
                  <div className="text-[10px] text-muted-foreground">Impact Score</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground flex-1">{risk.mitigation}</span>
                {risk.url ? (
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </div>
            </div>
          );
        }))}
      </div>

      {allRisks.length > 0 && (
        <Button 
          variant="outline" 
          className="w-full mt-4 text-sm"
          onClick={() => setIsDrawerOpen(true)}
        >
          View All Risks →
        </Button>
      )}

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-destructive" />
              {isPersonal ? "My Risk Detection" : "All Risk Detection"}
            </DrawerTitle>
            <DrawerDescription>
              Showing all PR bottlenecks and risks ({allRisks.length} total)
            </DrawerDescription>
          </DrawerHeader>
          
          <ScrollArea className="h-[60vh] px-4">
            <div className="space-y-3 pb-4">
              {isLoading ? (
                <div className="text-sm text-muted-foreground p-3 text-center">
                  Loading risk analysis...
                </div>
              ) : allRisks.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 text-center">
                  No risks detected. All PRs are up to date.
                </div>
              ) : (
                allRisks.map((risk) => {
                  const config = severityConfig[risk.severity];
                  const Icon = config.icon;

                  return (
                    <div 
                      key={risk.id} 
                      className={`p-4 rounded-lg border ${config.border} ${config.bg} transition-all hover:shadow-sm cursor-pointer group`}
                      onClick={() => risk.url && window.open(risk.url, '_blank')}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{risk.title}</span>
                              <Badge variant="secondary" className="text-[10px]">{risk.type}</Badge>
                              {risk.state === "closed" && (
                                <Badge variant="outline" className="text-[10px] bg-muted">Closed</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{risk.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${config.color}`}>{risk.impactScore}</div>
                          <div className="text-[10px] text-muted-foreground">Impact Score</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                        <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground flex-1">{risk.mitigation}</span>
                        {risk.url ? (
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

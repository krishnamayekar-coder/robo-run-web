import { FileText, Edit, Users, Clock, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Contributor {
  name: string;
  avatar?: string;
  initials: string;
  contributions: number;
}

interface RecentPage {
  title: string;
  author: string;
  updatedAt: string;
  type: "created" | "edited";
}

interface ConfluenceContributionsProps {
  isPersonal?: boolean;
}

export function ConfluenceContributions({ isPersonal = false }: ConfluenceContributionsProps) {
  const stats = { pagesCreated: 0, pagesEdited: 0 };
  const topContributors: Contributor[] = [];
  const recentPages: RecentPage[] = [];

  return (
    <div className="widget animate-fade-in stagger-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="widget-title mb-0">
          <FileText className="h-4 w-4 text-primary" />
          {isPersonal ? "My Confluence Activity" : "Confluence Contributions"}
        </h2>
        {stats.pagesCreated > 0 || stats.pagesEdited > 0 ? (
          <Badge variant="outline" className="text-[10px] gap-1">
            <TrendingUp className="h-3 w-3 text-success" />
            Activity
          </Badge>
        ) : null}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="p-3 rounded-lg glass-card">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Pages Created</span>
          </div>
          <div className="stat-value text-xl">{stats.pagesCreated}</div>
        </div>
        <div className="p-3 rounded-lg glass-card">
          <div className="flex items-center gap-2 mb-1">
            <Edit className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Pages Edited</span>
          </div>
          <div className="stat-value text-xl">{stats.pagesEdited}</div>
        </div>
      </div>

      {/* Top Contributors */}
      {!isPersonal && topContributors.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Top Contributors</span>
          </div>
          <div className="flex items-center gap-3">
            {topContributors.map((contributor, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded-lg glass-card">
                <Avatar className="h-7 w-7 border border-border">
                  <AvatarImage src={contributor.avatar} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{contributor.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xs font-medium text-foreground">{contributor.name}</div>
                  <div className="text-[10px] text-muted-foreground">{contributor.contributions} pages</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Pages */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recently Updated</span>
        </div>
        <div className="space-y-2">
          {recentPages.length === 0 ? (
            <div className="text-sm text-muted-foreground p-3 text-center">
              No recent Confluence activity
            </div>
          ) : (
            recentPages.map((page, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md ${page.type === 'created' ? 'bg-success/10' : 'bg-primary/10'}`}>
                  {page.type === 'created' 
                    ? <FileText className="h-3.5 w-3.5 text-success" />
                    : <Edit className="h-3.5 w-3.5 text-primary" />
                  }
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{page.title}</div>
                  <div className="text-[10px] text-muted-foreground">by {page.author}</div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{page.updatedAt}</span>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}

import { Plug, CheckCircle2, LayoutGrid, Github, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const INTEGRATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  jira: LayoutGrid,
  github: Github,
  confluence: BookOpen,
};

const STATIC_INTEGRATIONS = [
  {
    id: "jira",
    type: "jira",
    name: "Jira",
    status: "connected",
  },
  {
    id: "github",
    type: "github",
    name: "GitHub",
    status: "connected",
  },
  {
    id: "confluence",
    type: "confluence",
    name: "Confluence",
    status: "connected",
  },
];

function getStatusColor(status: string): string {
  switch (status) {
    case "connected":
      return "bg-success/10 text-success border-success/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function IntegrationSources() {
  return (
    <div className="widget animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="widget-title mb-0">
          <Plug className="h-4 w-4 text-primary" />
          Integration Sources
        </h2>
        <Badge variant="outline">
          {STATIC_INTEGRATIONS.length} apps
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {STATIC_INTEGRATIONS.map((integration) => {
          const IconComponent = INTEGRATION_ICONS[integration.type];
          return (
            <Card key={integration.id} className="p-3 glass-card border border-border/50 hover:border-primary/50 hover:shadow-sm transition-all">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-full">
                  <IconComponent className="h-12 w-12 text-primary" />
                </div>
                <div className="w-full text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-foreground capitalize">{integration.name}</h3>
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${getStatusColor(integration.status)}`}
                  >
                    {integration.status}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


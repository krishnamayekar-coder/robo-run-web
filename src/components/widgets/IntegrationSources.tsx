import { useState } from "react";
import { Plug, CheckCircle2, XCircle, AlertCircle, RefreshCw, Settings, Loader2 } from "lucide-react";
import { 
  useGetIntegrationSourcesQuery, 
  useConnectIntegrationMutation, 
  useDisconnectIntegrationMutation,
  useSyncIntegrationMutation 
} from "@/store/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import type { IntegrationType, IntegrationSource, IntegrationSourcesResponse } from "@/store/types";
import { formatDistanceToNow } from "date-fns";

const INTEGRATION_ICONS: Record<IntegrationType, string> = {
  jira: "🔷",
  github: "🐙",
  confluence: "📘",
  slack: "💬",
  gitlab: "🦊",
};

const INTEGRATION_NAMES: Record<IntegrationType, string> = {
  jira: "Jira",
  github: "GitHub",
  confluence: "Confluence",
  slack: "Slack",
  gitlab: "GitLab",
};

interface ConnectDialogProps {
  integrationType: IntegrationType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (config: Record<string, any>) => void;
  isLoading: boolean;
}

function ConnectDialog({ integrationType, open, onOpenChange, onConnect, isLoading }: ConnectDialogProps) {
  const [config, setConfig] = useState<Record<string, any>>({});

  const getConfigFields = () => {
    switch (integrationType) {
      case "jira":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="base_url">Base URL</Label>
              <Input
                id="base_url"
                placeholder="https://your-company.atlassian.net"
                value={config.base_url || ""}
                onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace">Workspace</Label>
              <Input
                id="workspace"
                placeholder="your-workspace"
                value={config.workspace || ""}
                onChange={(e) => setConfig({ ...config, workspace: e.target.value })}
              />
            </div>
          </>
        );
      case "github":
      case "gitlab":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                placeholder="your-org"
                value={config.organization || ""}
                onChange={(e) => setConfig({ ...config, organization: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repository">Repository (optional)</Label>
              <Input
                id="repository"
                placeholder="repo-name"
                value={config.repository || ""}
                onChange={(e) => setConfig({ ...config, repository: e.target.value })}
              />
            </div>
          </>
        );
      case "confluence":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="base_url">Base URL</Label>
              <Input
                id="base_url"
                placeholder="https://your-company.atlassian.net"
                value={config.base_url || ""}
                onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace">Workspace</Label>
              <Input
                id="workspace"
                placeholder="your-workspace"
                value={config.workspace || ""}
                onChange={(e) => setConfig({ ...config, workspace: e.target.value })}
              />
            </div>
          </>
        );
      case "slack":
        return (
          <div className="space-y-2">
            <Label htmlFor="workspace">Workspace</Label>
            <Input
              id="workspace"
              placeholder="your-workspace"
              value={config.workspace || ""}
              onChange={(e) => setConfig({ ...config, workspace: e.target.value })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleConnect = () => {
    onConnect(config);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect {INTEGRATION_NAMES[integrationType]}</DialogTitle>
          <DialogDescription>
            Configure your {INTEGRATION_NAMES[integrationType]} integration settings
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {getConfigFields()}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case "connected":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case "syncing":
      return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
    default:
      return <XCircle className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "connected":
      return "bg-success/10 text-success border-success/20";
    case "error":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "syncing":
      return "bg-primary/10 text-primary border-primary/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

interface IntegrationSourcesProps {
  isPersonal?: boolean;
}

export function IntegrationSources({ isPersonal = true }: IntegrationSourcesProps) {
  const { data, isLoading, error } = useGetIntegrationSourcesQuery();
  const [connectIntegration, { isLoading: isConnecting }] = useConnectIntegrationMutation();
  const [disconnectIntegration, { isLoading: isDisconnecting }] = useDisconnectIntegrationMutation();
  const [syncIntegration, { isLoading: isSyncing }] = useSyncIntegrationMutation();
  const { toast } = useToast();
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<IntegrationType | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleConnect = async (type: IntegrationType, config: Record<string, any>) => {
    try {
      await connectIntegration({
        type,
        config,
      }).unwrap();
      toast({
        title: "Success",
        description: `${INTEGRATION_NAMES[type]} integration connected successfully`,
      });
      setConnectDialogOpen(false);
      setSelectedType(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || `Failed to connect ${INTEGRATION_NAMES[type]}`,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (id: string, name: string) => {
    try {
      await disconnectIntegration({ id }).unwrap();
      toast({
        title: "Success",
        description: `${name} integration disconnected successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to disconnect integration",
        variant: "destructive",
      });
    }
  };

  const handleSync = async (id: string, name: string) => {
    setSyncingId(id);
    try {
      await syncIntegration({ id }).unwrap();
      toast({
        title: "Success",
        description: `${name} integration synced successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to sync integration",
        variant: "destructive",
      });
    } finally {
      setSyncingId(null);
    }
  };

  const openConnectDialog = (type: IntegrationType) => {
    setSelectedType(type);
    setConnectDialogOpen(true);
  };

  const dummyData: IntegrationSourcesResponse = {
    integrations: [
      {
        id: "jira-1",
        type: "jira",
        name: "Jira",
        status: "connected",
        connected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        last_sync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        project_id: null,
        config: {
          base_url: "https://company.atlassian.net",
          workspace: "company",
        },
      },
      {
        id: "github-1",
        type: "github",
        name: "GitHub",
        status: "connected",
        connected_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        last_sync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        project_id: null,
        config: {
          organization: "my-org",
          repository: "main-repo",
        },
      },
      {
        id: "confluence-1",
        type: "confluence",
        name: "Confluence",
        status: "error",
        connected_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        last_sync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        project_id: null,
        config: {
          base_url: "https://company.atlassian.net",
          workspace: "company",
        },
        error_message: "Connection timeout",
      },
      {
        id: "slack-1",
        type: "slack",
        name: "Slack",
        status: "disconnected",
        connected_at: null,
        last_sync: null,
        project_id: null,
        config: {
          workspace: "my-workspace",
        },
      },
    ],
    total_connected: 2,
    total_disconnected: 2,
  };

  const displayData = (!isLoading && !error && data && data.integrations.length > 0) 
    ? data 
    : (!isLoading ? dummyData : null);

  if (isLoading) {
    return (
      <div className="widget animate-fade-in">
        <h2 className="widget-title">Integration Sources</h2>
        <div className="text-sm text-muted-foreground p-3">Loading integrations...</div>
      </div>
    );
  }

  return (
    <>
      <div className="widget animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="widget-title mb-0">
            <Plug className="h-4 w-4 text-primary" />
            Integration Sources
          </h2>
          <Badge variant="outline">
            {displayData?.total_connected || 0} connected
          </Badge>
        </div>

        {!displayData && (
          <div className="text-xs text-muted-foreground p-2 mb-2 bg-warning/10 border border-warning/20 rounded">
            ⚠️ Showing dummy data for demonstration
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayData?.integrations.length === 0 ? (
            <div className="col-span-full text-sm text-muted-foreground p-3 text-center">
              No integrations configured
            </div>
          ) : (
            displayData?.integrations.map((integration) => (
              <Card key={integration.id} className="p-3 glass-card border border-border/50 hover:border-primary/50 hover:shadow-sm transition-all">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center w-full">
                    <span className="text-3xl">{INTEGRATION_ICONS[integration.type]}</span>
                  </div>
                  <div className="w-full text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-foreground capitalize">{integration.name}</h3>
                      {getStatusIcon(integration.status)}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] ${getStatusColor(integration.status)}`}
                    >
                      {integration.status}
                    </Badge>
                  </div>
                  {integration.last_sync && (
                    <div className="text-xs text-muted-foreground text-center w-full">
                      {formatDistanceToNow(new Date(integration.last_sync), { addSuffix: true })}
                    </div>
                  )}
                  {integration.error_message && (
                    <div className="text-xs text-destructive text-center w-full truncate" title={integration.error_message}>
                      {integration.error_message}
                    </div>
                  )}
                  <div className="w-full mt-1">
                    {integration.status === "connected" ? (
                      <div className="flex flex-col gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-7"
                          onClick={() => handleSync(integration.id, integration.name)}
                          disabled={syncingId === integration.id || isSyncing}
                        >
                          {syncingId === integration.id ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Syncing
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Sync
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-7"
                          onClick={() => handleDisconnect(integration.id, integration.name)}
                          disabled={isDisconnecting}
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full text-xs h-7"
                        onClick={() => openConnectDialog(integration.type)}
                        disabled={isConnecting}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Add Integration Button */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Available integrations:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(INTEGRATION_NAMES).map(([type, name]) => {
              const exists = displayData?.integrations.some(i => i.type === type);
              if (exists) return null;
              return (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => openConnectDialog(type as IntegrationType)}
                  disabled={isConnecting}
                  className="text-xs"
                >
                  <span className="mr-1">{INTEGRATION_ICONS[type as IntegrationType]}</span>
                  Add {name}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedType && (
        <ConnectDialog
          integrationType={selectedType}
          open={connectDialogOpen}
          onOpenChange={setConnectDialogOpen}
          onConnect={(config) => handleConnect(selectedType, config)}
          isLoading={isConnecting}
        />
      )}
    </>
  );
}


import { useState, useEffect } from "react";
import { Bell, Settings, LogOut, Calendar, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetGitRecentQuery } from "@/store/api";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsDrawer } from "@/components/Settings";
import logo from "@/assets/logo.png";
import Notifications from "./Notifications";
import {
  connectWebSocket,
  sendMessage,
  fetchMessages,
  onEvent,
  resetConversationUnread,
  offEvent,
} from "../../hooks/useWebSocket";

export type TimeFilterOption =
  | "today"
  | "yesterday"
  | "last-7-days"
  | "last-14-days"
  | "current-sprint"
  | "last-sprint";

const TIME_FILTER_OPTIONS: Array<{ value: TimeFilterOption; label: string }> = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last-7-days", label: "Last 7 Days" },
  { value: "last-14-days", label: "Last 14 Days" },
  { value: "current-sprint", label: "Current Sprint" },
  { value: "last-sprint", label: "Last Sprint" },
];

interface HeaderProps {
  timeFilter?: TimeFilterOption;
  onTimeFilterChange?: (filter: TimeFilterOption) => void;
  selectedProject?: string;
  onProjectChange?: (projectId: string) => void;
  projects?: Array<{ id: string; name: string }>;
}

function getInitials(email: string): string {
  const namePart = email.split("@")[0];
  const parts = namePart.split(".");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return namePart.slice(0, 2).toUpperCase();
}

function getNameFromEmail(email: string): string {
  const namePart = email.split("@")[0];
  const parts = namePart.split(".");
  if (parts.length >= 2) {
    return parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}

export function Header({
  timeFilter: externalTimeFilter,
  onTimeFilterChange,
  selectedProject: externalSelectedProject,
  onProjectChange,
  projects = [],
}: HeaderProps) {
  const { data: gitData } = useGetGitRecentQuery();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fromNo, setFromNo] = useState("+15677723029"); //+15074100500
  const [toNo, setToNo] = useState("+15203998695"); //+15203998695
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!fromNo || !toNo) return;

    let isMounted = true;

    async function init() {
      try {
        await connectWebSocket(fromNo, toNo);

        if (!isMounted) return;

        setConnected(true);

        // Clear previous listeners first
        offEvent("new_message", handleNewMessage);
        offEvent("fetchedMessages", handleFetchedMessages);

        // Register event listeners
        onEvent("new_message", handleNewMessage);
        onEvent("fetchedMessages", handleFetchedMessages);

        fetchMessages(fromNo, toNo);
      } catch (err) {
        console.error("WebSocket connection failed:", err);
      }
    }

    // Handlers
    function handleNewMessage(data) {
      console.log("new_message", data);
      setToast(data.message);
      setMessages((prev) => [...prev, data.message]);
    }

    function handleFetchedMessages(data) {
      console.log("handleFetchedMessages", data);
      setToast(data.message);

      setMessages(data.messages || []);
    }

    init();

    return () => {
      isMounted = false;
      offEvent("new_message", handleNewMessage);
      offEvent("fetchedMessages", handleFetchedMessages);
    };
  }, [fromNo, toNo]);

  const [internalTimeFilter, setInternalTimeFilter] =
    useState<TimeFilterOption>(() => {
      const saved = localStorage.getItem("dashboard-time-filter");
      return (saved as TimeFilterOption) || "current-sprint";
    });

  const [internalSelectedProject, setInternalSelectedProject] =
    useState<string>(() => {
      const saved = localStorage.getItem("dashboard-selected-project");
      return saved || (projects.length > 0 ? projects[0].id : "");
    });

  const timeFilter = externalTimeFilter ?? internalTimeFilter;
  const selectedProject = externalSelectedProject ?? internalSelectedProject;

  const handleTimeFilterChange = (value: string) => {
    const newFilter = value as TimeFilterOption;
    setInternalTimeFilter(newFilter);
    localStorage.setItem("dashboard-time-filter", newFilter);
    onTimeFilterChange?.(newFilter);
  };

  const handleProjectChange = (value: string) => {
    setInternalSelectedProject(value);
    localStorage.setItem("dashboard-selected-project", value);
    onProjectChange?.(value);
  };

  useEffect(() => {
    if (externalTimeFilter) {
      localStorage.setItem("dashboard-time-filter", externalTimeFilter);
    }
  }, [externalTimeFilter]);

  useEffect(() => {
    if (externalSelectedProject) {
      localStorage.setItem(
        "dashboard-selected-project",
        externalSelectedProject
      );
    }
  }, [externalSelectedProject]);

  const userEmail = gitData?.user_record?.email || "user@company.com";
  const userRole =
    gitData?.user_role ||
    gitData?.user_record?.role ||
    localStorage.getItem("userRole") ||
    "USER";
  const userName = getNameFromEmail(userEmail);
  const userInitials = getInitials(userEmail);

  const handleLogout = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  const notifications: Array<{
    id: number;
    title: string;
    description: string;
    time: string;
    unread: boolean;
  }> = [
    {
      id: 1,
      title: "New PR Review Request",
      description: "Krishna Mayekar requested your review on PR #45",
      time: "5m ago",
      unread: true,
    },
    {
      id: 2,
      title: "Sprint Update",
      description: "Sprint 'Hackathon Sprint 3' is 75% complete",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      title: "Risk Alert",
      description: "3 PRs have been idle for more than 5 days",
      time: "2h ago",
      unread: true,
    },
    {
      id: 4,
      title: "Team Activity",
      description: "5 new commits pushed to main branch",
      time: "3h ago",
      unread: false,
    },
    {
      id: 5,
      title: "Workload Alert",
      description: "Venkata Ravi has 78 open issues",
      time: "4h ago",
      unread: false,
    },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

  const toastStyle: React.CSSProperties = {
    position: "fixed",
    top: 20,
    right: 20,
    background: "#323232",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 6,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    zIndex: 9999,
    minWidth: 250,
    animation: "fadeIn 0.3s ease",
  };

  return (
    <>
      {toast && (
        <div style={toastStyle}>
          <strong>
            {"New Message"} {toast.event}
          </strong>
          <div>{toast.summary}</div>
        </div>
      )}
      <header className="sticky top-0 z-50 w-full glass-header overflow-x-hidden">
        <div className="flex h-16 items-center justify-between px-3 sm:px-4 md:px-6 w-full">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 glass-card rounded-xl px-3 py-2 h-10">
              <img
                src={logo}
                alt="AI WorkTracker"
                className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-heading text-sm sm:text-base font-bold text-foreground truncate">
                  AI WorkTracker
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:block">
                  Team Analytics
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {projects.length > 0 && (
              <div className="glass-card rounded-xl px-3 py-2 h-10 flex items-center">
                <Select
                  value={selectedProject}
                  onValueChange={handleProjectChange}
                >
                  <SelectTrigger className="w-[160px] sm:w-[180px] border-0 bg-transparent shadow-none focus:ring-0 h-auto py-0">
                    <div className="flex items-center gap-2 min-w-0 w-full">
                      <FolderKanban className="h-4 w-4 text-primary shrink-0" />
                      <SelectValue className="truncate">
                        {projects.find((p) => p.id === selectedProject)?.name ||
                          "Select Project"}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="glass-dropdown">
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="glass-card rounded-xl px-3 py-2 h-10 flex items-center">
              <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
                <SelectTrigger className="w-[140px] sm:w-[160px] border-0 bg-transparent shadow-none focus:ring-0 h-auto py-0">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <SelectValue>
                      {TIME_FILTER_OPTIONS.find(
                        (opt) => opt.value === timeFilter
                      )?.label || "Current Sprint"}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent className="glass-dropdown">
                  {TIME_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 glass-card rounded-xl px-2 py-2 h-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-muted-foreground hover:text-foreground h-8 w-8"
                  >
                    <Bell className="h-4 w-4" />

                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-semibold bg-primary text-primary-foreground border-2 border-white/50">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary hover:text-primary/80"
                    >
                      Mark all read
                    </Button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <DropdownMenuItem className="flex flex-col items-center gap-1 p-3 cursor-pointer">
                      <span className="text-sm text-muted-foreground">
                        No notifications
                      </span>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      {notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 w-full">
                            {notification.unread && (
                              <span className="w-2 h-2 bg-primary rounded-full" />
                            )}
                            <span className="font-medium text-sm flex-1">
                              {notification.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {notification.time}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground pl-4">
                            {notification.description}
                          </span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="justify-center text-primary font-medium">
                        View all notifications
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-6 w-px bg-border/50" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative rounded-full p-0 h-8 w-8"
                  >
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{userName}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {userEmail}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] mt-1 w-fit"
                      >
                        {userRole}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setSettingsOpen(true)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
      </header>
    </>
  );
}

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Mail, MessageSquare, Bell, Users, Lock, Plug } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";
import { IntegrationSources } from "@/components/widgets/IntegrationSources";

interface SettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Settings({ open, onOpenChange }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const darkMode = theme === "dark";
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackMentions, setSlackMentions] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const [mentions, setMentions] = useState(true);
  const [sprintUpdates, setSprintUpdates] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  // Clear password fields when settings sheet opens
  useEffect(() => {
    if (open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [open]);

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Password updated successfully",
    });
    
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Lock className="h-5 w-5 text-destructive" />
            Settings
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Manage your account preferences and settings
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-border/30">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sun className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Appearance</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customize how the app looks
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg glass-card">
              <div className="flex items-center gap-3">
                {!mounted ? (
                  <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
                ) : darkMode ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-warning" />
                )}
                <div>
                  <Label htmlFor="dark-mode" className="text-sm font-medium text-foreground">
                    Dark Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={(checked) => {
                  setTheme(checked ? "dark" : "light");
                }}
                disabled={!mounted}
              />
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3 pb-2 border-b border-border/30">
              <div className="p-2 rounded-lg bg-warning/10">
                <Bell className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Notifications</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure how you receive notifications
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg glass-card">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="email-notifications" className="text-sm font-medium text-foreground">
                      Email Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg glass-card">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-success" />
                  <div>
                    <Label htmlFor="slack-mentions" className="text-sm font-medium text-foreground">
                      Slack Mentions
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when someone tags you
                    </p>
                  </div>
                </div>
                <Switch
                  id="slack-mentions"
                  checked={slackMentions}
                  onCheckedChange={setSlackMentions}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg glass-card">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-warning" />
                  <div>
                    <Label htmlFor="desktop-notifications" className="text-sm font-medium text-foreground">
                      Desktop Notifications
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Show browser notifications
                    </p>
                  </div>
                </div>
                <Switch
                  id="desktop-notifications"
                  checked={desktopNotifications}
                  onCheckedChange={setDesktopNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg glass-card">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="mentions" className="text-sm font-medium text-foreground">
                      @Mentions
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Notify when mentioned in comments
                    </p>
                  </div>
                </div>
                <Switch
                  id="mentions"
                  checked={mentions}
                  onCheckedChange={setMentions}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg glass-card">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-success" />
                  <div>
                    <Label htmlFor="sprint-updates" className="text-sm font-medium text-foreground">
                      Sprint Updates
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified about sprint changes
                    </p>
                  </div>
                </div>
                <Switch
                  id="sprint-updates"
                  checked={sprintUpdates}
                  onCheckedChange={setSprintUpdates}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3 pb-2 border-b border-border/30">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Lock className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Security</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage your password and security settings
                </p>
              </div>
            </div>

            <div className="space-y-4 p-4 rounded-lg glass-card">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-sm font-medium text-foreground">
                  Current Password
                </Label>
                <Input
                  id="current-password"
                  name="current-password"
                  type="password"
                  autoComplete="off"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  readOnly
                  onFocus={(e) => {
                    e.target.removeAttribute('readonly');
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium text-foreground">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  readOnly
                  onFocus={(e) => {
                    e.target.removeAttribute('readonly');
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  readOnly
                  onFocus={(e) => {
                    e.target.removeAttribute('readonly');
                  }}
                />
              </div>

              <Button
                onClick={handleUpdatePassword}
                className="w-full mt-4"
              >
                Update Password
              </Button>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3 pb-2 border-b border-border/30">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plug className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Integrations</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage your connected services and data sources
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg glass-card">
              <IntegrationSources />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


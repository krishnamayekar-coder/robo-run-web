import { useState } from "react";
import { Sparkles, X, Send, ChevronUp, ListTodo, BarChart3, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
}

export function AIAssistant() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");

  const quickActions: QuickAction[] = [
    { icon: <ListTodo className="h-4 w-4" />, label: "Show my tasks", description: "View current assignments" },
    { icon: <BarChart3 className="h-4 w-4" />, label: "Sprint status", description: "Get sprint overview" },
    { icon: <FileText className="h-4 w-4" />, label: "Generate report", description: "Create activity report" },
    { icon: <AlertTriangle className="h-4 w-4" />, label: "Risk summary", description: "View risk analysis" },
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 p-3 sm:p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 ${
          isExpanded ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <div
        className={`glass-widget fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-2xl transition-all duration-300 overflow-hidden ${
          isExpanded ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 glass-card rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Assistant</h3>
              <p className="text-[10px] text-muted-foreground">Powered by WorkTracker AI</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Actions</span>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-start p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-left group"
              >
                <div className="p-1.5 rounded-md bg-muted group-hover:bg-primary/10 transition-colors mb-2">
                  <span className="text-muted-foreground group-hover:text-primary transition-colors">{action.icon}</span>
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
                <span className="text-[10px] text-muted-foreground">{action.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Preview */}
        <div className="px-4 pb-2">
          <div className="p-3 rounded-lg glass-card">
            <div className="flex items-start gap-2">
              <div className="p-1 rounded bg-primary/10">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-foreground">
                  Hi! I can help you with tasks, sprint status, and risk analysis. What would you like to know?
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-primary/10">
                    My tasks today
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-primary/10">
                    Blocked items
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
            />
            <Button size="icon" className="h-9 w-9" disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Collapse */}
        <button
          onClick={() => setIsExpanded(false)}
          className="w-full py-2 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ChevronUp className="h-3 w-3" />
          Minimize
        </button>
      </div>
    </>
  );
}

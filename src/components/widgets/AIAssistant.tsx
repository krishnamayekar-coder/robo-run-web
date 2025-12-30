import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, ChevronUp, ListTodo, BarChart3, FileText, AlertTriangle, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetAIFactsMutation } from "@/store/api";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  confidence?: number;
  sources?: string[];
  timestamp: Date;
}

export function AIAssistant() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I can help you with tasks, sprint status, and risk analysis. What would you like to know?",
      timestamp: new Date(),
    }
  ]);
  const [getAIFacts, { isLoading: isFactsLoading }] = useGetAIFactsMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const quickActions: QuickAction[] = [
    { icon: <ListTodo className="h-4 w-4" />, label: "Show my tasks", description: "View current assignments" },
    { icon: <BarChart3 className="h-4 w-4" />, label: "Sprint status", description: "Get sprint overview" },
    { icon: <FileText className="h-4 w-4" />, label: "Generate report", description: "Create activity report" },
    { icon: <AlertTriangle className="h-4 w-4" />, label: "Risk summary", description: "View risk analysis" },
  ];

  const handleQuickAction = async (label: string) => {
    let question = "";
    switch (label) {
      case "Show my tasks":
        question = "what are my current tasks";
        break;
      case "Sprint status":
        question = "what is the sprint status";
        break;
      case "Generate report":
        question = "generate activity report";
        break;
      case "Risk summary":
        question = "what are the current risks";
        break;
      default:
        question = label;
    }
    await handleSendMessage(question);
  };

  const handleSendMessage = async (questionText?: string) => {
    const question = questionText || message.trim();
    if (!question) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");

    try {
      const response = await getAIFacts({ question }).unwrap();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.facts,
        confidence: response.confidence,
        sources: response.sources,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: error?.data?.message || "Sorry, I couldn't process your question. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
        className={`glass-widget fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-80 max-w-sm h-[600px] flex flex-col rounded-2xl transition-all duration-300 overflow-hidden ${
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
              <p className="text-[10px] text-muted-foreground">Powered by Activity Tracker AI</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="p-4 space-y-2 border-b border-border/50">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Actions</span>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.label)}
                  disabled={isFactsLoading}
                  className="flex flex-col items-start p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
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
        )}

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'assistant' && (
                  <div className="p-1.5 rounded bg-primary/10 flex-shrink-0">
                    <Sparkles className="h-3 w-3 text-primary" />
                  </div>
                )}
                <div
                  className={`flex-1 max-w-[85%] ${
                    msg.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50'
                  } rounded-lg p-3`}
                >
                  <p className={`text-xs ${msg.type === 'user' ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {msg.content}
                  </p>
                  {msg.type === 'assistant' && msg.confidence !== undefined && (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">
                        Confidence: {msg.confidence}%
                      </Badge>
                      {msg.sources && msg.sources.length > 0 && (
                        <Badge variant="secondary" className="text-[10px]">
                          {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                {msg.type === 'user' && (
                  <div className="p-1.5 rounded bg-primary/10 flex-shrink-0">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                )}
              </div>
            ))}
            {isFactsLoading && (
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded bg-primary/10 flex-shrink-0">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1 bg-muted/50 rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
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
              onKeyPress={handleKeyPress}
              disabled={isFactsLoading}
              className="flex-1 px-3 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button 
              size="icon" 
              className="h-9 w-9" 
              disabled={!message.trim() || isFactsLoading}
              onClick={() => handleSendMessage()}
            >
              {isFactsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
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

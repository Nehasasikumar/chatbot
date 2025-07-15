import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  url?: string;
}

interface Summary {
  id: string;
  title: string;
  created_at?: string;
  timestamp?: string;
  url: string;
  summary: string;
  messages?: Message[];
}

import { getHistory } from '@/config/api';

export const Dashboard = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatKey, setChatKey] = useState(Date.now());
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (isMobile) {
      setSidebarOpen(false);
    }
    fetchHistory();
  }, [navigate, isMobile]);

  const fetchHistory = async () => {
    try {
      const response = await getHistory();
      setSummaries(response.chats || []);
    } catch (error) {
      console.error('❌ Failed to fetch history:', error);
    }
  };

  const handleNewSummary = () => {
    setCurrentSummary(null);
    setChatKey(Date.now());
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSelectSummary = (summary: Summary) => {
    const stored = localStorage.getItem(summary.id);
    if (stored) {
      const parsed = JSON.parse(stored);
      summary.messages = parsed.messages || [];
    }
    setCurrentSummary(summary);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSummaryCreated = (summary: Summary) => {
    setCurrentSummary(summary);
    setSummaries((prev) => {
      const existing = prev.find((s) => s.id === summary.id);
      if (existing) {
        return prev.map((s) => (s.id === summary.id ? summary : s));
      } else {
        return [summary, ...prev];
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="h-screen bg-background flex">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={
          isMobile
            ? `fixed left-0 top-0 z-50 h-full transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : sidebarOpen
            ? 'block'
            : 'hidden'
        }
      >
        <Sidebar
          summaries={summaries}
          onNewSummary={handleNewSummary}
          onSelectSummary={handleSelectSummary}
          currentSummaryId={currentSummary?.id}
          setSummaries={setSummaries}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b border-accent/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {(isMobile || !sidebarOpen) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="shrink-0"
              >
                ☰
              </Button>
            )}
            <h1 className="text-xl font-semibold text-foreground">
              {currentSummary ? currentSummary.title : 'Article Summarizer'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {!isMobile && sidebarOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="hidden lg:block"
              >
                Hide Sidebar
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        {/* Main View */}
        <div className="flex-1 min-h-0 p-6 overflow-auto">
          <ChatInterface
            key={chatKey}
            summaryId={currentSummary?.id}
            onSummaryCreated={handleSummaryCreated}
            existingMessages={currentSummary?.messages || []}
          />
        </div>
      </div>
    </div>
  );
};

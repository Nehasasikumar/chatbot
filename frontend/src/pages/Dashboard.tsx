import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { useIsMobile } from '@/hooks/use-mobile';
import { getHistory } from '@/config/api';
import { Summary } from '@/state';

export const Dashboard = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchHistory();
    const storedSummary = localStorage.getItem('currentSummary');
    if (storedSummary) {
      setCurrentSummary(JSON.parse(storedSummary));
    }
  }, [navigate]);

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
    localStorage.removeItem('currentSummary');
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSelectSummary = (summary: Summary) => {
    setCurrentSummary(summary);
    localStorage.setItem('currentSummary', JSON.stringify(summary));
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSummaryCreated = (summary: Summary) => {
    setCurrentSummary(summary);
    setSummaries((prev) => [summary, ...prev.filter((s) => s.id !== summary.id)]);
    localStorage.setItem('currentSummary', JSON.stringify(summary));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentSummary');
    navigate('/login');
  };

  return (
    <div className="h-screen bg-background flex">
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
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
      <div className="flex-1 flex flex-col min-w-0">
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
        <div className="flex-1 min-h-0 p-6 overflow-auto">
          <ChatInterface
            key={currentSummary?.id || 'new'}
            selectedSummary={currentSummary}
            onSummaryCreated={handleSummaryCreated}
          />
        </div>
      </div>
    </div>
  );
};

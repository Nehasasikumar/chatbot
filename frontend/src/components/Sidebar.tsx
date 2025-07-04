import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { mockApi } from '@/services/mockApi';

interface Summary {
  id: string;
  title: string;
  created_at: string;
  url: string;
}

interface SidebarProps {
  onNewSummary: () => void;
  onSelectSummary: (summary: Summary) => void;
  currentSummaryId?: string;
}

export const Sidebar = ({ onNewSummary, onSelectSummary, currentSummaryId }: SidebarProps) => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await mockApi.getHistory();
      setSummaries(response.data.summaries || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const truncateTitle = (title: string, maxLength: number = 40) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <div className="w-80 bg-card border-r border-accent/20 flex flex-col h-full">
      {/* New Summary Button */}
      <div className="p-4 border-b border-accent/20">
        <Button 
          onClick={onNewSummary}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Summary
        </Button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4 pb-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Previous Summaries
          </h2>
        </div>
        
        <ScrollArea className="h-full px-2">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading history...
            </div>
          ) : summaries.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No summaries yet. Create your first one!
            </div>
          ) : (
            <div className="space-y-1 pb-4">
              {summaries.map((summary) => (
                <button
                  key={summary.id}
                  onClick={() => onSelectSummary(summary)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-accent/50 group ${
                    currentSummaryId === summary.id 
                      ? 'bg-accent border border-primary/20' 
                      : 'border border-transparent'
                  }`}
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {truncateTitle(summary.title)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(summary.created_at)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
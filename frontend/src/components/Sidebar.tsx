import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { getHistory, renameSummary, deleteSummary } from '../config/api';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Summary {
  id: string;
  title: string;
  created_at?: string;
  timestamp?: string;
  url: string;
  summary: string;
}

interface SidebarProps {
  onNewSummary: () => void;
  onSelectSummary: (summary: Summary) => void;
  currentSummaryId?: string;
}

export const Sidebar = ({
  onNewSummary,
  onSelectSummary,
  currentSummaryId,
}: SidebarProps) => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await getHistory();
      setSummaries(response.summaries || []);
    } catch (error) {
      console.error('❌ Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const truncateTitle = (title: string, maxLength: number = 40) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  const handleRename = async (url: string) => {
    if (!editedTitle.trim()) return;
    try {
      await renameSummary(url, editedTitle);
      toast({ title: 'Title renamed successfully' });
      setSummaries((prev) =>
        prev.map((s) =>
          s.url === url ? { ...s, title: editedTitle } : s
        )
      );
      setEditId(null);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Rename failed',
        description: (err as Error).message,
      });
    }
  };

  const handleDelete = async (url: string) => {
    const confirmed = confirm('Are you sure you want to delete this summary?');
    if (!confirmed) return;

    try {
      await deleteSummary(url);
      toast({ title: 'Deleted successfully' });
      setSummaries((prev) => prev.filter((s) => s.url !== url));
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: (err as Error).message,
      });
    }
  };

  return (
    <div className="w-80 bg-card border-r border-accent/20 flex flex-col h-full">
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

      <div className="flex-1 overflow-hidden">
        <div className="p-4 pb-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Summary History
          </h2>
        </div>

        <ScrollArea className="h-full px-2">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading history...</div>
          ) : summaries.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No summaries found.</div>
          ) : (
            <div className="space-y-1 pb-4">
              {summaries.map((summary) => (
                <div
                  key={summary.id}
                  className={`w-full p-3 rounded-lg transition-all group ${
                    currentSummaryId === summary.id
                      ? 'bg-accent border border-primary/20'
                      : 'border border-transparent hover:bg-accent/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <button
                      onClick={() => onSelectSummary(summary)}
                      className="text-left flex-1"
                    >
                      {editId === summary.id ? (
                        <Input
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="text-sm h-8"
                          autoFocus
                        />
                      ) : (
                        <>
                          <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {truncateTitle(summary.title)}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(summary.timestamp || summary.created_at || '')}
                          </p>
                        </>
                      )}
                    </button>

                    {editId === summary.id ? (
                      <div className="flex gap-2 ml-2 mt-1">
                        <Check
                          className="w-4 h-4 text-green-600 cursor-pointer"
                          onClick={() => handleRename(summary.url)}
                        />
                        <X
                          className="w-4 h-4 text-gray-500 cursor-pointer"
                          onClick={() => setEditId(null)}
                        />
                      </div>
                    ) : (
                      <div className="flex gap-2 ml-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil
                          className="w-4 h-4 text-muted-foreground cursor-pointer"
                          onClick={() => {
                            setEditId(summary.id);
                            setEditedTitle(summary.title);
                          }}
                        />
                        <Trash2
                          className="w-4 h-4 text-destructive cursor-pointer"
                          onClick={() => handleDelete(summary.url)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

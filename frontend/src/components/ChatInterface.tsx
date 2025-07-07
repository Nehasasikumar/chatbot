import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeArticle } from '../utils/summarize'; // ✅ Adjusted import path

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  url?: string;
}

interface ChatInterfaceProps {
  summaryId?: string;
  onSummaryCreated: (summary: any) => void;
}

export const ChatInterface = ({ summaryId, onSummaryCreated }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!summaryId) {
      setMessages([]);
    }
  }, [summaryId]);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputUrl.trim()) {
      toast({
        variant: 'destructive',
        title: 'URL required',
        description: 'Please enter a valid article URL.',
      });
      return;
    }

    if (!isValidUrl(inputUrl)) {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: 'Please enter a valid URL starting with http:// or https://',
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputUrl,
      timestamp: new Date(),
      url: inputUrl,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputUrl('');
    setIsLoading(true);

    try {
      const response = await summarizeArticle(inputUrl);

      const summaryText =
        response.abstractive_summary ||
        response.extractive_summary ||
        'No summary available from the server.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: summaryText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (response.summary_id) {
        onSummaryCreated({
          id: response.summary_id,
          title: response.title || 'Article Summary',
          url: inputUrl,
          created_at: new Date().toISOString(),
        });
      }

      toast({
        title: 'Summary generated!',
        description: 'Article has been successfully summarized.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Summary failed',
        description:
          error?.response?.data?.error || 'Failed to generate summary. Please try again.',
      });

      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Start a New Summary
              </h2>
              <p className="text-muted-foreground">
                Paste an article URL below and I'll generate a comprehensive summary for you.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-card border border-accent/20 mr-12'
                  }`}
                >
                  {message.type === 'user' ? (
                    <div>
                      <p className="text-sm font-medium mb-1">Article URL:</p>
                      <a
                        href={message.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-foreground/90 hover:text-primary-foreground underline break-all"
                      >
                        {message.content}
                      </a>
                    </div>
                  ) : (
                    <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                  )}
                  <div
                    className={`text-xs mt-2 ${
                      message.type === 'user'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-accent/20 rounded-2xl px-4 py-3 mr-12">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                    <span className="text-muted-foreground text-sm">Generating summary...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-accent/20 p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <Input
              ref={inputRef}
              type="url"
              placeholder="Paste article URL here..."
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              disabled={isLoading}
              className="pr-14 h-14 text-lg bg-card border-accent/20 focus:border-primary"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !inputUrl.trim()}
              className="absolute right-2 top-2 h-10 w-10 p-0 bg-primary hover:bg-primary/90"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

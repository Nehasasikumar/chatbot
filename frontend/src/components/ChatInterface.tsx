import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { summarizeArticle } from '../config/api';
import { Message, Summary } from '@/state';

interface ChatInterfaceProps {
  onSummaryCreated: (summary: any) => void;
  selectedSummary: Summary | null;
}

export const ChatInterface = ({
  onSummaryCreated,
  selectedSummary,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedSummary) {
      setMessages(selectedSummary.messages || []);
    } else {
      setMessages([]);
    }
  }, [selectedSummary]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputUrl,
      timestamp: new Date(),
      url: inputUrl,
    };

    const currentUrl = inputUrl;
    setInputUrl('');
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await summarizeArticle(
        currentUrl,
        selectedSummary?.id,
        [...messages, userMessage]
      );
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.summary,
        timestamp: new Date(),
      };
      const newMessages = [...messages, userMessage, assistantMessage];
      onSummaryCreated({
        id: response.chat_id,
        title: response.title,
        messages: newMessages,
      });
      setMessages(newMessages);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Summary failed',
        description: error.message || 'Failed to generate summary. Please try again.',
      });
      setMessages((prev) => prev.slice(0, -1)); // remove user message on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
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
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card border border-accent/20 rounded-2xl px-4 py-3 mr-12">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <span className="text-muted-foreground text-sm">Generating summary...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t border-accent/20 p-6">
        <form onSubmit={handleSubmit} className="w-full px-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="Paste article URL here..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              disabled={isLoading}
              className="h-14 text-lg bg-card border-accent/20 focus:border-primary flex-1"
            />
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !inputUrl.trim()}
              className="h-14 px-4 bg-primary hover:bg-primary/90"
            >
              <ArrowUp className="w-6 h-6" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

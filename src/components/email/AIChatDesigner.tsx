import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, ArrowRight } from 'lucide-react';
import { getAIAdapter } from '@/adapters/ai';

interface AIChatDesignerProps {
  onApply: (html: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  html?: string;
}

export function AIChatDesigner({ onApply }: AIChatDesignerProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastHtml, setLastHtml] = useState('');

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const ai = getAIAdapter();
      const result = await ai.generateDraft({
        mode: 'chat',
        prompt: input,
        history: messages.map(m => ({ role: m.role, content: m.content })),
      });
      const html = result.html || '';
      setLastHtml(html);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Here\'s what I created:', html }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="w-full" onClick={() => setOpen(true)}>
        <Sparkles className="h-4 w-4 mr-1" /> Design with AI
      </Button>
    );
  }

  return (
    <div className="border rounded-md">
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-sm font-semibold flex items-center gap-1"><Sparkles className="h-4 w-4" /> AI Designer</span>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>×</Button>
      </div>
      <ScrollArea className="h-64 p-2">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-8">Describe the email you want to create</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.role === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block text-xs p-2 rounded max-w-[90%] ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {m.content}
            </div>
            {m.html && (
              <div className="border rounded mt-1 overflow-hidden">
                <iframe srcDoc={m.html} className="w-full border-0" style={{ height: 150 }} title="AI Preview" sandbox="" />
              </div>
            )}
          </div>
        ))}
        {loading && <p className="text-xs text-muted-foreground text-center animate-pulse">Generating...</p>}
      </ScrollArea>
      <div className="p-2 border-t space-y-2">
        <div className="flex gap-1">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Describe your email..." className="flex-1 text-xs" onKeyDown={e => e.key === 'Enter' && handleSend()} />
          <Button variant="ghost" size="icon" onClick={handleSend} disabled={loading}><Send className="h-3 w-3" /></Button>
        </div>
        {lastHtml && (
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => onApply(lastHtml)}>
            <ArrowRight className="h-3 w-3 mr-1" /> Apply to Editor
          </Button>
        )}
      </div>
    </div>
  );
}

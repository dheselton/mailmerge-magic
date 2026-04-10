import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { STARTER_TEMPLATES } from '@/data/email-mock-data';
import type { StarterTemplate } from '@/data/email-mock-data';

interface StarterLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (html: string, subject?: string) => void;
}

const categoryColor: Record<string, string> = {
  Sourcing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Scheduling: 'bg-green-500/20 text-green-400 border-green-500/30',
  Engagement: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Referrals: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export function StarterLibraryDialog({ open, onOpenChange, onSelect }: StarterLibraryDialogProps) {
  const handleSelect = (t: StarterTemplate) => {
    onSelect(t.html, t.subject);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Starter Library</DialogTitle>
          <p className="text-sm text-muted-foreground">Production-ready, cross-client email templates for recruiting workflows.</p>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STARTER_TEMPLATES.map(t => (
            <div
              key={t.id}
              className="group border rounded-lg overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => handleSelect(t)}
            >
              {/* Preview */}
              <div className="h-44 overflow-hidden bg-white relative">
                <iframe
                  srcDoc={t.html}
                  className="w-full h-full border-0 pointer-events-none"
                  title={t.name}
                  sandbox=""
                  style={{ transform: 'scale(0.45)', transformOrigin: 'top left', width: '222%', height: '222%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10 group-hover:to-primary/5 transition-colors" />
              </div>
              {/* Info */}
              <div className="p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">{t.name}</span>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${categoryColor[t.category] || ''}`}>
                    {t.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                <p className="text-xs text-muted-foreground/70 truncate italic">Subject: {t.subject}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

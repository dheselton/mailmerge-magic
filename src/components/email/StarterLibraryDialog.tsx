import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { STARTER_TEMPLATES } from '@/data/email-mock-data';

interface StarterLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (html: string) => void;
}

export function StarterLibraryDialog({ open, onOpenChange, onSelect }: StarterLibraryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Starter Library</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          {STARTER_TEMPLATES.map(t => (
            <Card key={t.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => onSelect(t.html)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t.name}</CardTitle>
                <CardDescription className="text-xs">{t.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

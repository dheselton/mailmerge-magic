import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { STARTER_TEMPLATES } from '@/data/email-mock-data';
import type { StarterTemplate } from '@/data/email-mock-data';
import { CAMPAIGN_LANDING_FEATURED } from './campaign-landing-featured';
import { cn } from '@/lib/utils';
import type { AICampaignFormFields } from '@/adapters/ai';
import type { BrandSettings } from '@/types/email-types';
import { EmailAIChatPanel } from './EmailAIChatPanel';
import { planScratchEmailHtmlImport, SCRATCH_HTML_IMPORT_COPY } from '@/lib/email-html-import-flow';
import type { PrepareRegionMappingResult } from '@/lib/email-region-detection';
import { RegionMappingReviewDialog } from '@/components/email/RegionMappingReviewDialog';
import { OpenMojiIcon } from '@/components/ui/OpenMojiIcon';
import { toast } from 'sonner';

export type StartPath = 'template' | 'ai' | 'scratch';

interface CampaignsLandingEmptyProps {
  brandSettings: BrandSettings;
  onOpenStarterModal: () => void;
  onSelectStarter: (t: StarterTemplate) => void;
  onOpenScratch: () => void;
  /** When user pastes or uploads HTML from scratch path */
  onScratchHtml: (html: string) => void;
  onAIGenerated: (fields: AICampaignFormFields) => void;
  /** True when the user already has drafts or sent campaigns — softer hero copy */
  hasSavedCampaigns?: boolean;
}

export function CampaignsLandingEmpty({
  brandSettings,
  onOpenStarterModal,
  onSelectStarter,
  onOpenScratch,
  onScratchHtml,
  onAIGenerated,
  hasSavedCampaigns = false,
}: CampaignsLandingEmptyProps) {
  const [path, setPath] = useState<StartPath>('template');
  const [catFilter, setCatFilter] = useState<string>('All');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteHtml, setPasteHtml] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [regionReviewOpen, setRegionReviewOpen] = useState(false);
  const [regionReviewPrepare, setRegionReviewPrepare] = useState<PrepareRegionMappingResult | null>(null);

  const featured = CAMPAIGN_LANDING_FEATURED.map(f => ({
    ...f,
    template: STARTER_TEMPLATES.find(t => t.id === f.starterId)!,
  })).filter(x => x.template);

  const filteredFeatured =
    catFilter === 'All' ? featured : featured.filter(f => f.template.category === catFilter);

  type ImportRunOutcome = 'empty' | 'assignable' | 'static' | 'review';

  const runImportPlan = (raw: string, afterApply?: () => void): ImportRunOutcome => {
    const plan = planScratchEmailHtmlImport(raw);
    if (plan.kind === 'empty') return 'empty';
    if (plan.kind === 'assignable_regions') {
      onScratchHtml(plan.html);
      afterApply?.();
      return 'assignable';
    }
    if (plan.kind === 'static_html') {
      onScratchHtml(plan.html);
      afterApply?.();
      return 'static';
    }
    setRegionReviewPrepare(plan.prep);
    setRegionReviewOpen(true);
    afterApply?.();
    return 'review';
  };

  const applyPastedHtml = () => {
    if (!pasteHtml.trim()) {
      toast.error(SCRATCH_HTML_IMPORT_COPY.pasteEmptyError);
      return;
    }
    const out = runImportPlan(pasteHtml, () => {
      setPasteOpen(false);
      setPasteHtml('');
    });
    if (out === 'empty') toast.error(SCRATCH_HTML_IMPORT_COPY.noHtmlToImport);
    else if (out === 'assignable') toast.success(SCRATCH_HTML_IMPORT_COPY.toastAssignableRegions);
    else if (out === 'static') toast.message(SCRATCH_HTML_IMPORT_COPY.toastStaticFallback);
    else toast.message('Map your HTML blocks to the form, then confirm.');
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error('File too large (max 500KB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const out = runImportPlan(String(reader.result || ''));
      if (out === 'empty') {
        toast.error(SCRATCH_HTML_IMPORT_COPY.noHtmlToImport);
        return;
      }
      if (out === 'assignable') {
        toast.success('HTML file loaded', { description: SCRATCH_HTML_IMPORT_COPY.toastAssignableRegions });
        return;
      }
      if (out === 'static') {
        toast.success('HTML file loaded', { description: SCRATCH_HTML_IMPORT_COPY.toastStaticFallback });
        return;
      }
      toast.message('Map your HTML blocks to the form, then confirm.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-10 py-4">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="flex justify-center" aria-hidden>
          <OpenMojiIcon name="envelope" size={44} />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {hasSavedCampaigns ? 'Start a new campaign' : 'Send your first campaign'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {hasSavedCampaigns
            ? 'Choose how to begin — template, AI, or scratch. Your existing campaigns stay in the list below.'
            : 'Choose how you want to start — pick a template, use AI, or build from scratch.'}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => setPath('template')}
          className={cn(
            'rounded-xl border-2 p-5 text-left transition-all bg-card hover:bg-muted/30',
            path === 'template' ? 'border-primary ring-2 ring-primary/20' : 'border-border',
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg mb-3" style={{ background: '#e8f0fe' }}>
            <OpenMojiIcon name="clipboard" size={28} />
          </div>
          <h3 className="font-semibold">Start from a Template</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">Browse production-ready recruiting layouts.</p>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted">12 templates</span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-100">
              Recommended
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setPath('ai')}
          className={cn(
            'rounded-xl border-2 p-5 text-left transition-all bg-card hover:bg-muted/30',
            path === 'ai' ? 'border-primary ring-2 ring-primary/20' : 'border-border',
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg mb-3" style={{ background: '#f3e8ff' }}>
            <OpenMojiIcon name="sparkles" size={28} />
          </div>
          <h3 className="font-semibold">Build with AI</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">Chat with AI — we fill your email fields in plain text.</p>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Optional</span>
        </button>

        <button
          type="button"
          onClick={() => setPath('scratch')}
          className={cn(
            'rounded-xl border-2 p-5 text-left transition-all bg-card hover:bg-muted/30',
            path === 'scratch' ? 'border-primary ring-2 ring-primary/20' : 'border-border',
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg mb-3 bg-muted">
            <OpenMojiIcon name="pencil" size={28} />
          </div>
          <h3 className="font-semibold">Start from Scratch</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">Blank form, paste HTML, or upload a file.</p>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Full control</span>
        </button>
      </div>

      {path === 'template' && (
        <div className="max-w-5xl mx-auto space-y-4 border rounded-xl p-6 bg-card text-card-foreground">
          <div className="flex flex-wrap gap-2">
            {(['All', 'Sourcing', 'Engagement', 'Scheduling', 'Referrals'] as const).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCatFilter(c)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border',
                  catFilter === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/40 border-border',
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredFeatured.map(f => (
              <button
                key={f.starterId}
                type="button"
                onClick={() => onSelectStarter(f.template)}
                className="rounded-lg border bg-background text-left overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className={cn('h-20 flex items-center justify-center', f.thumbClass)}>
                  <OpenMojiIcon name={f.icon} size={34} />
                </div>
                <div className="p-2 space-y-0.5">
                  <p className="text-xs font-medium leading-tight">{f.title}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{f.template.description}</p>
                  <span className="inline-block text-[10px] px-1.5 py-0 rounded-full bg-muted mt-1">{f.category}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Button variant="ghost" size="sm" onClick={onOpenStarterModal}>
              Browse all 12 templates →
            </Button>
          </div>
        </div>
      )}

      {path === 'ai' && (
        <div className="max-w-lg mx-auto">
          <EmailAIChatPanel
            companyName={brandSettings.companyName}
            onApplyFields={fields => {
              onAIGenerated(fields);
            }}
          />
        </div>
      )}

      {path === 'scratch' && (
        <div className="max-w-md mx-auto rounded-xl border bg-card text-card-foreground p-8 space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Start with our simple form, or bring your own HTML. You can open the template library anytime from the builder.
          </p>
          <p className="text-xs text-muted-foreground text-left rounded-md border bg-muted/20 px-3 py-2">{SCRATCH_HTML_IMPORT_COPY.scratchBlurb}</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" onClick={() => setPasteOpen(true)}>
              Paste HTML
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              Upload .html
            </Button>
            <input ref={fileRef} type="file" accept=".html,text/html" className="hidden" onChange={onFile} />
          </div>
          <Button onClick={() => onOpenScratch()}>Open blank builder →</Button>
        </div>
      )}

      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{SCRATCH_HTML_IMPORT_COPY.pasteDialogTitle}</DialogTitle>
            <DialogDescription className="text-xs">{SCRATCH_HTML_IMPORT_COPY.pasteDialogDescription}</DialogDescription>
          </DialogHeader>
          <Label className="text-sm">Email HTML</Label>
          <Textarea
            value={pasteHtml}
            onChange={e => setPasteHtml(e.target.value)}
            rows={12}
            className="font-mono text-xs"
            placeholder="<!DOCTYPE html>..."
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPasteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyPastedHtml}>{SCRATCH_HTML_IMPORT_COPY.pasteDialogConfirm}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RegionMappingReviewDialog
        open={regionReviewOpen}
        onOpenChange={open => {
          setRegionReviewOpen(open);
          if (!open) setRegionReviewPrepare(null);
        }}
        prepare={regionReviewPrepare}
        onConfirm={html => {
          onScratchHtml(html);
          toast.success(SCRATCH_HTML_IMPORT_COPY.toastRegionMapped);
        }}
      />
    </div>
  );
}

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Sparkles, Upload, Clipboard, BookOpen, Globe, ChevronDown, Monitor, Smartphone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { AnnouncementForm, ComposeKind } from '@/types/email-types';
import { emptyAnnouncementForm, stripEmailScripts, applySampleMerge, renderAnnouncementToHTML } from '@/lib/email-utils';
import { AnnouncementLayoutPreview } from './AnnouncementLayoutPreview';
import { StarterLibraryDialog } from './StarterLibraryDialog';
import { getAIAdapter } from '@/adapters/ai';

interface EmailComposerProps {
  subject: string;
  onSubjectChange: (s: string) => void;
  composeKind: ComposeKind;
  onComposeKindChange: (k: ComposeKind) => void;
  htmlBody: string;
  onHtmlBodyChange: (h: string) => void;
  formPayload: AnnouncementForm;
  onFormPayloadChange: (f: AnnouncementForm) => void;
  codeTextareaRef: React.RefObject<HTMLTextAreaElement>;
}

export function EmailComposer({
  subject, onSubjectChange,
  composeKind, onComposeKindChange,
  htmlBody, onHtmlBodyChange,
  formPayload, onFormPayloadChange,
  codeTextareaRef,
}: EmailComposerProps) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [previewOpen, setPreviewOpen] = useState(true);
  const [importHtmlOpen, setImportHtmlOpen] = useState(false);
  const [pasteHtml, setPasteHtml] = useState('');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [starterOpen, setStarterOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAISuggestSubject = async () => {
    setAiLoading(true);
    try {
      const ai = getAIAdapter();
      const result = await ai.generateDraft({ mode: 'subject_suggestions', prompt: subject });
      if (result.suggestions?.[0]) onSubjectChange(result.suggestions[0]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { alert('File too large (max 500KB)'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const html = stripEmailScripts(reader.result as string);
      onHtmlBodyChange(html);
      onComposeKindChange('raw_html');
    };
    reader.readAsText(file);
  };

  const handlePasteApply = () => {
    onHtmlBodyChange(stripEmailScripts(pasteHtml));
    onComposeKindChange('raw_html');
    setPasteHtml('');
    setPasteOpen(false);
  };

  const handleStarterSelect = (html: string) => {
    onHtmlBodyChange(html);
    onComposeKindChange('raw_html');
    setStarterOpen(false);
  };

  const previewHtml = composeKind === 'announcement_form'
    ? renderAnnouncementToHTML(formPayload, { siteName: 'Your Company' })
    : applySampleMerge(htmlBody, {});

  return (
    <div className="space-y-4">
      {/* Subject */}
      <div className="space-y-2">
        <Label>Subject Line</Label>
        <div className="flex gap-2">
          <Input value={subject} onChange={e => onSubjectChange(e.target.value)} placeholder="Enter email subject..." className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleAISuggestSubject} disabled={aiLoading}>
            <Sparkles className="h-4 w-4 mr-1" />
            {aiLoading ? 'Thinking...' : 'Suggest'}
          </Button>
        </div>
      </div>

      {/* Compose mode tabs */}
      <Tabs value={composeKind} onValueChange={v => onComposeKindChange(v as ComposeKind)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="announcement_form">Visual</TabsTrigger>
            <TabsTrigger value="raw_html">Code</TabsTrigger>
          </TabsList>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} title="Import HTML">
              <Upload className="h-4 w-4" />
            </Button>
            <input ref={fileInputRef} type="file" accept=".html" className="hidden" onChange={handleImportFile} />
            <Button variant="ghost" size="icon" onClick={() => setPasteOpen(!pasteOpen)} title="Paste HTML">
              <Clipboard className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setStarterOpen(true)} title="Starter Library">
              <BookOpen className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Import from Webflow" disabled>
              <Globe className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Paste HTML collapsible */}
        {pasteOpen && (
          <Card className="mt-2">
            <CardContent className="pt-4 space-y-2">
              <Textarea value={pasteHtml} onChange={e => setPasteHtml(e.target.value)} placeholder="Paste your HTML here..." rows={6} />
              <div className="flex gap-2">
                <Button size="sm" onClick={handlePasteApply}>Apply</Button>
                <Button size="sm" variant="ghost" onClick={() => setPasteOpen(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visual mode */}
        <TabsContent value="announcement_form" className="space-y-3">
          <div className="space-y-2">
            <Label>Headline *</Label>
            <Input value={formPayload.headline} onChange={e => onFormPayloadChange({ ...formPayload, headline: e.target.value })} placeholder="Main headline" />
          </div>
          <div className="space-y-2">
            <Label>Subhead</Label>
            <Input value={formPayload.subhead} onChange={e => onFormPayloadChange({ ...formPayload, subhead: e.target.value })} placeholder="Optional subheadline" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={formPayload.message} onChange={e => onFormPayloadChange({ ...formPayload, message: e.target.value })} placeholder="Email body text" rows={5} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Button Label</Label>
              <Input value={formPayload.buttonLabel} onChange={e => onFormPayloadChange({ ...formPayload, buttonLabel: e.target.value })} placeholder="e.g. Apply Now" />
            </div>
            <div className="space-y-2">
              <Label>Button URL</Label>
              <Input value={formPayload.buttonUrl} onChange={e => onFormPayloadChange({ ...formPayload, buttonUrl: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Sign-off</Label>
            <Input value={formPayload.signOff} onChange={e => onFormPayloadChange({ ...formPayload, signOff: e.target.value })} placeholder="e.g. Best regards, The Team" />
          </div>
        </TabsContent>

        {/* Code mode */}
        <TabsContent value="raw_html" className="space-y-2">
          <Textarea
            ref={codeTextareaRef}
            value={htmlBody}
            onChange={e => onHtmlBodyChange(e.target.value)}
            placeholder="<html>...</html>"
            rows={12}
            className="font-mono text-sm"
          />
        </TabsContent>
      </Tabs>

      {/* Preview */}
      <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <span>Preview</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${previewOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex gap-1 mb-2">
            <Button variant={viewport === 'desktop' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewport('desktop')}>
              <Monitor className="h-4 w-4" />
            </Button>
            <Button variant={viewport === 'mobile' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewport('mobile')}>
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          {composeKind === 'announcement_form' ? (
            <AnnouncementLayoutPreview form={formPayload} viewport={viewport} />
          ) : (
            <div className="border rounded-md overflow-hidden" style={{ maxWidth: viewport === 'mobile' ? 375 : '100%' }}>
              <iframe srcDoc={previewHtml} className="w-full border-0" style={{ height: 400 }} title="Email Preview" sandbox="" />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <StarterLibraryDialog open={starterOpen} onOpenChange={setStarterOpen} onSelect={handleStarterSelect} />
    </div>
  );
}

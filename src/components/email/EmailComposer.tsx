import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sparkles, Upload, Clipboard, BookOpen, Globe, ChevronDown, Monitor, Smartphone, Plus, X, ArrowUp, ArrowDown, Image, Type, Heading, MousePointerClick, Minus } from 'lucide-react';
import { toast } from 'sonner';
import type { AnnouncementForm, ComposeKind, ContentBlock } from '@/types/email-types';
import { emptyAnnouncementForm, stripEmailScripts, applySampleMerge, renderAnnouncementToHTML, parseHtmlToBlocks, renderBlocksToHTML, genBlockId } from '@/lib/email-utils';
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

// ========== Block Editor Components ==========

function BlockEditor({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  block: ContentBlock;
  onChange: (b: ContentBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const controls = (
    <div className="flex items-center gap-0.5 shrink-0">
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveUp} disabled={isFirst}><ArrowUp className="h-3 w-3" /></Button>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMoveDown} disabled={isLast}><ArrowDown className="h-3 w-3" /></Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={onDelete}><X className="h-3 w-3" /></Button>
    </div>
  );

  switch (block.type) {
    case 'heading':
      return (
        <div className="flex items-start gap-2 p-2 border rounded-md bg-muted/20">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Heading (H{block.level})</Label>
              <select
                className="text-xs border rounded px-1 py-0.5 bg-background"
                value={block.level}
                onChange={e => onChange({ ...block, level: parseInt(e.target.value) as 1 | 2 | 3 })}
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </select>
            </div>
            <Input value={block.text} onChange={e => onChange({ ...block, text: e.target.value })} placeholder="Heading text" className="h-8 text-sm" />
          </div>
          {controls}
        </div>
      );
    case 'text':
      return (
        <div className="flex items-start gap-2 p-2 border rounded-md bg-muted/20">
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-muted-foreground">Text</Label>
            <Textarea value={block.content} onChange={e => onChange({ ...block, content: e.target.value })} placeholder="Paragraph text..." rows={3} className="text-sm" />
          </div>
          {controls}
        </div>
      );
    case 'image':
      return (
        <div className="flex items-start gap-2 p-2 border rounded-md bg-muted/20">
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-muted-foreground">Image</Label>
            <Input value={block.url} onChange={e => onChange({ ...block, url: e.target.value })} placeholder="Image URL" className="h-8 text-sm" />
            <Input value={block.alt} onChange={e => onChange({ ...block, alt: e.target.value })} placeholder="Alt text" className="h-8 text-sm" />
            {block.url && (
              <div className="mt-1 border rounded overflow-hidden bg-muted/30 max-h-24">
                <img src={block.url} alt={block.alt} className="max-w-full h-auto max-h-24 object-contain" />
              </div>
            )}
          </div>
          {controls}
        </div>
      );
    case 'button':
      return (
        <div className="flex items-start gap-2 p-2 border rounded-md bg-muted/20">
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-muted-foreground">Button</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input value={block.label} onChange={e => onChange({ ...block, label: e.target.value })} placeholder="Button label" className="h-8 text-sm" />
              <Input value={block.url} onChange={e => onChange({ ...block, url: e.target.value })} placeholder="Button URL" className="h-8 text-sm" />
            </div>
          </div>
          {controls}
        </div>
      );
    case 'divider':
      return (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Divider</Label>
            <hr className="mt-1 border-border" />
          </div>
          {controls}
        </div>
      );
    case 'spacer':
      return (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
          <div className="flex-1 flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Spacer</Label>
            <Input type="number" value={block.height} onChange={e => onChange({ ...block, height: parseInt(e.target.value) || 16 })} className="h-8 text-sm w-20" min={8} max={120} />
            <span className="text-xs text-muted-foreground">px</span>
          </div>
          {controls}
        </div>
      );
    default:
      return null;
  }
}

// ========== Main Composer ==========

export function EmailComposer({
  subject, onSubjectChange,
  composeKind, onComposeKindChange,
  htmlBody, onHtmlBodyChange,
  formPayload, onFormPayloadChange,
  codeTextareaRef,
}: EmailComposerProps) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [previewOpen, setPreviewOpen] = useState(true);
  const [pasteHtml, setPasteHtml] = useState('');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [starterOpen, setStarterOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse HTML into blocks and switch to visual mode
  const applyHtmlWithParsing = (html: string) => {
    const clean = stripEmailScripts(html);
    onHtmlBodyChange(clean);
    const blocks = parseHtmlToBlocks(clean);
    if (blocks.length > 0) {
      onFormPayloadChange({ ...emptyAnnouncementForm(), blocks, useBlocks: true });
      onComposeKindChange('announcement_form');
      toast.success(`Extracted ${blocks.length} content blocks from HTML`);
    } else {
      onComposeKindChange('raw_html');
    }
  };

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
    reader.onload = () => applyHtmlWithParsing(reader.result as string);
    reader.readAsText(file);
  };

  const handlePasteApply = () => {
    applyHtmlWithParsing(pasteHtml);
    setPasteHtml('');
    setPasteOpen(false);
  };

  const handleStarterSelect = (html: string) => {
    applyHtmlWithParsing(html);
    setStarterOpen(false);
  };

  // Handle tab switching with bidirectional sync
  const handleTabChange = (newKind: string) => {
    const kind = newKind as ComposeKind;
    if (kind === 'raw_html' && composeKind === 'announcement_form') {
      // Visual → Code: render blocks/form to HTML
      const html = renderAnnouncementToHTML(formPayload, { siteName: 'Your Company' });
      onHtmlBodyChange(html);
    } else if (kind === 'announcement_form' && composeKind === 'raw_html') {
      // Code → Visual: parse HTML into blocks
      if (htmlBody.trim()) {
        const blocks = parseHtmlToBlocks(htmlBody);
        if (blocks.length > 0) {
          onFormPayloadChange({ ...emptyAnnouncementForm(), blocks, useBlocks: true });
          toast.info('Fields extracted from HTML — review for accuracy');
        }
      }
    }
    onComposeKindChange(kind);
  };

  // Block manipulation helpers
  const updateBlock = (id: string, updated: ContentBlock) => {
    onFormPayloadChange({
      ...formPayload,
      blocks: formPayload.blocks.map(b => b.id === id ? updated : b),
    });
  };

  const deleteBlock = (id: string) => {
    onFormPayloadChange({
      ...formPayload,
      blocks: formPayload.blocks.filter(b => b.id !== id),
    });
  };

  const moveBlock = (id: string, direction: -1 | 1) => {
    const blocks = [...formPayload.blocks];
    const idx = blocks.findIndex(b => b.id === id);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    [blocks[idx], blocks[newIdx]] = [blocks[newIdx], blocks[idx]];
    onFormPayloadChange({ ...formPayload, blocks });
  };

  const addBlock = (type: ContentBlock['type']) => {
    let block: ContentBlock;
    const id = genBlockId();
    switch (type) {
      case 'heading': block = { type: 'heading', id, text: '', level: 2 }; break;
      case 'text': block = { type: 'text', id, content: '' }; break;
      case 'image': block = { type: 'image', id, url: '', alt: '' }; break;
      case 'button': block = { type: 'button', id, label: '', url: '' }; break;
      case 'divider': block = { type: 'divider', id }; break;
      case 'spacer': block = { type: 'spacer', id, height: 24 }; break;
      default: return;
    }
    onFormPayloadChange({
      ...formPayload,
      blocks: [...formPayload.blocks, block],
      useBlocks: true,
    });
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
      <Tabs value={composeKind} onValueChange={handleTabChange}>
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

        {/* Visual mode — Dynamic Block Editor */}
        <TabsContent value="announcement_form" className="space-y-3">
          {formPayload.useBlocks && formPayload.blocks.length > 0 ? (
            <>
              <div className="space-y-2">
                {formPayload.blocks.map((block, idx) => (
                  <BlockEditor
                    key={block.id}
                    block={block}
                    onChange={(b) => updateBlock(block.id, b)}
                    onDelete={() => deleteBlock(block.id)}
                    onMoveUp={() => moveBlock(block.id, -1)}
                    onMoveDown={() => moveBlock(block.id, 1)}
                    isFirst={idx === 0}
                    isLast={idx === formPayload.blocks.length - 1}
                  />
                ))}
              </div>
              {/* Add block */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-1" /> Add Block
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => addBlock('heading')}><Heading className="h-4 w-4 mr-2" /> Heading</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('text')}><Type className="h-4 w-4 mr-2" /> Text</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('image')}><Image className="h-4 w-4 mr-2" /> Image</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('button')}><MousePointerClick className="h-4 w-4 mr-2" /> Button</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock('divider')}><Minus className="h-4 w-4 mr-2" /> Divider</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* Legacy flat-field form */
            <>
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
            </>
          )}
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

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Plus, MoreVertical, Copy, Trash2, Pencil, Sparkles, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import type { EmailTemplate, ComposeKind, AnnouncementForm } from '@/types/email-types';
import { MOCK_TEMPLATES } from '@/data/email-mock-data';
import { emptyAnnouncementForm, payloadToAnnouncementForm, stripEmailScripts, applySampleMerge } from '@/lib/email-utils';
import { getAIAdapter } from '@/adapters/ai';
import { StarterLibraryDialog } from './StarterLibraryDialog';

interface TemplatesTabProps {
  templates: EmailTemplate[];
  onTemplatesChange: (t: EmailTemplate[]) => void;
  onUseTemplate: (t: EmailTemplate) => void;
}

export function TemplatesTab({ templates, onTemplatesChange, onUseTemplate }: TemplatesTabProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<EmailTemplate | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editKind, setEditKind] = useState<ComposeKind>('raw_html');
  const [editHtml, setEditHtml] = useState('');
  const [editForm, setEditForm] = useState<AnnouncementForm>(emptyAnnouncementForm());
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [starterOpen, setStarterOpen] = useState(false);

  const openEditor = (template?: EmailTemplate) => {
    if (template) {
      setEditTemplate(template);
      setEditName(template.name);
      setEditSubject(template.subject);
      setEditKind(template.kind);
      setEditHtml(template.html_body);
      setEditForm(template.form_payload ? payloadToAnnouncementForm(template.form_payload) : emptyAnnouncementForm());
    } else {
      setEditTemplate(null);
      setEditName('');
      setEditSubject('');
      setEditKind('raw_html');
      setEditHtml('');
      setEditForm(emptyAnnouncementForm());
    }
    setEditOpen(true);
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    if (editTemplate) {
      onTemplatesChange(templates.map(t =>
        t.id === editTemplate.id
          ? { ...t, name: editName, subject: editSubject, kind: editKind, html_body: editHtml, form_payload: editKind === 'announcement_form' ? editForm : null, updated_at: now }
          : t
      ));
    } else {
      const newTemplate: EmailTemplate = {
        id: `tpl-${Date.now()}`,
        site_id: 'site-1',
        name: editName,
        subject: editSubject,
        html_body: editHtml,
        kind: editKind,
        form_payload: editKind === 'announcement_form' ? editForm : null,
        source: 'manual',
        webflow_asset_refs: [],
        created_by: 'user-1',
        created_at: now,
        updated_at: now,
      };
      onTemplatesChange([newTemplate, ...templates]);
    }
    setEditOpen(false);
    toast.success(editTemplate ? 'Template updated' : 'Template created');
  };

  const handleDuplicate = (t: EmailTemplate) => {
    const dup: EmailTemplate = {
      ...t,
      id: `tpl-${Date.now()}`,
      name: `${t.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onTemplatesChange([dup, ...templates]);
    toast.success('Template duplicated');
  };

  const handleDelete = (id: string) => {
    onTemplatesChange(templates.filter(t => t.id !== id));
    toast.success('Template deleted');
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const ai = getAIAdapter();
      const result = await ai.generateDraft({ mode: 'full_template', prompt: aiPrompt });
      if (result.html) setEditHtml(result.html);
      if (result.subject) setEditSubject(result.subject);
      setEditKind('raw_html');
      setAiDialogOpen(false);
      toast.success('AI template generated');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Templates</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Create <ChevronDown className="h-3 w-3 ml-1" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => openEditor()}>Blank Template</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStarterOpen(true)}>From Starter Library</DropdownMenuItem>
            <DropdownMenuItem disabled>Import from Webflow</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <Card key={t.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{t.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-3 w-3" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onUseTemplate(t)}>Use Template</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditor(t)}><Pencil className="h-3 w-3 mr-1" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(t)}><Copy className="h-3 w-3 mr-1" /> Duplicate</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(t.id)} className="text-destructive"><Trash2 className="h-3 w-3 mr-1" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">{t.kind === 'announcement_form' ? 'Visual' : 'HTML'}</Badge>
                {t.source === 'ai_generated' && <Badge variant="secondary" className="text-xs"><Sparkles className="h-3 w-3 mr-0.5" />AI</Badge>}
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="border rounded overflow-hidden h-32">
                <iframe srcDoc={applySampleMerge(t.html_body, {})} className="w-full h-full border-0 pointer-events-none" title={t.name} sandbox="" style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }} />
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              {t.subject}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Editor Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Template name" />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={editSubject} onChange={e => setEditSubject(e.target.value)} placeholder="Email subject" />
            </div>
            <Tabs value={editKind} onValueChange={v => setEditKind(v as ComposeKind)}>
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="announcement_form">Visual</TabsTrigger>
                  <TabsTrigger value="raw_html">Code</TabsTrigger>
                </TabsList>
                {editKind === 'raw_html' && (
                  <Button variant="outline" size="sm" onClick={() => setAiDialogOpen(true)}>
                    <Sparkles className="h-4 w-4 mr-1" /> Generate with AI
                  </Button>
                )}
              </div>
              <TabsContent value="announcement_form" className="space-y-3">
                <div className="space-y-2"><Label>Headline</Label><Input value={editForm.headline} onChange={e => setEditForm({ ...editForm, headline: e.target.value })} /></div>
                <div className="space-y-2"><Label>Subhead</Label><Input value={editForm.subhead} onChange={e => setEditForm({ ...editForm, subhead: e.target.value })} /></div>
                <div className="space-y-2"><Label>Message</Label><Textarea value={editForm.message} onChange={e => setEditForm({ ...editForm, message: e.target.value })} rows={4} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Button Label</Label><Input value={editForm.buttonLabel} onChange={e => setEditForm({ ...editForm, buttonLabel: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Button URL</Label><Input value={editForm.buttonUrl} onChange={e => setEditForm({ ...editForm, buttonUrl: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Sign-off</Label><Input value={editForm.signOff} onChange={e => setEditForm({ ...editForm, signOff: e.target.value })} /></div>
              </TabsContent>
              <TabsContent value="raw_html">
                <Textarea value={editHtml} onChange={e => setEditHtml(e.target.value)} rows={12} className="font-mono text-sm" placeholder="<html>...</html>" />
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generate Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate with AI</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Describe the email template you want</Label>
            <Textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g. A professional job announcement for a senior engineer role..." rows={4} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAiDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAIGenerate} disabled={aiLoading}>{aiLoading ? 'Generating...' : 'Generate'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

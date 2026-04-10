import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Send, Save, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { EmailCampaign, ComposeKind, RecipientSource, AnnouncementForm } from '@/types/email-types';
import { emptyAnnouncementForm, isValidAnnouncementForSave } from '@/lib/email-utils';
import { EmailComposer } from './EmailComposer';
import { RecipientPanel } from './RecipientPanel';
import { MergeTagsPanel } from './MergeTagsPanel';
import { CampaignHistory } from './CampaignHistory';
import { EmailActivity } from './EmailActivity';
import { AIChatDesigner } from './AIChatDesigner';
import { MOCK_CAMPAIGNS, MOCK_EVENTS } from '@/data/email-mock-data';

interface CampaignsTabProps {
  onSaveAsTemplate: (name: string, subject: string, htmlBody: string, kind: ComposeKind, formPayload: AnnouncementForm | null) => void;
}

export function CampaignsTab({ onSaveAsTemplate }: CampaignsTabProps) {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(MOCK_CAMPAIGNS);
  const [subject, setSubject] = useState('');
  const [composeKind, setComposeKind] = useState<ComposeKind>('announcement_form');
  const [htmlBody, setHtmlBody] = useState('');
  const [formPayload, setFormPayload] = useState<AnnouncementForm>(emptyAnnouncementForm());
  const [recipientSource, setRecipientSource] = useState<RecipientSource>({ type: 'talent_pool' });
  const [testEmail, setTestEmail] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSaveDraft = () => {
    const newCampaign: EmailCampaign = {
      id: `camp-${Date.now()}`,
      site_id: 'site-1',
      subject,
      html_body: htmlBody,
      compose_kind: composeKind,
      form_payload: composeKind === 'announcement_form' ? formPayload : null,
      status: 'draft',
      recipient_source: recipientSource,
      sent_at: null,
      created_by: 'user-1',
      created_at: new Date().toISOString(),
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    toast.success('Draft saved');
  };

  const handleSend = () => {
    setConfirmSendOpen(false);
    toast.success('Campaign sent (stubbed)');
  };

  const handleTestSend = () => {
    if (!testEmail) return;
    toast.success(`Test email sent to ${testEmail} (stubbed)`);
  };

  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) return;
    onSaveAsTemplate(templateName, subject, htmlBody, composeKind, composeKind === 'announcement_form' ? formPayload : null);
    setTemplateName('');
    toast.success('Template saved');
  };

  const handleLoadDraft = (c: EmailCampaign) => {
    setSubject(c.subject);
    setHtmlBody(c.html_body);
    setComposeKind(c.compose_kind);
    setFormPayload(c.form_payload ?? emptyAnnouncementForm());
    setRecipientSource(c.recipient_source);
  };

  const handleApplyAI = (html: string) => {
    setHtmlBody(html);
    setComposeKind('raw_html');
  };

  return (
    <div className="flex gap-6">
      {/* Main composer */}
      <div className="flex-1 space-y-6">
        <EmailComposer
          subject={subject}
          onSubjectChange={setSubject}
          composeKind={composeKind}
          onComposeKindChange={setComposeKind}
          htmlBody={htmlBody}
          onHtmlBodyChange={setHtmlBody}
          formPayload={formPayload}
          onFormPayloadChange={setFormPayload}
          codeTextareaRef={codeTextareaRef as React.RefObject<HTMLTextAreaElement>}
        />

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-1" /> Save Draft
          </Button>
          <Dialog open={confirmSendOpen} onOpenChange={setConfirmSendOpen}>
            <DialogTrigger asChild>
              <Button><Send className="h-4 w-4 mr-1" /> Review & Send</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Send</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <p><strong>Subject:</strong> {subject || '(empty)'}</p>
                <p><strong>Source:</strong> {recipientSource.type.replace('_', ' ')}</p>
                <p className="text-muted-foreground">This will send the campaign to all matched recipients.</p>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setConfirmSendOpen(false)}>Cancel</Button>
                <Button onClick={handleSend}>Send Now</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Separator />
        <CampaignHistory campaigns={campaigns} onLoadDraft={handleLoadDraft} onSend={() => setConfirmSendOpen(true)} />
        <Separator />
        <EmailActivity events={MOCK_EVENTS} />
      </div>

      {/* Right sidebar */}
      <div className="w-72 space-y-6 shrink-0">
        <RecipientPanel source={recipientSource} onSourceChange={setRecipientSource} />
        <Separator />
        <MergeTagsPanel
          composeKind={composeKind}
          codeTextareaRef={codeTextareaRef as React.RefObject<HTMLTextAreaElement>}
          htmlBody={htmlBody}
          onHtmlBodyChange={setHtmlBody}
        />
        <Separator />

        {/* Test send */}
        <div className="space-y-2">
          <Label className="font-semibold text-sm">Test Send</Label>
          <div className="flex gap-1">
            <Input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="test@example.com" className="flex-1" />
            <Button variant="outline" size="sm" onClick={handleTestSend}>Send</Button>
          </div>
        </div>

        <Separator />

        {/* Save as template */}
        <div className="space-y-2">
          <Label className="font-semibold text-sm">Save as Template</Label>
          <div className="flex gap-1">
            <Input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Template name" className="flex-1" />
            <Button variant="outline" size="sm" onClick={handleSaveAsTemplate}><FileText className="h-4 w-4" /></Button>
          </div>
        </div>

        <Separator />

        {/* AI Chat Designer */}
        <AIChatDesigner onApply={handleApplyAI} />
      </div>
    </div>
  );
}

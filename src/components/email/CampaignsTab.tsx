import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { EmailCampaign, ComposeKind, RecipientSource, AnnouncementForm, BrandSettings } from '@/types/email-types';
import { emptyAnnouncementForm, extractAnnouncementDefaultsFromRegionalHtml, isValidAnnouncementForSave, payloadToAnnouncementForm } from '@/lib/email-utils';
import { buildFormPayloadFromImportedHtml } from '@/lib/email-html-import-flow';
import { CampaignEmailBuilder } from './CampaignEmailBuilder';
import { CampaignsLandingEmpty } from './CampaignsLandingEmpty';
import { CampaignsLandingReturning } from './CampaignsLandingReturning';
import { StarterLibraryDialog } from './StarterLibraryDialog';
import { EmailActivity } from './EmailActivity';
import { MOCK_CAMPAIGNS, MOCK_EVENTS, MOCK_TALENT_POOLS } from '@/data/email-mock-data';
import type { StarterTemplate } from '@/data/email-mock-data';
import type { ActiveStarterMeta } from './CampaignEmailBuilder';
import type { AICampaignFormFields } from '@/adapters/ai';
import { STARTER_TEMPLATES } from '@/data/email-mock-data';

function getInitialCampaigns(): EmailCampaign[] {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('email-module-seed-campaigns') === '1') {
      return MOCK_CAMPAIGNS;
    }
  } catch {
    /* ignore */
  }
  return [];
}

function resolvePoolLabel(source: RecipientSource): string {
  if (source.type === 'talent_pool' && source.pool_id) {
    return MOCK_TALENT_POOLS.find(p => p.id === source.pool_id)?.name ?? 'Talent pool';
  }
  if (source.type === 'ats') {
    const sys = (source.system || 'ATS').replace(/\b\w/g, c => c.toUpperCase());
    return `${sys} · Pipeline`;
  }
  return source.type.replace(/_/g, ' ');
}

export interface InjectedCampaignDraft {
  /** Unique per injection so StrictMode does not double-apply */
  nonce: number;
  subject: string;
  html_body: string;
  compose_kind: ComposeKind;
  form_payload: AnnouncementForm | null;
}

interface CampaignsTabProps {
  onSaveAsTemplate?: (name: string, subject: string, htmlBody: string, kind: ComposeKind, formPayload: AnnouncementForm | null) => void;
  brandSettings: BrandSettings;
  injectedDraft: InjectedCampaignDraft | null;
  onInjectedDraftConsumed: () => void;
}

export function CampaignsTab({
  onSaveAsTemplate: _onSaveAsTemplate,
  brandSettings,
  injectedDraft,
  onInjectedDraftConsumed,
}: CampaignsTabProps) {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(getInitialCampaigns);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [starterModalOpen, setStarterModalOpen] = useState(false);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [initialBuilderTab, setInitialBuilderTab] = useState<'form' | 'ai'>('form');

  const [subject, setSubject] = useState('');
  const [composeKind, setComposeKind] = useState<ComposeKind>('announcement_form');
  const [htmlBody, setHtmlBody] = useState('');
  const [formPayload, setFormPayload] = useState<AnnouncementForm>(() => ({
    ...emptyAnnouncementForm(),
    signOff: `Best,\n${brandSettings.companyName} Team`,
  }));
  const [recipientSource, setRecipientSource] = useState<RecipientSource>({ type: 'talent_pool' });
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [activeStarter, setActiveStarter] = useState<ActiveStarterMeta | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);

  const appliedInjectNonce = useRef<number | null>(null);

  useEffect(() => {
    setFormPayload(prev => ({ ...prev, signOff: prev.signOff || `Best,\n${brandSettings.companyName} Team` }));
  }, [brandSettings.companyName]);

  const openFreshBuilder = useCallback(
    (tab: 'form' | 'ai' = 'form') => {
      setSubject('');
      setHtmlBody('');
      setComposeKind('announcement_form');
      setFormPayload({ ...emptyAnnouncementForm(), signOff: `Best,\n${brandSettings.companyName} Team` });
      setRecipientSource({ type: 'talent_pool' });
      setVariableValues({});
      setActiveStarter(null);
      setEditingCampaignId(null);
      setInitialBuilderTab(tab);
      setBuilderOpen(true);
    },
    [brandSettings.companyName],
  );

  useEffect(() => {
    if (!injectedDraft) {
      appliedInjectNonce.current = null;
      return;
    }
    if (appliedInjectNonce.current === injectedDraft.nonce) return;
    appliedInjectNonce.current = injectedDraft.nonce;
    setSubject(injectedDraft.subject);
    setHtmlBody(injectedDraft.html_body);
    setComposeKind(injectedDraft.compose_kind);
    setFormPayload(
      injectedDraft.form_payload
        ? payloadToAnnouncementForm(injectedDraft.form_payload)
        : { ...emptyAnnouncementForm(), signOff: `Best,\n${brandSettings.companyName} Team` },
    );
    setActiveStarter(null);
    setVariableValues({});
    setEditingCampaignId(null);
    setInitialBuilderTab('form');
    setBuilderOpen(true);
    onInjectedDraftConsumed();
    toast.success('Template loaded');
  }, [injectedDraft, onInjectedDraftConsumed, brandSettings.companyName]);

  const loadStarterTemplate = (t: StarterTemplate) => {
    setHtmlBody(t.html);
    setSubject(t.subject);
    setActiveStarter({ id: t.id, name: t.name, category: t.category });
    setComposeKind('raw_html');
    const fromRegions = extractAnnouncementDefaultsFromRegionalHtml(t.html);
    setFormPayload({
      ...emptyAnnouncementForm(),
      ...fromRegions,
      signOff: fromRegions.signOff?.trim() ? fromRegions.signOff : `Best,\n${brandSettings.companyName} Team`,
    });
    setVariableValues({});
    setEditingCampaignId(null);
    setInitialBuilderTab('form');
    setBuilderOpen(true);
    toast.success('Template loaded');
  };

  const loadJobAnnouncementQuick = () => {
    const t = STARTER_TEMPLATES.find(x => x.id === 'starter-1');
    if (t) loadStarterTemplate(t);
  };

  const handleScratchHtml = (html: string) => {
    setHtmlBody(html);
    setComposeKind('raw_html');
    setSubject('');
    setFormPayload(buildFormPayloadFromImportedHtml(html, `Best,\n${brandSettings.companyName} Team`));
    setActiveStarter(null);
    setVariableValues({});
    setRecipientSource({ type: 'talent_pool' });
    setEditingCampaignId(null);
    setInitialBuilderTab('form');
    setBuilderOpen(true);
  };

  const handleAIFromLanding = (fields: AICampaignFormFields) => {
    setSubject(fields.subject);
    setHtmlBody('');
    setComposeKind('announcement_form');
    setFormPayload({
      ...emptyAnnouncementForm(),
      previewText: fields.previewText,
      headline: fields.headline,
      subhead: fields.subhead,
      message: fields.message,
      buttonLabel: fields.buttonLabel,
      buttonUrl: fields.buttonUrl,
      signOff: fields.signOff,
    });
    setActiveStarter(null);
    setVariableValues({});
    setRecipientSource({ type: 'talent_pool' });
    setEditingCampaignId(null);
    setInitialBuilderTab('form');
    setBuilderOpen(true);
    toast.success('AI generated');
  };

  const handleContinueDraft = (c: EmailCampaign) => {
    setSubject(c.subject);
    setHtmlBody(c.html_body);
    setComposeKind(c.compose_kind);
    setFormPayload(c.form_payload ? payloadToAnnouncementForm(c.form_payload) : { ...emptyAnnouncementForm(), signOff: `Best,\n${brandSettings.companyName} Team` });
    setRecipientSource(c.recipient_source);
    setActiveStarter(null);
    setVariableValues({});
    setEditingCampaignId(c.id);
    setInitialBuilderTab('form');
    setBuilderOpen(true);
  };

  const saveDraftToState = useCallback(() => {
    const pool_label = resolvePoolLabel(recipientSource);
    const payload: AnnouncementForm | null = composeKind === 'announcement_form' ? formPayload : null;

    if (editingCampaignId) {
      setCampaigns(prev =>
        prev.map(c =>
          c.id === editingCampaignId
            ? {
                ...c,
                subject,
                html_body: htmlBody,
                compose_kind: composeKind,
                form_payload: payload,
                recipient_source: recipientSource,
                pool_label,
              }
            : c,
        ),
      );
    } else {
      const newCampaign: EmailCampaign = {
        id: `camp-${Date.now()}`,
        site_id: 'site-1',
        subject,
        html_body: htmlBody,
        compose_kind: composeKind,
        form_payload: payload,
        status: 'draft',
        recipient_source: recipientSource,
        sent_at: null,
        created_by: 'user-1',
        created_at: new Date().toISOString(),
        pool_label,
      };
      setCampaigns(prev => [newCampaign, ...prev]);
      setEditingCampaignId(newCampaign.id);
    }
    setLastSavedAt(Date.now());
  }, [composeKind, editingCampaignId, formPayload, htmlBody, recipientSource, subject]);

  const handleAutosave = useCallback(() => {
    if (!builderOpen) return;
    if (!subject.trim() && !htmlBody.trim() && !isValidAnnouncementForSave(formPayload)) return;
    saveDraftToState();
  }, [builderOpen, subject, htmlBody, formPayload, saveDraftToState]);

  const handleSaveDraft = () => {
    saveDraftToState();
  };

  const handleSend = () => {
    setConfirmSendOpen(false);
    toast.success('Campaign sent (stubbed)');
    setBuilderOpen(false);
  };

  const handleTestSend = (_email: string) => {
    /* stub — toast in builder */
  };

  const handleBackFromBuilder = () => {
    if (subject.trim() || htmlBody.trim() || isValidAnnouncementForSave(formPayload)) {
      saveDraftToState();
    }
    setBuilderOpen(false);
  };

  if (builderOpen) {
    return (
      <div className="space-y-4">
        <StarterLibraryDialog open={starterModalOpen} onOpenChange={setStarterModalOpen} onSelect={loadStarterTemplate} />
        <CampaignEmailBuilder
          brandSettings={brandSettings}
          activeStarter={activeStarter}
          subject={subject}
          onSubjectChange={setSubject}
          formPayload={formPayload}
          onFormPayloadChange={setFormPayload}
          htmlBody={htmlBody}
          onHtmlBodyChange={setHtmlBody}
          composeKind={composeKind}
          onComposeKindChange={setComposeKind}
          recipientSource={recipientSource}
          onRecipientSourceChange={setRecipientSource}
          variableValues={variableValues}
          onVariableValuesChange={setVariableValues}
          onOpenTemplatePicker={() => setStarterModalOpen(true)}
          lastSavedAt={lastSavedAt}
          onAutosave={handleAutosave}
          onBack={handleBackFromBuilder}
          onSaveDraft={handleSaveDraft}
          onSendTest={handleTestSend}
          onReviewSend={() => setConfirmSendOpen(true)}
          initialBuilderTab={initialBuilderTab}
        />
        <Dialog open={confirmSendOpen} onOpenChange={setConfirmSendOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm send</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Subject:</strong> {subject || '(empty)'}
              </p>
              <p>
                <strong>Source:</strong> {recipientSource.type.replace('_', ' ')}
              </p>
              <p className="text-muted-foreground">This will send the campaign to all matched recipients.</p>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setConfirmSendOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend}>Send now</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StarterLibraryDialog open={starterModalOpen} onOpenChange={setStarterModalOpen} onSelect={loadStarterTemplate} />
      <CampaignsLandingEmpty
        brandSettings={brandSettings}
        onOpenStarterModal={() => setStarterModalOpen(true)}
        onSelectStarter={loadStarterTemplate}
        onOpenScratch={() => openFreshBuilder('form')}
        onScratchHtml={handleScratchHtml}
        onAIGenerated={handleAIFromLanding}
        hasSavedCampaigns={campaigns.length > 0}
      />
      {campaigns.length > 0 && (
        <CampaignsLandingReturning
          campaigns={campaigns}
          onContinueDraft={handleContinueDraft}
          onQuickJobAnnouncement={loadJobAnnouncementQuick}
          onQuickAI={() => openFreshBuilder('ai')}
          onQuickBlank={() => openFreshBuilder('form')}
          hideQuickStart
        />
      )}
      <EmailActivity events={MOCK_EVENTS} />
    </div>
  );
}

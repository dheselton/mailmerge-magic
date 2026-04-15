import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { CampaignEmailBuilder } from '@/components/email/CampaignEmailBuilder';
import { StarterLibraryDialog } from '@/components/email/StarterLibraryDialog';
import { CampaignsLandingEmpty } from '@/components/email/CampaignsLandingEmpty';
import type { ActiveStarterMeta } from '@/components/email/CampaignEmailBuilder';
import type { BrandSettings, ComposeKind, RecipientSource, AnnouncementForm } from '@/types/email-types';
import { DEFAULT_BRAND_SETTINGS } from '@/types/email-types';
import { emptyAnnouncementForm, extractAnnouncementDefaultsFromRegionalHtml } from '@/lib/email-utils';
import { buildFormPayloadFromImportedHtml } from '@/lib/email-html-import-flow';
import type { StarterTemplate } from '@/data/email-mock-data';
import type { AICampaignFormFields } from '@/adapters/ai';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';
import { MOCK_TALENT_POOLS } from '@/data/email-mock-data';

const STEPS = ['Details', 'Template', 'Sequence', 'Audience', 'Review'] as const;

type LocationState = { brandSettings?: BrandSettings } | undefined;

export default function EmailCampaignWizardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [brandSettings] = useState<BrandSettings>(() => (location.state as LocationState)?.brandSettings ?? DEFAULT_BRAND_SETTINGS);

  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState('');

  const [starterModalOpen, setStarterModalOpen] = useState(false);
  const [templateStepMode, setTemplateStepMode] = useState<'pick' | 'edit'>('pick');

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

  useEffect(() => {
    setFormPayload(prev => ({ ...prev, signOff: prev.signOff || `Best,\n${brandSettings.companyName} Team` }));
  }, [brandSettings.companyName]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (step !== 2 || templateStepMode !== 'edit') return;
      if (!subject.trim() && !htmlBody.trim()) return;
      setLastSavedAt(Date.now());
    }, 30_000);
    return () => window.clearInterval(id);
  }, [step, templateStepMode, subject, htmlBody]);

  const loadStarterTemplate = useCallback((t: StarterTemplate) => {
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
    setTemplateStepMode('edit');
    toast.success('Template loaded');
  }, [brandSettings.companyName]);

  const handleScratchHtml = useCallback(
    (html: string) => {
      setHtmlBody(html);
      setComposeKind('raw_html');
      setSubject('');
      setFormPayload(buildFormPayloadFromImportedHtml(html, `Best,\n${brandSettings.companyName} Team`));
      setActiveStarter(null);
      setVariableValues({});
      setTemplateStepMode('edit');
    },
    [brandSettings.companyName],
  );

  const handleAIFromLanding = useCallback(
    (fields: AICampaignFormFields) => {
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
      setTemplateStepMode('edit');
      toast.success('AI generated');
    },
    [],
  );

  const openFreshScratch = useCallback(() => {
    setSubject('');
    setHtmlBody('');
    setComposeKind('announcement_form');
    setFormPayload({ ...emptyAnnouncementForm(), signOff: `Best,\n${brandSettings.companyName} Team` });
    setActiveStarter(null);
    setVariableValues({});
    setTemplateStepMode('edit');
  }, [brandSettings.companyName]);

  const canContinueFromTemplate =
    templateStepMode === 'edit' && (subject.trim().length > 0 || htmlBody.trim().length > 0 || formPayload.headline.trim().length > 0);

  const finishWizard = () => {
    toast.success('Campaign saved (stub) — returning to Email');
    navigate('/email');
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/email" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Email
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <h1 className="text-xl font-semibold">New campaign</h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-4">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          return (
            <div
              key={label}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted/40 text-muted-foreground'
              }`}
            >
              <span className="tabular-nums">{n}</span>
              {label}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign details</CardTitle>
            <CardDescription>Name your campaign. You can change this later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wiz-name">Campaign name</Label>
              <Input id="wiz-name" value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="e.g. Q2 engineering outreach" />
            </div>
            <Button onClick={() => setStep(2)} disabled={!campaignName.trim()}>
              Continue to template
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <StarterLibraryDialog open={starterModalOpen} onOpenChange={setStarterModalOpen} onSelect={loadStarterTemplate} />
          {templateStepMode === 'pick' ? (
            <Card>
              <CardHeader>
                <CardTitle>Choose email template</CardTitle>
                <CardDescription>Select a starter, use AI, or bring your own HTML—then refine in the editor.</CardDescription>
              </CardHeader>
              <CardContent>
                <CampaignsLandingEmpty
                  brandSettings={brandSettings}
                  onOpenStarterModal={() => setStarterModalOpen(true)}
                  onSelectStarter={loadStarterTemplate}
                  onOpenScratch={openFreshScratch}
                  onScratchHtml={handleScratchHtml}
                  onAIGenerated={handleAIFromLanding}
                />
              </CardContent>
            </Card>
          ) : (
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
              onAutosave={() => {
                if (!subject.trim() && !htmlBody.trim()) return;
                setLastSavedAt(Date.now());
              }}
              onBack={() => setTemplateStepMode('pick')}
              onSaveDraft={() => {
                setLastSavedAt(Date.now());
                toast.success('Draft saved (wizard)');
              }}
              onSendTest={() => {}}
              onReviewSend={() => toast.info('Use Review step to send')}
              initialBuilderTab="form"
            />
          )}
          <div className="flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            {templateStepMode === 'edit' && (
              <Button onClick={() => setStep(3)} disabled={!canContinueFromTemplate}>
                Continue to sequence
              </Button>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Sequence</CardTitle>
            <CardDescription>When the first message sends and how follow-ups are spaced (stub).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" className="h-auto py-4 justify-start text-left">
                Send immediately when I launch
              </Button>
              <Button variant="ghost" className="h-auto py-4 justify-start text-left">
                Schedule for later
              </Button>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">Custom delays between emails (placeholder).</p>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)}>Continue to audience</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Select audience</CardTitle>
            <CardDescription>Who receives this campaign (stub—connect to talent pools later).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Talent pools</Label>
              <div className="rounded-md border p-3 space-y-2 max-h-40 overflow-y-auto">
                {MOCK_TALENT_POOLS.slice(0, 4).map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <Checkbox id={p.id} />
                    <span>{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="rounded-md bg-muted/50 border p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Estimated recipients</p>
                <p className="text-xs text-muted-foreground">Based on current filters (stub)</p>
              </div>
              <span className="text-2xl font-semibold tabular-nums">0</span>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={() => setStep(5)}>Continue to review</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Review</CardTitle>
            <CardDescription>Confirm before launch (stub).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">Campaign:</span> {campaignName || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Subject:</span> {subject || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Template:</span> {activeStarter?.name ?? (htmlBody.trim() ? 'Custom HTML' : 'Simple')}
            </p>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(4)}>
                Back
              </Button>
              <Button onClick={finishWizard}>Save & finish</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

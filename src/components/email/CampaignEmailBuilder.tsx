import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RecipientPanel } from './RecipientPanel';
import { EmailAIChatPanel } from './EmailAIChatPanel';
import { ChevronDown, Monitor, Smartphone, ArrowLeft, Upload, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { AnnouncementForm, BrandSettings, ComposeKind, RecipientSource } from '@/types/email-types';
import {
  buildCrmMergePreviewMap,
  buildCampaignEmailPreviewDocument,
  buildMergeTokenUsageReport,
  stripEmailScripts,
  renderAnnouncementToHTML,
  extractMergeVars,
  applyBrandPrimaryToHtmlPreview,
  resolveMergeTagsInString,
  insertIntoTextarea,
  insertIntoInput,
  replaceRangeInInput,
  clearedRichBodyFields,
} from '@/lib/email-utils';
import { OpenMojiIcon } from '@/components/ui/OpenMojiIcon';
import type { PrepareRegionMappingResult } from '@/lib/email-region-detection';
import { buildFormPayloadFromImportedHtml, planScratchEmailHtmlImport, SCRATCH_HTML_IMPORT_COPY } from '@/lib/email-html-import-flow';
import { MERGE_TAG_CATALOG, buildUniversalMergeTagKeys } from '@/lib/merge-tags-catalog';
import { RegionMappingReviewDialog } from '@/components/email/RegionMappingReviewDialog';
import { EmailImagesPanel } from '@/components/email/EmailImagesPanel';
import { quickEditMessageBody } from '@/adapters/ai';
import type { AICampaignFormFields } from '@/adapters/ai';
import { cn } from '@/lib/utils';

export interface ActiveStarterMeta {
  id: string;
  name: string;
  category: string;
}

export interface CampaignEmailBuilderProps {
  brandSettings: BrandSettings;
  activeStarter: ActiveStarterMeta | null;
  subject: string;
  onSubjectChange: (v: string) => void;
  formPayload: AnnouncementForm;
  onFormPayloadChange: (f: AnnouncementForm) => void;
  htmlBody: string;
  onHtmlBodyChange: (h: string) => void;
  composeKind: ComposeKind;
  onComposeKindChange: (k: ComposeKind) => void;
  recipientSource: RecipientSource;
  onRecipientSourceChange: (s: RecipientSource) => void;
  variableValues: Record<string, string>;
  onVariableValuesChange: (m: Record<string, string>) => void;
  onOpenTemplatePicker: () => void;
  lastSavedAt: number | null;
  onAutosave: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onSendTest: (email: string) => void;
  onReviewSend: () => void;
  initialBuilderTab?: 'form' | 'ai';
}

type FocusField =
  | 'subject'
  | 'previewText'
  | 'eyebrow'
  | 'headline'
  | 'subhead'
  | 'message'
  | 'buttonLabel'
  | 'buttonUrl'
  | 'signOff';

function insertTokenIntoField(
  field: FocusField,
  token: string,
  refs: {
    subjectRef: React.RefObject<HTMLInputElement | null>;
    previewRef: React.RefObject<HTMLInputElement | null>;
    eyebrowRef: React.RefObject<HTMLInputElement | null>;
    headlineRef: React.RefObject<HTMLInputElement | null>;
    subheadRef: React.RefObject<HTMLInputElement | null>;
    messageRef: React.RefObject<HTMLTextAreaElement | null>;
    buttonLabelRef: React.RefObject<HTMLInputElement | null>;
    buttonUrlRef: React.RefObject<HTMLInputElement | null>;
    signOffRef: React.RefObject<HTMLInputElement | null>;
  },
  subject: string,
  onSubjectChange: (v: string) => void,
  formPayload: AnnouncementForm,
  onFormPayloadChange: (f: AnnouncementForm) => void,
) {
  const t = token.startsWith('{{') ? token : `{{${token.replace(/[{}]/g, '')}}}`;
  if (field === 'subject' && refs.subjectRef.current) {
    insertIntoInput(refs.subjectRef.current, t, subject, onSubjectChange);
    return;
  }
  if (field === 'previewText' && refs.previewRef.current) {
    insertIntoInput(refs.previewRef.current, t, formPayload.previewText, v => onFormPayloadChange({ ...formPayload, previewText: v }));
    return;
  }
  if (field === 'eyebrow' && refs.eyebrowRef.current) {
    insertIntoInput(refs.eyebrowRef.current, t, formPayload.eyebrow, v => onFormPayloadChange({ ...formPayload, eyebrow: v }));
    return;
  }
  if (field === 'headline' && refs.headlineRef.current) {
    insertIntoInput(refs.headlineRef.current, t, formPayload.headline, v => onFormPayloadChange({ ...formPayload, headline: v }));
    return;
  }
  if (field === 'subhead' && refs.subheadRef.current) {
    insertIntoInput(refs.subheadRef.current, t, formPayload.subhead, v => onFormPayloadChange({ ...formPayload, subhead: v }));
    return;
  }
  if (field === 'message' && refs.messageRef.current) {
    insertIntoTextarea(refs.messageRef.current, t, formPayload.message, v =>
      onFormPayloadChange({ ...formPayload, message: v, ...clearedRichBodyFields() }),
    );
    return;
  }
  if (field === 'buttonLabel' && refs.buttonLabelRef.current) {
    insertIntoInput(refs.buttonLabelRef.current, t, formPayload.buttonLabel, v => onFormPayloadChange({ ...formPayload, buttonLabel: v }));
    return;
  }
  if (field === 'buttonUrl' && refs.buttonUrlRef.current) {
    insertIntoInput(refs.buttonUrlRef.current, t, formPayload.buttonUrl, v => onFormPayloadChange({ ...formPayload, buttonUrl: v }));
    return;
  }
  if (field === 'signOff' && refs.signOffRef.current) {
    insertIntoInput(refs.signOffRef.current, t, formPayload.signOff, v => onFormPayloadChange({ ...formPayload, signOff: v }));
    return;
  }
  if (field === 'subject') onSubjectChange(subject + t);
  else if (field === 'previewText') onFormPayloadChange({ ...formPayload, previewText: formPayload.previewText + t });
  else if (field === 'eyebrow') onFormPayloadChange({ ...formPayload, eyebrow: formPayload.eyebrow + t });
  else if (field === 'headline') onFormPayloadChange({ ...formPayload, headline: formPayload.headline + t });
  else if (field === 'subhead') onFormPayloadChange({ ...formPayload, subhead: formPayload.subhead + t });
  else if (field === 'message')
    onFormPayloadChange({ ...formPayload, message: formPayload.message + t, ...clearedRichBodyFields() });
  else if (field === 'buttonLabel') onFormPayloadChange({ ...formPayload, buttonLabel: formPayload.buttonLabel + t });
  else if (field === 'signOff') onFormPayloadChange({ ...formPayload, signOff: formPayload.signOff + t });
  else onFormPayloadChange({ ...formPayload, buttonUrl: formPayload.buttonUrl + t });
}

export function CampaignEmailBuilder({
  brandSettings,
  activeStarter,
  subject,
  onSubjectChange,
  formPayload,
  onFormPayloadChange,
  htmlBody,
  onHtmlBodyChange,
  composeKind,
  onComposeKindChange,
  recipientSource,
  onRecipientSourceChange,
  variableValues,
  onVariableValuesChange,
  onOpenTemplatePicker,
  lastSavedAt,
  onAutosave,
  onBack,
  onSaveDraft,
  onSendTest,
  onReviewSend,
  initialBuilderTab = 'form',
}: CampaignEmailBuilderProps) {
  const [leftTab, setLeftTab] = useState<'form' | 'ai'>(initialBuilderTab);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [focusField, setFocusField] = useState<FocusField | null>('subject');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [mentionState, setMentionState] = useState<{ field: FocusField; at: number; filter: string } | null>(null);
  const [regionReviewOpen, setRegionReviewOpen] = useState(false);
  const [regionReviewPrepare, setRegionReviewPrepare] = useState<PrepareRegionMappingResult | null>(null);
  const [mapGuideOpen, setMapGuideOpen] = useState(true);
  const [pasteDialogOpen, setPasteDialogOpen] = useState(false);
  const [pasteBuffer, setPasteBuffer] = useState('');
  const fileImportRef = useRef<HTMLInputElement>(null);
  const [mergePreviewMode, setMergePreviewMode] = useState<'tokens' | 'sample'>('sample');

  const subjectRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLInputElement>(null);
  const eyebrowRef = useRef<HTMLInputElement>(null);
  const headlineRef = useRef<HTMLInputElement>(null);
  const subheadRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const buttonLabelRef = useRef<HTMLInputElement>(null);
  const buttonUrlRef = useRef<HTMLInputElement>(null);
  const signOffRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLeftTab(initialBuilderTab);
  }, [initialBuilderTab]);

  useEffect(() => {
    const id = window.setInterval(() => onAutosave(), 30_000);
    return () => window.clearInterval(id);
  }, [onAutosave]);

  const crmPreviewMap = useMemo(
    () => buildCrmMergePreviewMap(brandSettings, variableValues, formPayload.buttonUrl),
    [brandSettings, variableValues, formPayload.buttonUrl],
  );

  const iframeSrc = useMemo(() => {
    const clean = stripEmailScripts(htmlBody);
    if (clean.trim()) {
      const merged = buildCampaignEmailPreviewDocument(clean, formPayload, crmPreviewMap, mergePreviewMode);
      return applyBrandPrimaryToHtmlPreview(merged, brandSettings);
    }
    return renderAnnouncementToHTML(
      formPayload,
      { siteName: brandSettings.companyName, memberName: 'Jane Doe' },
      brandSettings,
    );
  }, [htmlBody, formPayload, brandSettings, crmPreviewMap, mergePreviewMode]);

  const mergeUsageRows = useMemo(
    () => buildMergeTokenUsageReport({ subject, form: formPayload, htmlBody, crmMap: crmPreviewMap }),
    [subject, formPayload, htmlBody, crmPreviewMap],
  );

  const fieldRefs = useMemo(
    () => ({
      subjectRef,
      previewRef,
      eyebrowRef,
      headlineRef,
      subheadRef,
      messageRef,
      buttonLabelRef,
      buttonUrlRef,
      signOffRef,
    }),
    [],
  );

  const universalKeys = useMemo(
    () => buildUniversalMergeTagKeys(htmlBody, Object.keys(variableValues)),
    [htmlBody, variableValues],
  );

  const mergePaletteGroups = useMemo(() => {
    const order = ['Candidate', 'Job', 'Recruiter', 'Event', 'Interview', 'System', 'Other'] as const;
    const map = new Map<string, { key: string; label: string }[]>();
    for (const def of MERGE_TAG_CATALOG) {
      if (!universalKeys.includes(def.key)) continue;
      const list = map.get(def.category) ?? [];
      list.push({ key: def.key, label: def.label });
      map.set(def.category, list);
    }
    for (const k of universalKeys) {
      if (MERGE_TAG_CATALOG.some(d => d.key === k)) continue;
      const list = map.get('Other') ?? [];
      if (!list.some(x => x.key === k)) list.push({ key: k, label: k });
      map.set('Other', list);
    }
    return order.flatMap(cat => {
      const tags = map.get(cat);
      return tags && tags.length > 0 ? [{ category: cat, tags }] : [];
    });
  }, [universalKeys]);

  const filteredMentionKeys = useMemo(() => {
    if (!mentionState) return [];
    const q = mentionState.filter;
    return universalKeys.filter(k => !q || k.toLowerCase().includes(q));
  }, [mentionState, universalKeys]);

  const syncMentionFromField = (field: FocusField, el: HTMLInputElement | HTMLTextAreaElement, value: string) => {
    setMentionState(prev => {
      if (!prev || prev.field !== field) return prev;
      if (value[prev.at] !== '@') return null;
      const caret = el.selectionStart ?? value.length;
      if (caret < prev.at) return null;
      const chunk = value.slice(prev.at + 1, caret);
      if (/\s/.test(chunk)) return null;
      return { ...prev, filter: chunk.toLowerCase() };
    });
  };

  const handleFieldKeyDown = (field: FocusField) => (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === '@') {
      const el = e.currentTarget;
      const at = el.selectionStart ?? 0;
      setMentionState({ field, at, filter: '' });
    }
    if (e.key === 'Escape') setMentionState(null);
  };

  const getFieldEl = (field: FocusField): HTMLInputElement | HTMLTextAreaElement | null => {
    const r =
      field === 'subject'
        ? subjectRef
        : field === 'previewText'
          ? previewRef
          : field === 'eyebrow'
            ? eyebrowRef
            : field === 'headline'
              ? headlineRef
              : field === 'subhead'
                ? subheadRef
                : field === 'message'
                  ? messageRef
                  : field === 'buttonLabel'
                    ? buttonLabelRef
                    : field === 'buttonUrl'
                      ? buttonUrlRef
                      : signOffRef;
    return r.current;
  };

  const getFieldValue = (field: FocusField): string => {
    if (field === 'subject') return subject;
    if (field === 'previewText') return formPayload.previewText;
    if (field === 'eyebrow') return formPayload.eyebrow;
    if (field === 'headline') return formPayload.headline;
    if (field === 'subhead') return formPayload.subhead;
    if (field === 'message') return formPayload.message;
    if (field === 'buttonLabel') return formPayload.buttonLabel;
    if (field === 'buttonUrl') return formPayload.buttonUrl;
    return formPayload.signOff;
  };

  const applyFieldValue = (field: FocusField, value: string) => {
    if (field === 'subject') onSubjectChange(value);
    else if (field === 'previewText') onFormPayloadChange({ ...formPayload, previewText: value });
    else if (field === 'eyebrow') onFormPayloadChange({ ...formPayload, eyebrow: value });
    else if (field === 'headline') onFormPayloadChange({ ...formPayload, headline: value });
    else if (field === 'subhead') onFormPayloadChange({ ...formPayload, subhead: value });
    else if (field === 'message')
      onFormPayloadChange({ ...formPayload, message: value, ...clearedRichBodyFields() });
    else if (field === 'buttonLabel') onFormPayloadChange({ ...formPayload, buttonLabel: value });
    else if (field === 'buttonUrl') onFormPayloadChange({ ...formPayload, buttonUrl: value });
    else onFormPayloadChange({ ...formPayload, signOff: value });
  };

  const applyMentionToken = (key: string) => {
    const m = mentionState;
    if (!m) return;
    const el = getFieldEl(m.field);
    if (!el) return;
    const val = getFieldValue(m.field);
    const caret = el.selectionStart ?? val.length;
    const token = `{{${key}}}`;
    replaceRangeInInput(el, val, m.at, caret, token, nv => applyFieldValue(m.field, nv));
    setMentionState(null);
  };

  const insertUniversalToken = (rawKey: string) => {
    const tok = rawKey.startsWith('{{') ? rawKey : `{{${rawKey.replace(/[{}]/g, '')}}}`;
    if (!focusField) {
      toast.info('Click into a field first, then insert a token.');
      return;
    }
    insertTokenIntoField(focusField, tok, fieldRefs, subject, onSubjectChange, formPayload, onFormPayloadChange);
  };

  const finalizeRegionalHtml = (html: string, toastMsg?: string) => {
    onHtmlBodyChange(html);
    onComposeKindChange('raw_html');
    const signDefault = `Best,\n${brandSettings.companyName} Team`;
    onFormPayloadChange(buildFormPayloadFromImportedHtml(html, signDefault));
    if (toastMsg) toast.success(toastMsg);
  };

  const beginHtmlImport = (raw: string) => {
    const plan = planScratchEmailHtmlImport(raw);
    if (plan.kind === 'empty') {
      toast.error(SCRATCH_HTML_IMPORT_COPY.noHtmlToImport);
      return;
    }
    if (plan.kind === 'assignable_regions') {
      finalizeRegionalHtml(plan.html, SCRATCH_HTML_IMPORT_COPY.toastAssignableRegions);
      return;
    }
    if (plan.kind === 'static_html') {
      onHtmlBodyChange(plan.html);
      onComposeKindChange('raw_html');
      toast.message(SCRATCH_HTML_IMPORT_COPY.toastStaticFallback);
      return;
    }
    setRegionReviewPrepare(plan.prep);
    setRegionReviewOpen(true);
  };

  const hasDesignedTemplate = stripEmailScripts(htmlBody).trim().length > 0;

  const applyAIFormFields = (fields: AICampaignFormFields) => {
    onSubjectChange(fields.subject);
    onFormPayloadChange({
      ...formPayload,
      previewText: fields.previewText,
      headline: fields.headline,
      subhead: fields.subhead,
      message: fields.message,
      buttonLabel: fields.buttonLabel,
      buttonUrl: fields.buttonUrl,
      signOff: fields.signOff,
      ...clearedRichBodyFields(),
    });
    toast.success('AI suggestions applied — review the Form tab');
    setLeftTab('form');
  };

  const applyPastedHtml = () => {
    if (!pasteBuffer.trim()) {
      toast.error(SCRATCH_HTML_IMPORT_COPY.pasteEmptyError);
      return;
    }
    beginHtmlImport(pasteBuffer);
    setPasteDialogOpen(false);
    setPasteBuffer('');
  };

  const onHtmlFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error('File too large (max 500KB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      beginHtmlImport(String(reader.result || ''));
      toast.success('HTML file loaded');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const missingWarnings = useMemo(() => {
    const keys = [
      ...new Set(
        extractMergeVars(
          subject,
          formPayload.previewText,
          formPayload.eyebrow,
          formPayload.headline,
          formPayload.subhead,
          formPayload.message,
          formPayload.messageRichHtml ?? '',
          formPayload.buttonLabel,
          formPayload.buttonUrl,
          formPayload.signOff,
        ),
      ),
    ];
    const m = buildCrmMergePreviewMap(brandSettings, variableValues, formPayload.buttonUrl);
    return keys.filter(k => !String(m[k] ?? '').trim());
  }, [subject, formPayload, brandSettings, variableValues]);

  const inboxSubject = useMemo(
    () => (mergePreviewMode === 'sample' ? resolveMergeTagsInString(subject, crmPreviewMap) : subject),
    [mergePreviewMode, subject, crmPreviewMap],
  );
  const inboxPreviewLine = useMemo(
    () =>
      mergePreviewMode === 'sample'
        ? resolveMergeTagsInString(formPayload.previewText || 'Preview text', crmPreviewMap)
        : formPayload.previewText || 'Preview text',
    [mergePreviewMode, formPayload.previewText, crmPreviewMap],
  );

  const savedLabel =
    lastSavedAt != null
      ? `Saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex-1 min-w-0 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="font-medium truncate">{activeStarter?.name ?? 'Blank email'}</span>
            {activeStarter && (
              <Badge variant="outline" className="text-[10px] shrink-0">
                {activeStarter.category}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 text-xs"
              onClick={onOpenTemplatePicker}
              title="Opens the starter template library. Choosing a template replaces the email design in the preview."
              aria-label="Browse starter templates. Replaces the current email design when you pick one."
            >
              Browse templates
            </Button>
          </div>
          {!activeStarter && (
            <p className="text-xs text-muted-foreground w-full sm:order-last">
              You’re on a simple blank layout—use Browse templates to load a designed email, or fill the form for a basic message.
            </p>
          )}
          {savedLabel && <span className="text-xs text-muted-foreground sm:ml-auto">{savedLabel}</span>}
        </div>
      </div>

      <div className="flex flex-col-reverse min-[900px]:flex-row gap-4 items-start">
        <div className="w-full min-[900px]:w-[340px] min-[900px]:shrink-0 space-y-4 border rounded-lg p-4 bg-card">
          <Tabs value={leftTab} onValueChange={v => setLeftTab(v as 'form' | 'ai')}>
            <TabsList className="w-full">
              <TabsTrigger value="form" className="flex-1">
                Form
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex-1">
                <span className="inline-flex items-center justify-center gap-2">
                  <OpenMojiIcon name="sparkles" size={18} />
                  AI Builder
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-6 mt-4">
              <Collapsible open={mapGuideOpen} onOpenChange={setMapGuideOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs text-muted-foreground w-full justify-start gap-1">
                    <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                    {hasDesignedTemplate ? 'How the form relates to this template' : 'How the form relates to the preview'}
                    <ChevronDown className={cn('h-3.5 w-3.5 ml-auto transition-transform', mapGuideOpen && 'rotate-180')} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground space-y-2">
                  {hasDesignedTemplate ? (
                    <>
                      <p>
                        <strong className="text-foreground">Designed template:</strong> Subject and preview text control the{' '}
                        <strong className="text-foreground">inbox line</strong> at the top of the live preview. The large white area shows your
                        template HTML. Headline, body, and button fields help with merge tags and the simple fields list—use token buttons or @ in
                        the body so placeholders like {'{{job_title}}'} fill in where possible.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong className="text-foreground">Simple email:</strong> What you type builds the preview directly—subject → bold title
                        in the inbox strip; preview text → gray line under it; headline, message, button, and sign-off → the white email card.
                      </p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>Subject → inbox title (right)</li>
                        <li>Preview text → inbox subtitle</li>
                        <li>Headline, body, CTA, sign-off → email card</li>
                      </ul>
                    </>
                  )}
                </CollapsibleContent>
              </Collapsible>

              <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
                <p className="text-xs font-medium text-foreground">Bring your own HTML</p>
                <p className="text-[11px] text-muted-foreground">{SCRATCH_HTML_IMPORT_COPY.scratchBlurb}</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setPasteDialogOpen(true)}>
                    Paste HTML
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => fileImportRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5 mr-1" />
                    Upload .html
                  </Button>
                  <input ref={fileImportRef} type="file" accept=".html,text/html" className="hidden" onChange={onHtmlFile} />
                </div>
              </div>

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between text-xs">
                    CRM merge tokens (click to insert in focused field)
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-3 rounded-md border bg-muted/15 p-3 max-h-56 overflow-y-auto">
                  <p className="text-[11px] text-muted-foreground">
                    Type <kbd className="font-mono">@</kbd> in any field for autocomplete. Tokens use sample CRM data when the preview toggle is on.
                  </p>
                  {mergePaletteGroups.map(group => (
                    <div key={group.category} className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground tracking-wide">{group.category}</p>
                      <div className="flex flex-wrap gap-1">
                        {group.tags.map(t => (
                          <Button
                            key={t.key}
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="h-7 rounded-full px-2.5 text-[11px] font-mono border border-[#1e3a5f]/25 bg-[#1e3a5f]/12 text-[#1e293b] hover:bg-[#1e3a5f]/20"
                            onClick={() => insertUniversalToken(t.key)}
                          >
                            + {t.key}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              <section className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground tracking-wide">ENVELOPE</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label htmlFor="camp-subject">Subject line *</Label>
                    <span className={cn('text-xs', subject.length >= 55 ? 'text-amber-600' : 'text-muted-foreground')}>
                      {subject.length}/60
                    </span>
                  </div>
                  <Input
                    id="camp-subject"
                    ref={subjectRef}
                    maxLength={60}
                    value={subject}
                    onChange={e => {
                      onSubjectChange(e.target.value);
                      syncMentionFromField('subject', e.currentTarget, e.target.value);
                    }}
                    onKeyDown={handleFieldKeyDown('subject')}
                    onFocus={() => setFocusField('subject')}
                    placeholder="Subject"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="camp-preview">Preview text</Label>
                  <Input
                    id="camp-preview"
                    ref={previewRef}
                    value={formPayload.previewText}
                    onChange={e => {
                      onFormPayloadChange({ ...formPayload, previewText: e.target.value });
                      syncMentionFromField('previewText', e.currentTarget, e.target.value);
                    }}
                    onKeyDown={handleFieldKeyDown('previewText')}
                    onFocus={() => setFocusField('previewText')}
                    placeholder="Shows in inbox below subject"
                  />
                  <p id="hint-preview-text" className="text-[11px] text-muted-foreground">
                    Shows in the inbox preview strip under the subject (right panel).
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground tracking-wide">CONTENT</p>
                <div className="space-y-1">
                  <Label htmlFor="camp-eyebrow">Eyebrow / label</Label>
                  <Input
                    id="camp-eyebrow"
                    ref={eyebrowRef}
                    value={formPayload.eyebrow}
                    onChange={e => {
                      onFormPayloadChange({ ...formPayload, eyebrow: e.target.value });
                      syncMentionFromField('eyebrow', e.currentTarget, e.target.value);
                    }}
                    onKeyDown={handleFieldKeyDown('eyebrow')}
                    onFocus={() => setFocusField('eyebrow')}
                    placeholder="Optional short line above the headline"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="camp-headline">Headline *</Label>
                  <Input
                    id="camp-headline"
                    ref={headlineRef}
                    value={formPayload.headline}
                    onChange={e => {
                      onFormPayloadChange({ ...formPayload, headline: e.target.value });
                      syncMentionFromField('headline', e.currentTarget, e.target.value);
                    }}
                    onKeyDown={handleFieldKeyDown('headline')}
                    onFocus={() => setFocusField('headline')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="camp-subhead">Subheadline</Label>
                  <Input
                    id="camp-subhead"
                    ref={subheadRef}
                    value={formPayload.subhead}
                    onChange={e => {
                      onFormPayloadChange({ ...formPayload, subhead: e.target.value });
                      syncMentionFromField('subhead', e.currentTarget, e.target.value);
                    }}
                    onKeyDown={handleFieldKeyDown('subhead')}
                    onFocus={() => setFocusField('subhead')}
                    placeholder="e.g. team · location · role type (supports merge tokens)"
                  />
                </div>
                <div className="space-y-1 relative">
                  <Label htmlFor="camp-message">Body message *</Label>
                  <Textarea
                    id="camp-message"
                    ref={messageRef}
                    rows={4}
                    className="resize-y min-h-[100px]"
                    value={formPayload.message}
                    onChange={e => {
                      onFormPayloadChange({ ...formPayload, message: e.target.value, ...clearedRichBodyFields() });
                      syncMentionFromField('message', e.currentTarget, e.target.value);
                    }}
                    onFocus={() => setFocusField('message')}
                    onKeyDown={handleFieldKeyDown('message')}
                  />
                  {formPayload.useMessageRichHtml && (formPayload.messageRichHtml ?? '').trim() ? (
                    <div className="space-y-1 pt-1">
                      <p className="text-xs text-muted-foreground">
                        Bullets and other safe HTML from your imported template are shown in the preview. Editing this field
                        switches the preview to plain text (line breaks only).
                      </p>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs"
                        onClick={() => onFormPayloadChange({ ...formPayload, ...clearedRichBodyFields() })}
                      >
                        Use plain body only
                      </Button>
                    </div>
                  ) : null}
                </div>
                {mentionState && (
                  <div
                    className="rounded-md border border-[#1e3a5f]/25 bg-popover p-2 shadow-md max-h-44 overflow-y-auto"
                    role="listbox"
                    aria-label="Token autocomplete"
                  >
                    {filteredMentionKeys.length === 0 ? (
                      <p className="text-xs text-muted-foreground px-1 py-1">No matching tokens.</p>
                    ) : (
                      filteredMentionKeys.map(key => (
                        <button
                          key={key}
                          type="button"
                          className="block w-full text-left px-2 py-1.5 rounded-sm font-mono text-xs hover:bg-muted"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => applyMentionToken(key)}
                        >
                          {`{{${key}}}`}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground tracking-wide">CALL TO ACTION</p>
                <div className="space-y-1">
                  <Label htmlFor="camp-btn-label">Button label</Label>
                  <Input
                    id="camp-btn-label"
                    ref={buttonLabelRef}
                    value={formPayload.buttonLabel}
                    onChange={e => {
                      onFormPayloadChange({ ...formPayload, buttonLabel: e.target.value });
                      syncMentionFromField('buttonLabel', e.currentTarget, e.target.value);
                    }}
                    onKeyDown={handleFieldKeyDown('buttonLabel')}
                    onFocus={() => setFocusField('buttonLabel')}
                    placeholder="View Role & Apply"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="camp-btn-url">Button URL</Label>
                  <Input
                    id="camp-btn-url"
                    ref={buttonUrlRef}
                    value={formPayload.buttonUrl}
                    onChange={e => {
                      onFormPayloadChange({ ...formPayload, buttonUrl: e.target.value });
                      syncMentionFromField('buttonUrl', e.currentTarget, e.target.value);
                    }}
                    onKeyDown={handleFieldKeyDown('buttonUrl')}
                    onFocus={() => setFocusField('buttonUrl')}
                  />
                </div>
              </section>

              <section className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground tracking-wide">SIGNATURE</p>
                <div className="space-y-1">
                  <Label htmlFor="camp-sign">Sign-off</Label>
                  <Input
                    id="camp-sign"
                    ref={signOffRef}
                    value={formPayload.signOff}
                    onChange={e => {
                      onFormPayloadChange({ ...formPayload, signOff: e.target.value });
                      syncMentionFromField('signOff', e.currentTarget, e.target.value);
                    }}
                    onKeyDown={handleFieldKeyDown('signOff')}
                    onFocus={() => setFocusField('signOff')}
                    placeholder={`Best, ${brandSettings.companyName}`}
                  />
                </div>
              </section>

              {missingWarnings.map(v => (
                <p key={v} className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                  ⚠ {`{{${v}}}`} is used but not mapped. Add it above.
                </p>
              ))}

              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    Advanced (HTML)
                    <ChevronDown className={cn('h-4 w-4 transition-transform', advancedOpen && 'rotate-180')} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  <Label className="text-xs">Raw HTML body (optional)</Label>
                  <Textarea
                    rows={6}
                    className="font-mono text-xs"
                    value={htmlBody}
                    onChange={e => onHtmlBodyChange(e.target.value)}
                    placeholder="Paste or edit HTML for starter templates…"
                  />
                  <p className="text-[11px] text-muted-foreground">Leave empty to use the simple layout preview when no template HTML is loaded.</p>
                  <div className="flex gap-2 items-center">
                    <Label className="text-xs">Compose mode</Label>
                    <ToggleGroup
                      type="single"
                      value={composeKind}
                      onValueChange={v => v && onComposeKindChange(v as ComposeKind)}
                      size="sm"
                      variant="outline"
                    >
                      <ToggleGroupItem value="announcement_form">Form</ToggleGroupItem>
                      <ToggleGroupItem value="raw_html">HTML</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4 mt-4">
              <EmailAIChatPanel companyName={brandSettings.companyName} onApplyFields={applyAIFormFields} />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Quick edits (body only)</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onFormPayloadChange({
                        ...formPayload,
                        message: quickEditMessageBody(formPayload.message, 'shorter'),
                        ...clearedRichBodyFields(),
                      })
                    }
                  >
                    Make shorter
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onFormPayloadChange({
                        ...formPayload,
                        message: quickEditMessageBody(formPayload.message, 'personal'),
                        ...clearedRichBodyFields(),
                      })
                    }
                  >
                    More personal
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onFormPayloadChange({
                        ...formPayload,
                        message: quickEditMessageBody(formPayload.message, 'urgency'),
                        ...clearedRichBodyFields(),
                      })
                    }
                  >
                    Add urgency
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <RecipientPanel source={recipientSource} onSourceChange={onRecipientSourceChange} />

          <div className="flex items-center justify-between gap-2 pt-2 border-t">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setTestOpen(true)}>
              📧 Send test
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                onSaveDraft();
                toast.success('Draft saved');
              }}
            >
              Save draft
            </Button>
            <Button size="sm" onClick={onReviewSend}>
              Review & Send →
            </Button>
          </div>
        </div>

        <div className="min-w-0 w-full min-[900px]:flex-1 space-y-4 sticky top-3 z-10 bg-background/95 backdrop-blur-sm pb-2 pt-1 -mt-1 rounded-lg border border-border/60 shadow-sm min-[900px]:top-4 min-[900px]:self-start min-[900px]:max-h-[calc(100vh-6rem)] min-[900px]:overflow-y-auto min-[900px]:px-2 min-[900px]:pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Live preview</span>
            <Badge variant="outline" className="text-[10px] border-green-600/40 text-green-700 bg-green-50">
              ● Auto-updating
            </Badge>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Merge tags:</span>
              <ToggleGroup
                type="single"
                value={mergePreviewMode}
                onValueChange={v => v && setMergePreviewMode(v as 'tokens' | 'sample')}
                size="sm"
                variant="outline"
              >
                <ToggleGroupItem value="tokens" className="text-xs px-2">
                  Show tokens
                </ToggleGroupItem>
                <ToggleGroupItem value="sample" className="text-xs px-2">
                  Sample CRM data
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="ml-auto flex rounded-md border p-0.5">
              <Button
                type="button"
                variant={previewViewport === 'desktop' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-2"
                onClick={() => setPreviewViewport('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={previewViewport === 'mobile' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-2"
                onClick={() => setPreviewViewport('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div id="preview-inbox-strip" className="rounded-lg border bg-muted/30 px-3 py-2 flex items-center gap-3 text-sm">
            <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              HC
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{inboxSubject || '(No subject)'}</p>
              <p className="text-xs text-muted-foreground truncate">{inboxPreviewLine}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">Just now</span>
          </div>

          <div
            className="mx-auto border rounded-lg overflow-hidden bg-white shadow-sm"
            style={{ maxWidth: previewViewport === 'desktop' ? 480 : 320 }}
          >
            <iframe srcDoc={iframeSrc} title="Email preview" className="w-full border-0 bg-white" style={{ minHeight: 420 }} sandbox="" />
          </div>

          <EmailImagesPanel htmlBody={htmlBody} onHtmlBodyChange={onHtmlBodyChange} />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Detected variables</p>
            <p className="text-[11px] text-muted-foreground">
              Lists every <span className="font-mono">{'{{token}}'}</span> found in your subject, form fields, and template HTML. Sample mode resolves them from CRM preview
              data when a value exists; otherwise the token stays visible.
            </p>
            <div className="flex flex-col gap-2">
              {mergeUsageRows.map(row => (
                <div
                  key={row.key}
                  className={cn(
                    'rounded-md border px-2 py-1.5 text-[11px] font-mono flex flex-wrap items-baseline gap-x-2 gap-y-1',
                    row.resolved ? 'border-green-300 bg-green-50 text-green-900' : 'border-amber-300 bg-amber-50 text-amber-950',
                  )}
                >
                  <span className="font-semibold">{`{{${row.key}}}`}</span>
                  <span className="text-muted-foreground">{row.resolved ? 'resolved in preview' : 'no sample value'}</span>
                  {row.usedIn.length > 0 && (
                    <span className="text-[10px] text-foreground/80 w-full sm:w-auto">Used in: {row.usedIn.join(', ')}</span>
                  )}
                </div>
              ))}
              {mergeUsageRows.length === 0 && <span className="text-xs text-muted-foreground">No merge tokens in subject, form fields, or template HTML.</span>}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send test email</DialogTitle>
          </DialogHeader>
          <Input type="email" placeholder="you@example.com" value={testEmail} onChange={e => setTestEmail(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTestOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!testEmail.trim()) return;
                onSendTest(testEmail.trim());
                toast.success(`Test sent to ${testEmail} (stubbed)`);
                setTestOpen(false);
              }}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pasteDialogOpen} onOpenChange={setPasteDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{SCRATCH_HTML_IMPORT_COPY.pasteDialogTitle}</DialogTitle>
            <DialogDescription className="text-xs">{SCRATCH_HTML_IMPORT_COPY.pasteDialogDescription}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={pasteBuffer}
            onChange={e => setPasteBuffer(e.target.value)}
            rows={12}
            className="font-mono text-xs"
            placeholder="<!DOCTYPE html>..."
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPasteDialogOpen(false)}>
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
        onConfirm={html => finalizeRegionalHtml(html, SCRATCH_HTML_IMPORT_COPY.toastRegionMapped)}
      />
    </div>
  );
}

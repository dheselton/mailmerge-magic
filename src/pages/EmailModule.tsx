import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CampaignsTab, type InjectedCampaignDraft } from '@/components/email/CampaignsTab';
import { TemplatesTab } from '@/components/email/TemplatesTab';
import { AutomationsTab } from '@/components/email/AutomationsTab';
import { SettingsTab } from '@/components/email/SettingsTab';
import type { EmailTemplate, ComposeKind, AnnouncementForm, BrandSettings } from '@/types/email-types';
import { DEFAULT_BRAND_SETTINGS } from '@/types/email-types';
import { payloadToAnnouncementForm } from '@/lib/email-utils';
import { Mail } from 'lucide-react';

const STORAGE_KEY_TEMPLATES = 'email-module-templates-v1';

function loadTemplatesFromStorage(): EmailTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as EmailTemplate[];
  } catch {
    return [];
  }
}

const EmailModule = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => loadTemplatesFromStorage());
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(DEFAULT_BRAND_SETTINGS);
  const [injectedDraft, setInjectedDraft] = useState<InjectedCampaignDraft | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
    } catch {
      // ignore storage failures (quota/private mode)
    }
  }, [templates]);

  const handleUseTemplate = (t: EmailTemplate) => {
    setInjectedDraft({
      nonce: Date.now(),
      subject: t.subject,
      html_body: t.html_body,
      compose_kind: t.kind,
      form_payload: t.form_payload ? payloadToAnnouncementForm(t.form_payload) : null,
    });
    setActiveTab('campaigns');
  };

  const handleSaveAsTemplate = (name: string, subject: string, htmlBody: string, kind: ComposeKind, formPayload: AnnouncementForm | null) => {
    const now = new Date().toISOString();
    const newTpl: EmailTemplate = {
      id: `tpl-${Date.now()}`,
      site_id: 'site-1',
      name,
      subject,
      html_body: htmlBody,
      kind,
      form_payload: formPayload,
      source: 'manual',
      webflow_asset_refs: [],
      created_by: 'user-1',
      created_at: now,
      updated_at: now,
    };
    setTemplates(prev => [newTpl, ...prev]);
  };

  return (
    <div className="container max-w-7xl py-6">
      <div className="flex items-center gap-2 mb-6">
        <Mail className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Email</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="automations">Automations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          {activeTab === 'campaigns' && (
            <Button
              className="sm:shrink-0"
              onClick={() => {
                setActiveTab('campaigns');
                navigate('/email/campaign/new', { state: { brandSettings } });
              }}
            >
              + New Campaign
            </Button>
          )}
        </div>

        <TabsContent value="campaigns" className="mt-4">
          <CampaignsTab
            onSaveAsTemplate={handleSaveAsTemplate}
            brandSettings={brandSettings}
            injectedDraft={injectedDraft}
            onInjectedDraftConsumed={() => setInjectedDraft(null)}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <TemplatesTab templates={templates} onTemplatesChange={setTemplates} onUseTemplate={handleUseTemplate} />
        </TabsContent>

        <TabsContent value="automations" className="mt-4">
          <AutomationsTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <SettingsTab brand={brandSettings} onBrandChange={setBrandSettings} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailModule;

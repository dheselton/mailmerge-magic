import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CampaignsTab } from '@/components/email/CampaignsTab';
import { TemplatesTab } from '@/components/email/TemplatesTab';
import { AutomationsTab } from '@/components/email/AutomationsTab';
import { SettingsTab } from '@/components/email/SettingsTab';
import type { EmailTemplate, ComposeKind, AnnouncementForm, BrandSettings } from '@/types/email-types';
import { DEFAULT_BRAND_SETTINGS } from '@/types/email-types';
import { MOCK_TEMPLATES } from '@/data/email-mock-data';
import { emptyAnnouncementForm, payloadToAnnouncementForm } from '@/lib/email-utils';
import { Mail } from 'lucide-react';

const EmailModule = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [templates, setTemplates] = useState<EmailTemplate[]>(MOCK_TEMPLATES);
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(DEFAULT_BRAND_SETTINGS);

  // When "Use Template" is clicked in Templates tab, switch to Campaigns and load it
  const [loadedSubject, setLoadedSubject] = useState('');
  const [loadedHtml, setLoadedHtml] = useState('');
  const [loadedKind, setLoadedKind] = useState<ComposeKind>('raw_html');
  const [loadedForm, setLoadedForm] = useState<AnnouncementForm>(emptyAnnouncementForm());

  const handleUseTemplate = (t: EmailTemplate) => {
    setLoadedSubject(t.subject);
    setLoadedHtml(t.html_body);
    setLoadedKind(t.kind);
    setLoadedForm(t.form_payload ? payloadToAnnouncementForm(t.form_payload) : emptyAnnouncementForm());
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
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-4">
          <CampaignsTab onSaveAsTemplate={handleSaveAsTemplate} brandSettings={brandSettings} />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <TemplatesTab
            templates={templates}
            onTemplatesChange={setTemplates}
            onUseTemplate={handleUseTemplate}
          />
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

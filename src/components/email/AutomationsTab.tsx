import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { SiteEmailOverride, EmailKey, BodyMode } from '@/types/email-types';
import { EMAIL_KEY_LABELS, EMAIL_KEY_MERGE_HINTS } from '@/types/email-types';

const EMAIL_KEYS: EmailKey[] = [
  'access_request_received',
  'access_request_owner_notify',
  'access_approved',
  'access_denied',
  'access_needs_info',
  'member_password_reset',
];

const DEFAULT_SUBJECTS: Record<EmailKey, string> = {
  access_request_received: 'We received your access request',
  access_request_owner_notify: 'New access request from {{member_name}}',
  access_approved: 'Your access has been approved',
  access_denied: 'Access request update',
  access_needs_info: 'We need more information',
  member_password_reset: 'Reset your password',
};

export function AutomationsTab() {
  const [overrides, setOverrides] = useState<Record<string, Partial<SiteEmailOverride>>>({});

  const getOverride = (key: EmailKey): Partial<SiteEmailOverride> => overrides[key] || {};

  const updateOverride = (key: EmailKey, patch: Partial<SiteEmailOverride>) => {
    setOverrides(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const handleSave = (key: EmailKey) => {
    toast.success(`${EMAIL_KEY_LABELS[key]} override saved (stubbed)`);
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold mb-4">Email Automations</h3>
      <p className="text-sm text-muted-foreground mb-4">Override default notification emails per type. Leave blank to use built-in templates.</p>

      {EMAIL_KEYS.map(key => {
        const override = getOverride(key);
        const bodyMode = (override.body_mode || 'default_react') as BodyMode;

        return (
          <Collapsible key={key}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-left">
                <span>{EMAIL_KEY_LABELS[key]}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 space-y-3">
              <div className="space-y-2">
                <Label>Subject Override</Label>
                <Input
                  value={override.subject_template || ''}
                  onChange={e => updateOverride(key, { subject_template: e.target.value })}
                  placeholder={DEFAULT_SUBJECTS[key]}
                />
              </div>

              <div className="space-y-2">
                <Label>Body Mode</Label>
                <Select value={bodyMode} onValueChange={v => updateOverride(key, { body_mode: v as BodyMode })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default_react">Built-in Layout</SelectItem>
                    <SelectItem value="html_fragment">Custom HTML Fragment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {bodyMode === 'html_fragment' && (
                <div className="space-y-2">
                  <Label>HTML Fragment</Label>
                  <Textarea
                    value={override.html_fragment || ''}
                    onChange={e => updateOverride(key, { html_fragment: e.target.value })}
                    placeholder="<p>Your custom content...</p>"
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">Available tags:</span>
                    {EMAIL_KEY_MERGE_HINTS[key].map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button size="sm" onClick={() => handleSave(key)}>
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

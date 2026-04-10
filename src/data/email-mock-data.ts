import type { EmailCampaign, EmailTemplate, EmailEvent, SiteEmailOverride } from '@/types/email-types';

export const MOCK_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'camp-1',
    site_id: 'site-1',
    subject: 'We\'re Hiring: Senior Engineers',
    html_body: '<h1>Join our team!</h1><p>We have exciting roles open.</p>',
    compose_kind: 'announcement_form',
    form_payload: { headline: 'We\'re Hiring!', subhead: 'Senior Engineer Roles', message: 'Join our growing engineering team.', buttonLabel: 'View Roles', buttonUrl: 'https://careers.acme.com', signOff: 'Best, The Acme Team' },
    status: 'sent',
    recipient_source: { type: 'talent_pool', pool_id: 'pool-eng' },
    sent_at: '2025-03-15T10:30:00Z',
    created_by: 'user-1',
    created_at: '2025-03-14T09:00:00Z',
  },
  {
    id: 'camp-2',
    site_id: 'site-1',
    subject: 'Q2 Recruitment Drive',
    html_body: '<h1>Q2 Recruitment</h1>',
    compose_kind: 'raw_html',
    form_payload: null,
    status: 'draft',
    recipient_source: { type: 'ats', system: 'greenhouse', filter: { stage: 'Screen' } },
    sent_at: null,
    created_by: 'user-1',
    created_at: '2025-04-01T14:00:00Z',
  },
];

export const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-1',
    site_id: 'site-1',
    name: 'Job Announcement',
    subject: 'New Role: {{job_title}}',
    html_body: '<h1>{{job_title}}</h1><p>Apply now at {{company_name}}</p>',
    kind: 'announcement_form',
    form_payload: { headline: '{{job_title}}', subhead: 'at {{company_name}}', message: 'We have an exciting new role for you.', buttonLabel: 'Apply Now', buttonUrl: '{{apply_url}}', signOff: '' },
    source: 'manual',
    webflow_asset_refs: [],
    created_by: 'user-1',
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z',
  },
  {
    id: 'tpl-2',
    site_id: 'site-1',
    name: 'Event Invite',
    subject: 'You\'re Invited: Recruiting Event',
    html_body: '<h1>You\'re Invited</h1><p>Join us for our recruiting event.</p>',
    kind: 'raw_html',
    form_payload: null,
    source: 'ai_generated',
    webflow_asset_refs: [],
    created_by: 'user-1',
    created_at: '2025-02-20T12:00:00Z',
    updated_at: '2025-02-20T12:00:00Z',
  },
];

export const MOCK_EVENTS: EmailEvent[] = [
  { id: 'ev-1', site_id: 'site-1', email_type: 'campaign', recipient: 'alice@example.com', subject: 'We\'re Hiring: Senior Engineers', success: true, provider: 'mailgun', provider_message_id: 'mg-001', created_at: '2025-03-15T10:31:00Z' },
  { id: 'ev-2', site_id: 'site-1', email_type: 'campaign', recipient: 'bob@example.com', subject: 'We\'re Hiring: Senior Engineers', success: true, provider: 'mailgun', provider_message_id: 'mg-002', created_at: '2025-03-15T10:31:05Z' },
  { id: 'ev-3', site_id: 'site-1', email_type: 'campaign', recipient: 'carol@example.com', subject: 'We\'re Hiring: Senior Engineers', success: false, provider: 'mailgun', provider_message_id: 'mg-003', created_at: '2025-03-15T10:31:10Z' },
  { id: 'ev-4', site_id: 'site-1', email_type: 'notification', recipient: 'dave@example.com', subject: 'Access Approved', success: true, provider: 'ses', provider_message_id: 'ses-001', created_at: '2025-03-16T08:00:00Z' },
];

export const MOCK_OVERRIDES: SiteEmailOverride[] = [];

export const MOCK_TALENT_POOLS = [
  { id: 'pool-eng', name: 'Engineering Candidates', count: 142 },
  { id: 'pool-design', name: 'Design Candidates', count: 67 },
  { id: 'pool-pm', name: 'Product Managers', count: 38 },
  { id: 'pool-all', name: 'All Candidates', count: 523 },
];

export const STARTER_TEMPLATES = [
  { id: 'starter-1', name: 'Job Announcement', description: 'Clean job posting announcement', html: '<h1>{{job_title}}</h1><p>{{company_name}} is hiring! Apply now.</p>' },
  { id: 'starter-2', name: 'Event Invitation', description: 'Recruiting event invite', html: '<h1>You\'re Invited</h1><p>Join us for a special recruiting event.</p>' },
  { id: 'starter-3', name: 'Newsletter', description: 'Monthly recruiting newsletter', html: '<h1>Monthly Update</h1><p>Here\'s what\'s new at {{company_name}}.</p>' },
];

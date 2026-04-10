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

/* ---------------------------------------------------------------------------
 * Helper: wraps inner body content in a full email-client-safe HTML document.
 * - Table-based 600px centered layout
 * - MSO conditionals for Outlook
 * - Inline styles for Gmail / Yahoo
 * - @media query for mobile (progressive enhancement)
 * - Preheader, unsubscribe footer, merge tags
 * -------------------------------------------------------------------------*/
function emailShell(preheader: string, bodyRows: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>{{company_name}}</title>
<!--[if !mso]><!-->
<style type="text/css">
@media only screen and (max-width:620px){
  .email-container{width:100%!important;max-width:100%!important;}
  .fluid{width:100%!important;max-width:100%!important;height:auto!important;}
  .stack-column{display:block!important;width:100%!important;max-width:100%!important;}
  .center-on-narrow{text-align:center!important;display:block!important;margin-left:auto!important;margin-right:auto!important;float:none!important;}
  table.center-on-narrow{display:inline-block!important;}
  .padding-mobile{padding-left:20px!important;padding-right:20px!important;}
}
</style>
<!--<![endif]-->
<!--[if mso]>
<style type="text/css">
table{border-collapse:collapse;}
</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<!-- Preheader (hidden) -->
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
${preheader}
</div>
<center style="width:100%;background-color:#f4f4f7;">
<!--[if mso]><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center"><tr><td><![endif]-->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="margin:0 auto;max-width:600px;">
${bodyRows}
</table>
<!--[if mso]></td></tr></table><![endif]-->
<!-- Footer -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="margin:0 auto;max-width:600px;">
<tr>
<td style="padding:30px 40px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#9a9a9a;text-align:center;" class="padding-mobile">
<p style="margin:0 0 8px;">{{company_name}} &bull; {{company_address}}</p>
<p style="margin:0;">You're receiving this because you're part of our talent community.<br/>
<a href="{{unsubscribe_url}}" style="color:#9a9a9a;text-decoration:underline;">Unsubscribe</a> &bull; <a href="{{preferences_url}}" style="color:#9a9a9a;text-decoration:underline;">Email preferences</a></p>
</td>
</tr>
</table>
</center>
</body>
</html>`;
}

/* MSO-safe CTA button using VML for Outlook + CSS for modern clients */
function ctaButton(label: string, url: string, bgColor = '#2563eb', textColor = '#ffffff'): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:auto;">
<tr>
<td style="border-radius:6px;background:${bgColor};text-align:center;">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="14%" strokecolor="${bgColor}" fillcolor="${bgColor}">
<w:anchorlock/>
<center style="color:${textColor};font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;">
${label}
</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<a href="${url}" target="_blank" style="background:${bgColor};border:1px solid ${bgColor};border-radius:6px;color:${textColor};display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;line-height:44px;text-align:center;text-decoration:none;width:220px;-webkit-text-size-adjust:none;">
${label}
</a>
<!--<![endif]-->
</td>
</tr>
</table>`;
}

/* ---- 1. Job Announcement ---- */
const jobAnnouncementHtml = emailShell(
  'New role open at {{company_name}} — {{job_title}}. Apply today!',
  `<!-- Header -->
<tr>
<td style="padding:30px 40px 20px;background-color:#ffffff;border-radius:8px 8px 0 0;" class="padding-mobile">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#2563eb;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Now Hiring</td></tr>
</table>
</td>
</tr>
<!-- Body -->
<tr>
<td style="padding:0 40px 10px;background-color:#ffffff;" class="padding-mobile">
<h1 style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:34px;color:#1a1a2e;font-weight:bold;">{{job_title}}</h1>
<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#6b7280;">{{department}} &bull; {{location}} &bull; {{employment_type}}</p>
</td>
</tr>
<tr>
<td style="padding:0 40px 10px;background-color:#ffffff;" class="padding-mobile">
<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">Hi {{member_name}},</p>
<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">We have an exciting new opportunity at <strong>{{company_name}}</strong> that matches your background. We're looking for a <strong>{{job_title}}</strong> to join our {{department}} team.</p>
<p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">If you're interested — or know someone who'd be a great fit — we'd love to hear from you.</p>
</td>
</tr>
<tr>
<td style="padding:0 40px 30px;background-color:#ffffff;" class="padding-mobile">
${ctaButton('View Role & Apply', '{{apply_url}}')}
</td>
</tr>
<!-- Sign-off -->
<tr>
<td style="padding:0 40px 30px;background-color:#ffffff;border-radius:0 0 8px 8px;" class="padding-mobile">
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#6b7280;">Best,<br/>The {{company_name}} Recruiting Team</p>
</td>
</tr>`
);

/* ---- 2. Event Invitation ---- */
const eventInvitationHtml = emailShell(
  'You\'re invited to {{event_name}} hosted by {{company_name}}.',
  `<!-- Hero Banner -->
<tr>
<td style="padding:40px;background-color:#2563eb;border-radius:8px 8px 0 0;text-align:center;" class="padding-mobile">
<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:1px;">You're Invited</p>
<h1 style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;color:#ffffff;font-weight:bold;">{{event_name}}</h1>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:rgba(255,255,255,0.85);">Hosted by {{company_name}}</p>
</td>
</tr>
<!-- Event Details -->
<tr>
<td style="padding:30px 40px 10px;background-color:#ffffff;" class="padding-mobile">
<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">Hi {{member_name}},</p>
<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">We'd love for you to join us at our upcoming event. Here are the details:</p>
</td>
</tr>
<!-- Details Box -->
<tr>
<td style="padding:0 40px 20px;background-color:#ffffff;" class="padding-mobile">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border-radius:6px;">
<tr><td style="padding:20px 24px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7280;padding-bottom:6px;">DATE &amp; TIME</td></tr>
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding-bottom:14px;font-weight:bold;">{{event_date}} at {{event_time}}</td></tr>
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7280;padding-bottom:6px;">LOCATION</td></tr>
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding-bottom:14px;font-weight:bold;">{{event_location}}</td></tr>
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7280;padding-bottom:6px;">FORMAT</td></tr>
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;font-weight:bold;">{{event_format}}</td></tr>
</table>
</td></tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 40px 30px;background-color:#ffffff;" class="padding-mobile">
${ctaButton('RSVP Now', '{{rsvp_url}}')}
</td>
</tr>
<tr>
<td style="padding:0 40px 30px;background-color:#ffffff;border-radius:0 0 8px 8px;" class="padding-mobile">
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#6b7280;">We hope to see you there!<br/>{{company_name}} Talent Team</p>
</td>
</tr>`
);

/* ---- 3. Candidate Newsletter ---- */
const candidateNewsletterHtml = emailShell(
  'Your monthly talent community update from {{company_name}}.',
  `<!-- Header -->
<tr>
<td style="padding:30px 40px 20px;background-color:#ffffff;border-radius:8px 8px 0 0;" class="padding-mobile">
<h1 style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:24px;color:#1a1a2e;">Talent Community Update</h1>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;">{{newsletter_month}} {{newsletter_year}} &bull; {{company_name}}</p>
</td>
</tr>
<!-- Intro -->
<tr>
<td style="padding:0 40px 20px;background-color:#ffffff;" class="padding-mobile">
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">Hi {{member_name}},</p>
<p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">Here's what's new at {{company_name}} this month — from open roles to company highlights.</p>
</td>
</tr>
<!-- Divider -->
<tr><td style="padding:0 40px;background-color:#ffffff;" class="padding-mobile"><table role="presentation" width="100%"><tr><td style="border-top:1px solid #e5e7eb;font-size:1px;line-height:1px;">&nbsp;</td></tr></table></td></tr>
<!-- Section: Open Roles -->
<tr>
<td style="padding:20px 40px 10px;background-color:#ffffff;" class="padding-mobile">
<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#2563eb;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Open Roles</p>
<h2 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:18px;color:#1a1a2e;">We're growing — join us!</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;"><a href="{{role_1_url}}" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2563eb;text-decoration:none;font-weight:bold;">{{role_1_title}}</a><br/><span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7280;">{{role_1_location}}</span></td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;"><a href="{{role_2_url}}" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2563eb;text-decoration:none;font-weight:bold;">{{role_2_title}}</a><br/><span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7280;">{{role_2_location}}</span></td></tr>
<tr><td style="padding:8px 0;"><a href="{{role_3_url}}" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2563eb;text-decoration:none;font-weight:bold;">{{role_3_title}}</a><br/><span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7280;">{{role_3_location}}</span></td></tr>
</table>
</td>
</tr>
<tr>
<td style="padding:16px 40px 20px;background-color:#ffffff;" class="padding-mobile">
${ctaButton('View All Openings', '{{careers_url}}')}
</td>
</tr>
<!-- Divider -->
<tr><td style="padding:0 40px;background-color:#ffffff;" class="padding-mobile"><table role="presentation" width="100%"><tr><td style="border-top:1px solid #e5e7eb;font-size:1px;line-height:1px;">&nbsp;</td></tr></table></td></tr>
<!-- Section: Company News -->
<tr>
<td style="padding:20px 40px 10px;background-color:#ffffff;" class="padding-mobile">
<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#2563eb;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Company News</p>
<h2 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:18px;color:#1a1a2e;">{{news_headline}}</h2>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">{{news_summary}}</p>
</td>
</tr>
<!-- Sign-off -->
<tr>
<td style="padding:20px 40px 30px;background-color:#ffffff;border-radius:0 0 8px 8px;" class="padding-mobile">
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#6b7280;">Until next month,<br/>The {{company_name}} Talent Team</p>
</td>
</tr>`
);

/* ---- 4. Interview Confirmation ---- */
const interviewConfirmationHtml = emailShell(
  'Your interview with {{company_name}} is confirmed for {{interview_date}}.',
  `<!-- Header -->
<tr>
<td style="padding:30px 40px 20px;background-color:#ffffff;border-radius:8px 8px 0 0;" class="padding-mobile">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#059669;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">✓ Interview Confirmed</td></tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 40px 10px;background-color:#ffffff;" class="padding-mobile">
<h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:30px;color:#1a1a2e;">Your Interview Details</h1>
<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">Hi {{member_name}},</p>
<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">Great news — your interview for <strong>{{job_title}}</strong> at {{company_name}} has been confirmed. Here's everything you need to know:</p>
</td>
</tr>
<!-- Details Card -->
<tr>
<td style="padding:0 40px 20px;background-color:#ffffff;" class="padding-mobile">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;">
<tr><td style="padding:20px 24px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7280;padding-bottom:4px;">DATE</td></tr>
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding-bottom:14px;font-weight:bold;">{{interview_date}}</td></tr>
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7280;padding-bottom:4px;">TIME</td></tr>
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding-bottom:14px;font-weight:bold;">{{interview_time}} ({{timezone}})</td></tr>
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7280;padding-bottom:4px;">INTERVIEWER</td></tr>
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;padding-bottom:14px;font-weight:bold;">{{interviewer_name}}, {{interviewer_title}}</td></tr>
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7280;padding-bottom:4px;">FORMAT</td></tr>
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a2e;font-weight:bold;">{{interview_format}}</td></tr>
</table>
</td></tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 40px 20px;background-color:#ffffff;" class="padding-mobile">
${ctaButton('Join / View Details', '{{interview_link}}', '#059669')}
</td>
</tr>
<!-- Prep Tips -->
<tr>
<td style="padding:0 40px 10px;background-color:#ffffff;" class="padding-mobile">
<h2 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#1a1a2e;">How to Prepare</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#374151;">• Review the <a href="{{job_url}}" style="color:#2563eb;text-decoration:underline;">role description</a></td></tr>
<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#374151;">• Test your video / audio setup beforehand</td></tr>
<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#374151;">• Prepare 2–3 questions for your interviewer</td></tr>
<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#374151;">• Have a copy of your résumé handy</td></tr>
</table>
</td>
</tr>
<tr>
<td style="padding:20px 40px 30px;background-color:#ffffff;border-radius:0 0 8px 8px;" class="padding-mobile">
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#6b7280;">Need to reschedule? <a href="{{reschedule_url}}" style="color:#2563eb;text-decoration:underline;">Let us know</a>.<br/>Good luck!<br/>{{company_name}} Recruiting</p>
</td>
</tr>`
);

/* ---- 5. Referral Request ---- */
const referralRequestHtml = emailShell(
  '{{company_name}} is hiring — know someone great? Refer them today!',
  `<!-- Header -->
<tr>
<td style="padding:30px 40px 20px;background-color:#ffffff;border-radius:8px 8px 0 0;" class="padding-mobile">
<h1 style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:30px;color:#1a1a2e;">Know Someone Amazing?</h1>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;">Help us grow our team — and earn a referral bonus.</p>
</td>
</tr>
<tr>
<td style="padding:0 40px 10px;background-color:#ffffff;" class="padding-mobile">
<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">Hi {{member_name}},</p>
<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">Great people know great people. We're expanding our <strong>{{department}}</strong> team and would love your help finding the right talent.</p>
<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">If you know someone who'd thrive in the <strong>{{job_title}}</strong> role, send them our way. Successful referrals are rewarded with a <strong>{{referral_bonus}}</strong> bonus.</p>
</td>
</tr>
<!-- How it works -->
<tr>
<td style="padding:0 40px 20px;background-color:#ffffff;" class="padding-mobile">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border-radius:6px;">
<tr><td style="padding:20px 24px;">
<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1a2e;font-weight:bold;">How it works</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#374151;">1. Click the button below to submit a referral</td></tr>
<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#374151;">2. We'll reach out to your referral directly</td></tr>
<tr><td style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#374151;">3. If hired, you receive your bonus after 90 days</td></tr>
</table>
</td></tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 40px 30px;background-color:#ffffff;" class="padding-mobile">
${ctaButton('Submit a Referral', '{{referral_url}}', '#7c3aed')}
</td>
</tr>
<tr>
<td style="padding:0 40px 30px;background-color:#ffffff;border-radius:0 0 8px 8px;" class="padding-mobile">
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#6b7280;">Thanks for helping us grow!<br/>{{company_name}} People Team</p>
</td>
</tr>`
);

/* ---- 6. Talent Pool Re-engagement ---- */
const reEngagementHtml = emailShell(
  'New opportunities at {{company_name}} — we\'d love to reconnect!',
  `<!-- Header -->
<tr>
<td style="padding:30px 40px 20px;background-color:#ffffff;border-radius:8px 8px 0 0;" class="padding-mobile">
<h1 style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:30px;color:#1a1a2e;">We'd Love to Reconnect</h1>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;">New opportunities are waiting at {{company_name}}</p>
</td>
</tr>
<tr>
<td style="padding:0 40px 10px;background-color:#ffffff;" class="padding-mobile">
<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">Hi {{member_name}},</p>
<p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">It's been a while since we last connected, and a lot has changed at <strong>{{company_name}}</strong>. We've been growing, launching new initiatives, and opening exciting roles — and we think you might be a great fit.</p>
<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">Here are a few highlights:</p>
</td>
</tr>
<!-- Highlights -->
<tr>
<td style="padding:0 40px 20px;background-color:#ffffff;" class="padding-mobile">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr>
<td style="padding:12px 16px;background-color:#eff6ff;border-radius:6px;margin-bottom:8px;">
<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2563eb;font-weight:bold;">🚀 {{highlight_1_title}}</p>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#374151;">{{highlight_1_description}}</p>
</td>
</tr>
</table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px;">
<tr>
<td style="padding:12px 16px;background-color:#eff6ff;border-radius:6px;">
<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2563eb;font-weight:bold;">📈 {{highlight_2_title}}</p>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#374151;">{{highlight_2_description}}</p>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 40px 20px;background-color:#ffffff;" class="padding-mobile">
<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#374151;">We'd love to catch up and explore whether there's a mutual fit. No pressure — just a conversation.</p>
${ctaButton('Explore Opportunities', '{{careers_url}}')}
</td>
</tr>
<tr>
<td style="padding:0 40px 30px;background-color:#ffffff;border-radius:0 0 8px 8px;" class="padding-mobile">
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#6b7280;">Looking forward to hearing from you,<br/>{{company_name}} Talent Team</p>
</td>
</tr>`
);

export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  category: 'Sourcing' | 'Scheduling' | 'Engagement' | 'Referrals';
  html: string;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  { id: 'starter-1', name: 'Job Announcement', description: 'Announce a new open role with title, team, location, and Apply CTA.', subject: 'Now Hiring: {{job_title}} at {{company_name}}', category: 'Sourcing', html: jobAnnouncementHtml },
  { id: 'starter-2', name: 'Event Invitation', description: 'Invite candidates to a career fair, webinar, or recruiting event.', subject: 'You\'re Invited: {{event_name}} — {{company_name}}', category: 'Engagement', html: eventInvitationHtml },
  { id: 'starter-3', name: 'Candidate Newsletter', description: 'Monthly talent community update with open roles and company news.', subject: '{{company_name}} Talent Update — {{newsletter_month}} {{newsletter_year}}', category: 'Engagement', html: candidateNewsletterHtml },
  { id: 'starter-4', name: 'Interview Confirmation', description: 'Confirm interview details with date, time, interviewer, and prep tips.', subject: 'Interview Confirmed: {{job_title}} — {{interview_date}}', category: 'Scheduling', html: interviewConfirmationHtml },
  { id: 'starter-5', name: 'Referral Request', description: 'Ask your network to refer great candidates with referral bonus info.', subject: 'Know Someone Great? Refer Them to {{company_name}}', category: 'Referrals', html: referralRequestHtml },
  { id: 'starter-6', name: 'Talent Pool Re-engagement', description: 'Re-engage cold candidates with new opportunities and company highlights.', subject: 'New Opportunities at {{company_name}} — Let\'s Reconnect', category: 'Engagement', html: reEngagementHtml },
];

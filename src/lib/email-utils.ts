import type { AnnouncementForm } from '@/types/email-types';

/** Remove all <script> tags from HTML string */
export function stripEmailScripts(html: string): string {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/** Replace merge tags with sample values for preview */
export function applySampleMerge(
  html: string,
  data: {
    siteName?: string;
    memberName?: string;
    jobTitle?: string;
    applyUrl?: string;
    companyName?: string;
    unsubscribeUrl?: string;
  }
): string {
  return html
    .replace(/\{\{member_name\}\}/g, data.memberName ?? 'Jane Doe')
    .replace(/\{\{site_name\}\}/g, data.siteName ?? 'Acme Corp')
    .replace(/\{\{job_title\}\}/g, data.jobTitle ?? 'Software Engineer')
    .replace(/\{\{apply_url\}\}/g, data.applyUrl ?? '#apply')
    .replace(/\{\{company_name\}\}/g, data.companyName ?? 'Acme Corp')
    .replace(/\{\{unsubscribe_url\}\}/g, data.unsubscribeUrl ?? '#unsubscribe');
}

/** Insert text at cursor position in a textarea */
export function insertIntoTextarea(
  el: HTMLTextAreaElement,
  value: string,
  currentValue: string,
  onChange: (newValue: string) => void
): void {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const newValue = currentValue.substring(0, start) + value + currentValue.substring(end);
  onChange(newValue);
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = start + value.length;
    el.focus();
  });
}

/** Create an empty announcement form */
export function emptyAnnouncementForm(): AnnouncementForm {
  return {
    headline: '',
    subhead: '',
    message: '',
    buttonLabel: '',
    buttonUrl: '',
    signOff: '',
  };
}

/** Convert announcement form to JSON payload */
export function announcementFormToPayload(form: AnnouncementForm): AnnouncementForm {
  return { ...form };
}

/** Convert payload back to announcement form */
export function payloadToAnnouncementForm(payload: unknown): AnnouncementForm {
  const p = payload as Partial<AnnouncementForm> | null;
  return {
    headline: p?.headline ?? '',
    subhead: p?.subhead ?? '',
    message: p?.message ?? '',
    buttonLabel: p?.buttonLabel ?? '',
    buttonUrl: p?.buttonUrl ?? '',
    signOff: p?.signOff ?? '',
  };
}

/** Check if announcement form is valid for saving (requires headline) */
export function isValidAnnouncementForSave(form: AnnouncementForm): boolean {
  return form.headline.trim().length > 0;
}

/** Render announcement form to responsive HTML string */
export function renderAnnouncementToHTML(
  form: AnnouncementForm,
  siteConfig: { siteName: string; memberName?: string }
): string {
  const { headline, subhead, message, buttonLabel, buttonUrl, signOff } = form;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; padding: 16px !important; }
    .headline { font-size: 22px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:32px;">
<tr><td style="font-size:12px;color:#71717a;padding-bottom:16px;">${siteConfig.siteName}</td></tr>
${siteConfig.memberName ? `<tr><td style="font-size:14px;color:#3f3f46;padding-bottom:8px;">Hi ${siteConfig.memberName},</td></tr>` : ''}
<tr><td class="headline" style="font-size:26px;font-weight:700;color:#18181b;padding-bottom:8px;">${headline}</td></tr>
${subhead ? `<tr><td style="font-size:16px;color:#52525b;padding-bottom:16px;">${subhead}</td></tr>` : ''}
${message ? `<tr><td style="font-size:14px;color:#3f3f46;line-height:1.6;padding-bottom:24px;white-space:pre-wrap;">${message}</td></tr>` : ''}
${buttonLabel && buttonUrl ? `<tr><td style="padding-bottom:24px;">
<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${buttonUrl}" style="height:40px;v-text-anchor:middle;width:200px;" arcsize="10%" strokecolor="#18181b" fillcolor="#18181b"><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">${buttonLabel}</center></v:roundrect><![endif]-->
<!--[if !mso]><!--><a href="${buttonUrl}" style="display:inline-block;background:#18181b;color:#ffffff;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">${buttonLabel}</a><!--<![endif]-->
</td></tr>` : ''}
${signOff ? `<tr><td style="font-size:14px;color:#71717a;padding-top:8px;">${signOff}</td></tr>` : ''}
<tr><td style="font-size:11px;color:#a1a1aa;padding-top:24px;border-top:1px solid #e4e4e7;">
<a href="{{unsubscribe_url}}" style="color:#a1a1aa;">Unsubscribe</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

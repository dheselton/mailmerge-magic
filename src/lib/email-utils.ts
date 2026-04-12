import type { AnnouncementForm, ContentBlock, BrandSettings } from '@/types/email-types';

let _blockIdCounter = 0;
export function genBlockId(): string {
  return `blk-${Date.now()}-${++_blockIdCounter}`;
}

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
    blocks: [],
    useBlocks: false,
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
    blocks: p?.blocks ?? [],
    useBlocks: p?.useBlocks ?? false,
  };
}

/** Check if announcement form is valid for saving (requires headline or blocks) */
export function isValidAnnouncementForSave(form: AnnouncementForm): boolean {
  if (form.useBlocks) return form.blocks.length > 0;
  return form.headline.trim().length > 0;
}

// ========== Email Shell & CTA Button (moved from email-mock-data) ==========

export function emailShell(preheader: string, bodyRows: string): string {
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
<p style="margin:0 0 8px;">{{company_name}}</p>
<p style="margin:0;">You're receiving this because you're part of our talent community.<br/>
<a href="{{unsubscribe_url}}" style="color:#9a9a9a;text-decoration:underline;">Unsubscribe</a></p>
</td>
</tr>
</table>
</center>
</body>
</html>`;
}

export function ctaButton(label: string, url: string, bgColor = '#2563eb', textColor = '#ffffff'): string {
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

// ========== HTML to Blocks Parser ==========

export function parseHtmlToBlocks(html: string): ContentBlock[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: ContentBlock[] = [];

  // Find the main content area — look for the email-container table or fall back to body
  const body = doc.body;
  if (!body) return blocks;

  // Walk all relevant elements in document order
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node: Element) => {
      const tag = node.tagName?.toLowerCase();
      // Skip hidden preheader divs
      if (tag === 'div' && (node as HTMLElement).style?.display === 'none') return NodeFilter.FILTER_REJECT;
      // Skip MSO conditional comments content (handled as text)
      if (['h1', 'h2', 'h3', 'p', 'img', 'a', 'hr', 'td'].includes(tag)) return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_SKIP;
    }
  });

  const seenTexts = new Set<string>();
  const footerKeywords = ['unsubscribe', 'email preferences', 'receiving this'];

  let node: Element | null = walker.currentNode as Element;
  while (node) {
    const tag = node.tagName?.toLowerCase();
    const text = (node.textContent || '').trim();

    // Skip empty or footer content
    if (text && footerKeywords.some(kw => text.toLowerCase().includes(kw))) {
      node = walker.nextNode() as Element | null;
      continue;
    }

    if (['h1', 'h2', 'h3'].includes(tag) && text && !seenTexts.has(text)) {
      seenTexts.add(text);
      blocks.push({
        type: 'heading',
        id: genBlockId(),
        text,
        level: parseInt(tag[1]) as 1 | 2 | 3,
      });
    } else if (tag === 'img') {
      const img = node as HTMLImageElement;
      const src = img.getAttribute('src') || '';
      if (src && !src.startsWith('data:') && src !== '') {
        blocks.push({
          type: 'image',
          id: genBlockId(),
          url: src,
          alt: img.getAttribute('alt') || '',
          width: img.width || undefined,
        });
      }
    } else if (tag === 'a') {
      const anchor = node as HTMLAnchorElement;
      const style = anchor.getAttribute('style') || '';
      const isButton = (style.includes('background') && style.includes('display:inline-block')) ||
                       (style.includes('background') && style.includes('border-radius')) ||
                       (style.includes('line-height:44px'));
      if (isButton && text && !seenTexts.has('btn:' + text)) {
        seenTexts.add('btn:' + text);
        blocks.push({
          type: 'button',
          id: genBlockId(),
          label: text,
          url: anchor.getAttribute('href') || '#',
        });
      }
    } else if (tag === 'hr') {
      blocks.push({ type: 'divider', id: genBlockId() });
    } else if (tag === 'p' && text && !seenTexts.has(text)) {
      // Skip very short labels that are likely metadata (like "Now Hiring", dates, etc.)
      const style = (node as HTMLElement).getAttribute('style') || '';
      const isLabel = style.includes('text-transform:uppercase') || style.includes('letter-spacing');
      if (!isLabel && text.length > 2) {
        seenTexts.add(text);
        blocks.push({
          type: 'text',
          id: genBlockId(),
          content: text,
        });
      }
    } else if (tag === 'td') {
      // Only extract text from TDs that have direct text content (not just nested elements)
      const directText = Array.from(node.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => (n.textContent || '').trim())
        .join(' ')
        .trim();
      
      // TDs with border-top are dividers
      const style = (node as HTMLElement).getAttribute('style') || '';
      if (style.includes('border-top') && (!directText || directText === '&nbsp;' || directText === '\u00a0')) {
        blocks.push({ type: 'divider', id: genBlockId() });
      }
    }

    node = walker.nextNode() as Element | null;
  }

  return blocks;
}

// ========== Blocks to HTML Renderer ==========

function renderBlockRow(block: ContentBlock, brand?: BrandSettings): string {
  const font = brand?.fontFamily || 'Arial,Helvetica,sans-serif';
  const primary = brand?.primaryColor || '#2563eb';

  switch (block.type) {
    case 'heading': {
      const tag = `h${block.level}`;
      const sizes: Record<number, string> = { 1: '28px', 2: '22px', 3: '18px' };
      return `<tr>
<td style="padding:0 40px 10px;background-color:#ffffff;" class="padding-mobile">
<${tag} style="margin:0;font-family:${font};font-size:${sizes[block.level] || '22px'};line-height:1.3;color:#1a1a2e;font-weight:bold;">${block.text}</${tag}>
</td>
</tr>`;
    }
    case 'text':
      return `<tr>
<td style="padding:0 40px 12px;background-color:#ffffff;" class="padding-mobile">
<p style="margin:0;font-family:${font};font-size:15px;line-height:24px;color:#374151;white-space:pre-wrap;">${block.content}</p>
</td>
</tr>`;
    case 'image':
      return `<tr>
<td style="padding:0 40px 16px;background-color:#ffffff;" class="padding-mobile">
<img src="${block.url}" alt="${block.alt}" width="${block.width || 520}" style="display:block;max-width:100%;height:auto;border:0;border-radius:6px;" class="fluid" />
</td>
</tr>`;
    case 'button':
      return `<tr>
<td style="padding:10px 40px 20px;background-color:#ffffff;" class="padding-mobile">
${ctaButton(block.label, block.url, primary)}
</td>
</tr>`;
    case 'divider':
      return `<tr>
<td style="padding:0 40px;background-color:#ffffff;" class="padding-mobile">
<table role="presentation" width="100%"><tr><td style="border-top:1px solid #e5e7eb;font-size:1px;line-height:1px;">&nbsp;</td></tr></table>
</td>
</tr>`;
    case 'spacer':
      return `<tr>
<td style="padding:0;background-color:#ffffff;font-size:1px;line-height:${block.height}px;height:${block.height}px;">&nbsp;</td>
</tr>`;
    default:
      return '';
  }
}

export function renderBlocksToHTML(blocks: ContentBlock[], siteConfig: { siteName: string }, brand?: BrandSettings): string {
  const firstHeading = blocks.find(b => b.type === 'heading');
  const preheader = firstHeading?.type === 'heading' ? firstHeading.text : siteConfig.siteName;

  const logoRow = brand?.logoUrl
    ? `<tr><td style="padding:20px 40px 10px;background-color:#ffffff;border-radius:8px 8px 0 0;text-align:center;" class="padding-mobile">
        <img src="${brand.logoUrl}" alt="${brand.companyName || siteConfig.siteName}" style="max-height:50px;max-width:200px;display:inline-block;" />
       </td></tr>`
    : '';

  // Wrap first and last rows with border-radius
  const rows = blocks.map((b, i) => {
    let row = renderBlockRow(b, brand);
    if (i === 0 && !logoRow) {
      row = row.replace('background-color:#ffffff;', 'background-color:#ffffff;border-radius:8px 8px 0 0;');
    }
    if (i === blocks.length - 1) {
      row = row.replace('background-color:#ffffff;', 'background-color:#ffffff;border-radius:0 0 8px 8px;');
    }
    return row;
  }).join('\n');

  // Add top padding to first row
  const bodyRows = `<!-- Top spacing -->
<tr><td style="padding:20px 0 0;"></td></tr>
${logoRow}
${rows}`;

  return emailShell(preheader, bodyRows);
}

/** Render announcement form to responsive HTML string (legacy flat-field mode) */
export function renderAnnouncementToHTML(
  form: AnnouncementForm,
  siteConfig: { siteName: string; memberName?: string }
): string {
  // If using blocks, render from blocks
  if (form.useBlocks && form.blocks.length > 0) {
    return renderBlocksToHTML(form.blocks, siteConfig);
  }

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

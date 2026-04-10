/** Email provider adapter — provider-agnostic interface */

export interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailProviderAdapter {
  name: string;
  send(params: SendEmailParams): Promise<SendEmailResult>;
}

// --- Stub implementations ---

export const mailgunAdapter: EmailProviderAdapter = {
  name: 'mailgun',
  async send(params) {
    console.log('[Mailgun Stub] Sending email:', params.to, params.subject);
    return { success: true, messageId: `mg-${Date.now()}` };
  },
};

export const sesAdapter: EmailProviderAdapter = {
  name: 'ses',
  async send(params) {
    console.log('[SES Stub] Sending email:', params.to, params.subject);
    return { success: true, messageId: `ses-${Date.now()}` };
  },
};

export const sendgridAdapter: EmailProviderAdapter = {
  name: 'sendgrid',
  async send(params) {
    console.log('[SendGrid Stub] Sending email:', params.to, params.subject);
    return { success: true, messageId: `sg-${Date.now()}` };
  },
};

export const postmarkAdapter: EmailProviderAdapter = {
  name: 'postmark',
  async send(params) {
    console.log('[Postmark Stub] Sending email:', params.to, params.subject);
    return { success: true, messageId: `pm-${Date.now()}` };
  },
};

export function getProviderAdapter(provider: string): EmailProviderAdapter {
  switch (provider) {
    case 'mailgun': return mailgunAdapter;
    case 'ses': return sesAdapter;
    case 'sendgrid': return sendgridAdapter;
    case 'postmark': return postmarkAdapter;
    default: return mailgunAdapter;
  }
}

/** AI adapter — provider-agnostic interface for email drafting */

export interface AIDraftResult {
  subject?: string;
  html?: string;
  suggestions?: string[];
}

export interface AIAdapter {
  name: string;
  generateDraft(params: {
    mode: 'subject_suggestions' | 'full_template' | 'chat';
    prompt: string;
    context?: Record<string, unknown>;
    history?: Array<{ role: string; content: string }>;
  }): Promise<AIDraftResult>;
}

// --- Stub implementations ---

export const openaiAdapter: AIAdapter = {
  name: 'openai',
  async generateDraft({ mode, prompt }) {
    await new Promise(r => setTimeout(r, 800)); // simulate latency
    if (mode === 'subject_suggestions') {
      return {
        suggestions: [
          'Exciting Opportunity: Join Our Growing Team',
          `Re: ${prompt.slice(0, 30) || 'Your Application'}`,
          'We Have a Role Perfect for You',
          'New Position Alert — Apply Now',
        ],
      };
    }
    if (mode === 'full_template') {
      return {
        subject: 'Your Next Career Move Starts Here',
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>@media(max-width:600px){.c{width:100%!important;padding:16px!important}}</style></head><body style="margin:0;background:#f4f4f5;font-family:Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table class="c" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;padding:32px"><tr><td style="font-size:24px;font-weight:700;color:#18181b;padding-bottom:16px">Your Next Career Move</td></tr><tr><td style="font-size:14px;color:#3f3f46;line-height:1.6;padding-bottom:24px">${prompt || 'We have an exciting opportunity that matches your skills and experience. Click below to learn more and apply.'}</td></tr><tr><td><a href="{{apply_url}}" style="display:inline-block;background:#18181b;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600">Apply Now</a></td></tr></table></td></tr></table></body></html>`,
      };
    }
    // chat mode
    return {
      html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2 style="color:#18181b;">AI Generated Content</h2><p style="color:#3f3f46;">${prompt}</p></div>`,
    };
  },
};

export const claudeAdapter: AIAdapter = {
  name: 'claude',
  async generateDraft(params) {
    return openaiAdapter.generateDraft(params); // same stub
  },
};

export const geminiAdapter: AIAdapter = {
  name: 'gemini',
  async generateDraft(params) {
    return openaiAdapter.generateDraft(params);
  },
};

export function getAIAdapter(provider?: string): AIAdapter {
  switch (provider) {
    case 'claude': return claudeAdapter;
    case 'gemini': return geminiAdapter;
    default: return openaiAdapter;
  }
}

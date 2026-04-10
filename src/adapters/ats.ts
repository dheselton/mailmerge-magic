/** ATS adapter — provider-agnostic interface for recipient sourcing */

export interface ATSRecipient {
  email: string;
  name: string;
  metadata: Record<string, unknown>;
}

export interface ATSAdapter {
  name: string;
  getRecipients(filters?: Record<string, unknown>): Promise<ATSRecipient[]>;
}

// --- Stub implementations ---

const sampleRecipients: ATSRecipient[] = [
  { email: 'candidate1@example.com', name: 'Alice Johnson', metadata: { stage: 'Interview', role: 'Frontend Engineer' } },
  { email: 'candidate2@example.com', name: 'Bob Smith', metadata: { stage: 'Screen', role: 'Backend Engineer' } },
  { email: 'candidate3@example.com', name: 'Carol Lee', metadata: { stage: 'Offer', role: 'Product Manager' } },
];

export const greenhouseAdapter: ATSAdapter = {
  name: 'greenhouse',
  async getRecipients() { return sampleRecipients; },
};

export const leverAdapter: ATSAdapter = {
  name: 'lever',
  async getRecipients() { return sampleRecipients.slice(0, 2); },
};

export const icims: ATSAdapter = {
  name: 'icims',
  async getRecipients() { return sampleRecipients.slice(1); },
};

export const workdayAdapter: ATSAdapter = {
  name: 'workday',
  async getRecipients() { return sampleRecipients; },
};

export const smartRecruitersAdapter: ATSAdapter = {
  name: 'smartrecruiters',
  async getRecipients() { return sampleRecipients; },
};

export function getATSAdapter(system: string): ATSAdapter {
  switch (system) {
    case 'greenhouse': return greenhouseAdapter;
    case 'lever': return leverAdapter;
    case 'icims': return icims;
    case 'workday': return workdayAdapter;
    case 'smartrecruiters': return smartRecruitersAdapter;
    default: return greenhouseAdapter;
  }
}

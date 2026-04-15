/** Universal CRM merge tokens for the email builder palette (keys without braces). */

export type MergeTagCategory = 'Candidate' | 'Job' | 'Recruiter' | 'Event' | 'Interview' | 'System' | 'Other';

export interface MergeTagDefinition {
  key: string;
  label: string;
  category: MergeTagCategory;
}

export const MERGE_TAG_CATALOG: MergeTagDefinition[] = [
  { key: 'member_name', label: 'Member name', category: 'Candidate' },
  { key: 'member_email', label: 'Member email', category: 'Candidate' },
  { key: 'job_title', label: 'Job title', category: 'Job' },
  { key: 'company_name', label: 'Company name', category: 'Job' },
  { key: 'department', label: 'Department', category: 'Job' },
  { key: 'location', label: 'Location', category: 'Job' },
  { key: 'employment_type', label: 'Employment type', category: 'Job' },
  { key: 'apply_url', label: 'Apply URL', category: 'Job' },
  { key: 'recruiter_name', label: 'Recruiter name', category: 'Recruiter' },
  { key: 'recruiter_email', label: 'Recruiter email', category: 'Recruiter' },
  { key: 'event_name', label: 'Event name', category: 'Event' },
  { key: 'event_date', label: 'Event date', category: 'Event' },
  { key: 'event_url', label: 'Event URL', category: 'Event' },
  { key: 'interview_date', label: 'Interview date', category: 'Interview' },
  { key: 'interview_time', label: 'Interview time', category: 'Interview' },
  { key: 'interview_location', label: 'Interview location', category: 'Interview' },
  { key: 'unsubscribe_url', label: 'Unsubscribe URL', category: 'System' },
  { key: 'site_name', label: 'Site name', category: 'System' },
];

/** Keys from catalog plus any `{{token}}` found in HTML or custom variable keys. */
export function buildUniversalMergeTagKeys(htmlBody: string, extraKeys: string[]): string[] {
  const re = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const fromHtml = new Set<string>();
  let m: RegExpExecArray | null;
  const r = new RegExp(re.source, 'g');
  while ((m = r.exec(htmlBody)) !== null) fromHtml.add(m[1]);

  const catalog = MERGE_TAG_CATALOG.map(t => t.key);
  return [...new Set([...catalog, ...fromHtml, ...extraKeys])].sort((a, b) => a.localeCompare(b));
}

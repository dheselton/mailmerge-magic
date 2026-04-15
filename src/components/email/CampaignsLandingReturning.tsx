import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { EmailCampaign } from '@/types/email-types';
import { MOCK_EVENTS } from '@/data/email-mock-data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { OpenMojiIcon } from '@/components/ui/OpenMojiIcon';

interface CampaignsLandingReturningProps {
  campaigns: EmailCampaign[];
  onContinueDraft: (c: EmailCampaign) => void;
  onQuickJobAnnouncement: () => void;
  onQuickAI: () => void;
  onQuickBlank: () => void;
  onViewAll?: () => void;
  /** Hide the bottom quick-start row when the main path chooser is shown above (e.g. CampaignsLandingEmpty). */
  hideQuickStart?: boolean;
}

export function CampaignsLandingReturning({
  campaigns,
  onContinueDraft,
  onQuickJobAnnouncement,
  onQuickAI,
  onQuickBlank,
  onViewAll,
  hideQuickStart = false,
}: CampaignsLandingReturningProps) {
  const [showAll, setShowAll] = useState(false);
  const sent = campaigns.filter(c => c.status === 'sent');
  const drafts = campaigns.filter(c => c.status === 'draft');
  const delivered = MOCK_EVENTS.filter(e => e.success && e.email_type === 'campaign').length;
  const rates = sent.map(c => c.open_rate).filter((n): n is number => n != null);
  const avgOpen = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
  const displayRows = showAll ? campaigns : campaigns.slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Campaigns sent</p>
          <p className="text-2xl font-semibold">{sent.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg open rate</p>
          <p className={cn('text-2xl font-semibold', avgOpen > 25 && 'text-green-600')}>{avgOpen ? `${avgOpen}%` : '—'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Emails delivered</p>
          <p className="text-2xl font-semibold">{delivered}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Drafts</p>
          <p className={cn('text-2xl font-semibold', drafts.length > 0 && 'text-amber-600')}>{drafts.length}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Recent campaigns</h3>
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => (onViewAll ? onViewAll() : setShowAll(s => !s))}
          >
            View all →
          </button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Subject</TableHead>
              <TableHead>Pool</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Open rate</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.map(c => (
              <TableRow key={c.id}>
                <TableCell>
                  <span
                    className={cn('inline-block h-2 w-2 rounded-full', c.status === 'sent' ? 'bg-green-500' : 'bg-amber-500')}
                    title={c.status}
                  />
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">{c.subject || '(No subject)'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.pool_label ?? '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{format(new Date(c.created_at), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <Badge variant={c.status === 'sent' ? 'default' : 'secondary'}>{c.status}</Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {c.status === 'sent' && c.open_rate != null ? `${c.open_rate}%` : '—'}
                </TableCell>
                <TableCell className="text-right">
                  {c.status === 'draft' ? (
                    <button type="button" className="text-sm text-primary font-medium hover:underline" onClick={() => onContinueDraft(c)}>
                      Continue →
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!hideQuickStart && (
        <div className="flex flex-wrap gap-2 pt-4 border-t justify-center sm:justify-start">
          <Button variant="ghost" size="sm" onClick={onQuickJobAnnouncement}>
            <span className="inline-flex items-center gap-2">
              <OpenMojiIcon name="clipboard" size={18} />
              Job Announcement
            </span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onQuickAI}>
            <span className="inline-flex items-center gap-2">
              <OpenMojiIcon name="sparkles" size={18} />
              AI Builder
            </span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onQuickBlank}>
            <span className="inline-flex items-center gap-2">
              <OpenMojiIcon name="pencil" size={18} />
              Blank Email
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}

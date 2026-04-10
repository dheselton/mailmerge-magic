import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EmailCampaign } from '@/types/email-types';
import { format } from 'date-fns';

interface CampaignHistoryProps {
  campaigns: EmailCampaign[];
  onLoadDraft: (campaign: EmailCampaign) => void;
  onSend: (campaign: EmailCampaign) => void;
}

export function CampaignHistory({ campaigns, onLoadDraft, onSend }: CampaignHistoryProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">Campaign History</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map(c => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.subject}</TableCell>
              <TableCell>
                <Badge variant="outline">{c.compose_kind === 'announcement_form' ? 'Visual' : 'HTML'}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground capitalize">{c.recipient_source.type.replace('_', ' ')}</TableCell>
              <TableCell>
                <Badge variant={c.status === 'sent' ? 'default' : 'secondary'}>{c.status}</Badge>
              </TableCell>
              <TableCell className="text-sm">{format(new Date(c.created_at), 'MMM d, yyyy')}</TableCell>
              <TableCell>
                {c.status === 'draft' ? (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onLoadDraft(c)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => onSend(c)}>Send</Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">{c.sent_at ? format(new Date(c.sent_at), 'MMM d, HH:mm') : ''}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
          {campaigns.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No campaigns yet</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

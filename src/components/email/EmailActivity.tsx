import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { EmailEvent } from '@/types/email-types';
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';

interface EmailActivityProps {
  events: EmailEvent[];
}

export function EmailActivity({ events }: EmailActivityProps) {
  const delivered = events.filter(e => e.success).length;
  const failed = events.filter(e => !e.success).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h3 className="font-semibold text-sm">Email Activity</h3>
        <div className="flex gap-3 text-xs">
          <span className="text-muted-foreground">Delivered: <strong>{delivered}</strong></span>
          <span className="text-muted-foreground">Failed: <strong>{failed}</strong></span>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Provider</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map(e => (
            <TableRow key={e.id}>
              <TableCell className="text-xs">{format(new Date(e.created_at), 'MMM d, HH:mm')}</TableCell>
              <TableCell><Badge variant="outline" className="text-xs">{e.email_type}</Badge></TableCell>
              <TableCell className="text-sm">{e.recipient}</TableCell>
              <TableCell className="text-sm">{e.subject}</TableCell>
              <TableCell>
                {e.success
                  ? <CheckCircle className="h-4 w-4 text-primary" />
                  : <XCircle className="h-4 w-4 text-destructive" />}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{e.provider}</TableCell>
            </TableRow>
          ))}
          {events.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No activity yet</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

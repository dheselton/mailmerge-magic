import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Users } from 'lucide-react';
import type { RecipientSource } from '@/types/email-types';
import { MOCK_TALENT_POOLS } from '@/data/email-mock-data';

interface RecipientPanelProps {
  source: RecipientSource;
  onSourceChange: (s: RecipientSource) => void;
}

export function RecipientPanel({ source, onSourceChange }: RecipientPanelProps) {
  const [recipientCount, setRecipientCount] = useState(0);

  useEffect(() => {
    if (source.type === 'talent_pool') {
      const pool = MOCK_TALENT_POOLS.find(p => p.id === source.pool_id);
      setRecipientCount(pool?.count ?? 0);
    } else if (source.type === 'ats') {
      setRecipientCount(3); // stub
    } else if (source.type === 'all_members') {
      setRecipientCount(523);
    } else {
      setRecipientCount(0);
    }
  }, [source]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-semibold">Recipients</Label>
        {recipientCount > 0 && (
          <Badge variant="secondary"><Users className="h-3 w-3 mr-1" />{recipientCount}</Badge>
        )}
      </div>

      <Select value={source.type} onValueChange={v => onSourceChange({ type: v as RecipientSource['type'] })}>
        <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="talent_pool">CRM Talent Pool</SelectItem>
          <SelectItem value="ats">ATS System</SelectItem>
          <SelectItem value="csv">Manual CSV</SelectItem>
          <SelectItem value="all_members">All Members</SelectItem>
        </SelectContent>
      </Select>

      {source.type === 'talent_pool' && (
        <Select value={source.pool_id ?? ''} onValueChange={v => onSourceChange({ ...source, pool_id: v })}>
          <SelectTrigger><SelectValue placeholder="Select pool" /></SelectTrigger>
          <SelectContent>
            {MOCK_TALENT_POOLS.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name} ({p.count})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {source.type === 'ats' && (
        <div className="space-y-2">
          <Select value={source.system ?? ''} onValueChange={v => onSourceChange({ ...source, system: v })}>
            <SelectTrigger><SelectValue placeholder="Select ATS" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="greenhouse">Greenhouse</SelectItem>
              <SelectItem value="lever">Lever</SelectItem>
              <SelectItem value="icims">iCIMS</SelectItem>
              <SelectItem value="workday">Workday</SelectItem>
              <SelectItem value="smartrecruiters">SmartRecruiters</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Filter by role..." onChange={e => onSourceChange({ ...source, filter: { role: e.target.value } })} />
        </div>
      )}

      {source.type === 'csv' && (
        <div>
          <Button variant="outline" size="sm" className="w-full">
            <Upload className="h-4 w-4 mr-1" /> Upload CSV
          </Button>
          <p className="text-xs text-muted-foreground mt-1">Columns: email, name (optional)</p>
        </div>
      )}
    </div>
  );
}

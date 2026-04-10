import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MERGE_TAGS } from '@/types/email-types';
import type { ComposeKind } from '@/types/email-types';
import { insertIntoTextarea } from '@/lib/email-utils';

interface MergeTagsPanelProps {
  composeKind: ComposeKind;
  codeTextareaRef: React.RefObject<HTMLTextAreaElement>;
  htmlBody: string;
  onHtmlBodyChange: (h: string) => void;
  onFormFieldAppend?: (tag: string) => void;
}

export function MergeTagsPanel({ composeKind, codeTextareaRef, htmlBody, onHtmlBodyChange, onFormFieldAppend }: MergeTagsPanelProps) {
  const handleClick = (tag: string) => {
    if (composeKind === 'raw_html' && codeTextareaRef.current) {
      insertIntoTextarea(codeTextareaRef.current, tag, htmlBody, onHtmlBodyChange);
    } else if (onFormFieldAppend) {
      onFormFieldAppend(tag);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Merge Tags</p>
      <div className="flex flex-wrap gap-1">
        {MERGE_TAGS.map(mt => (
          <Badge
            key={mt.tag}
            variant="outline"
            className="cursor-pointer hover:bg-accent text-xs"
            onClick={() => handleClick(mt.tag)}
          >
            {mt.label}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Click to insert at cursor</p>
    </div>
  );
}

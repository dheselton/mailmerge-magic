import type { AnnouncementForm } from '@/types/email-types';

interface AnnouncementLayoutPreviewProps {
  form: AnnouncementForm;
  viewport: 'desktop' | 'mobile';
}

export function AnnouncementLayoutPreview({ form, viewport }: AnnouncementLayoutPreviewProps) {
  const maxW = viewport === 'mobile' ? 375 : '100%';
  return (
    <div className="border rounded-md overflow-auto bg-muted/30" style={{ maxWidth: maxW }}>
      <div className="p-6 max-w-[560px] mx-auto bg-background rounded" style={{ fontFamily: 'Arial, sans-serif' }}>
        <p className="text-xs text-muted-foreground mb-3">Your Company</p>
        <p className="text-sm text-foreground mb-2">Hi {'{{member_name}}'},</p>
        {form.headline && <h2 className="text-xl font-bold text-foreground mb-1">{form.headline}</h2>}
        {form.subhead && <p className="text-sm text-muted-foreground mb-3">{form.subhead}</p>}
        {form.message && <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-4">{form.message}</p>}
        {form.buttonLabel && (
          <a href={form.buttonUrl || '#'} className="inline-block bg-primary text-primary-foreground px-5 py-2 rounded text-sm font-semibold no-underline mb-4">
            {form.buttonLabel}
          </a>
        )}
        {form.signOff && <p className="text-sm text-muted-foreground mt-4">{form.signOff}</p>}
        <hr className="my-4 border-border" />
        <p className="text-xs text-muted-foreground"><a href="#" className="text-muted-foreground underline">Unsubscribe</a></p>
      </div>
    </div>
  );
}

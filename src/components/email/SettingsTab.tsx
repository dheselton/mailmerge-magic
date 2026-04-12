import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { BrandSettings } from '@/types/email-types';
import { EMAIL_SAFE_FONTS } from '@/types/email-types';
import { ctaButton } from '@/lib/email-utils';
import { Palette, Type, Image, Building2 } from 'lucide-react';

interface SettingsTabProps {
  brand: BrandSettings;
  onBrandChange: (brand: BrandSettings) => void;
}

export function SettingsTab({ brand, onBrandChange }: SettingsTabProps) {
  const update = (patch: Partial<BrandSettings>) => onBrandChange({ ...brand, ...patch });

  const isCustomFont = !EMAIL_SAFE_FONTS.includes(brand.fontFamily);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Settings Form */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5" /> Brand Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={brand.primaryColor}
                  onChange={e => update({ primaryColor: e.target.value })}
                  className="h-10 w-14 rounded border border-input cursor-pointer"
                />
                <Input
                  value={brand.primaryColor}
                  onChange={e => update({ primaryColor: e.target.value })}
                  placeholder="#2563eb"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Used for CTA buttons, headers, and accents.</p>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={brand.secondaryColor}
                  onChange={e => update({ secondaryColor: e.target.value })}
                  className="h-10 w-14 rounded border border-input cursor-pointer"
                />
                <Input
                  value={brand.secondaryColor}
                  onChange={e => update({ secondaryColor: e.target.value })}
                  placeholder="#1e40af"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Used for borders, hover states, and secondary elements.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Type className="h-5 w-5" /> Typography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={isCustomFont ? '__custom__' : brand.fontFamily}
                onValueChange={v => {
                  if (v !== '__custom__') update({ fontFamily: v });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_SAFE_FONTS.map(f => (
                    <SelectItem key={f} value={f}>
                      <span style={{ fontFamily: f }}>{f.split(',')[0]}</span>
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">Custom…</SelectItem>
                </SelectContent>
              </Select>
              {isCustomFont && (
                <Input
                  value={brand.fontFamily}
                  onChange={e => update({ fontFamily: e.target.value })}
                  placeholder="'Custom Font', Arial, sans-serif"
                />
              )}
              <p className="text-xs text-muted-foreground">Email clients support limited fonts. Web-safe fonts recommended.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Image className="h-5 w-5" /> Company Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input
                value={brand.logoUrl}
                onChange={e => update({ logoUrl: e.target.value })}
                placeholder="https://yourcompany.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">Recommended: 200×50px or similar horizontal logo. PNG or JPG.</p>
            </div>
            {brand.logoUrl && (
              <div className="border rounded-md p-4 bg-muted/30 flex items-center justify-center">
                <img
                  src={brand.logoUrl}
                  alt="Logo preview"
                  className="max-h-16 max-w-[200px] object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" /> Company Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={brand.companyName}
                onChange={e => update({ companyName: e.target.value })}
                placeholder="Your Company"
              />
              <p className="text-xs text-muted-foreground">Appears in email headers, footers, and merge tags.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Live Preview</h3>
        <div className="border rounded-lg overflow-hidden bg-white">
          <iframe
            srcDoc={generatePreviewHtml(brand)}
            className="w-full border-0"
            style={{ height: '600px' }}
            title="Brand preview"
            sandbox=""
          />
        </div>
      </div>
    </div>
  );
}

function generatePreviewHtml(brand: BrandSettings): string {
  const { primaryColor, fontFamily, logoUrl, companyName } = brand;
  const logoRow = logoUrl
    ? `<tr><td style="padding:20px 40px 10px;background-color:#ffffff;border-radius:8px 8px 0 0;text-align:center;">
        <img src="${logoUrl}" alt="${companyName}" style="max-height:50px;max-width:200px;display:inline-block;" />
       </td></tr>`
    : '';
  const headerRadius = logoUrl ? '' : 'border-radius:8px 8px 0 0;';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>body{margin:0;padding:0;background:#f4f4f7;}</style></head>
<body>
<center style="width:100%;background:#f4f4f7;padding:20px 0;">
<table role="presentation" width="500" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;max-width:500px;">
${logoRow}
<tr>
<td style="padding:${logoUrl ? '10px' : '30px'} 40px 10px;background-color:#ffffff;${headerRadius}">
<p style="margin:0 0 4px;font-family:${fontFamily};font-size:12px;color:${primaryColor};font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Now Hiring</p>
<h1 style="margin:0 0 6px;font-family:${fontFamily};font-size:24px;line-height:30px;color:#1a1a2e;font-weight:bold;">Senior Product Designer</h1>
<p style="margin:0;font-family:${fontFamily};font-size:14px;color:#6b7280;">Design Team · Remote · Full-time</p>
</td>
</tr>
<tr>
<td style="padding:16px 40px 12px;background-color:#ffffff;">
<p style="margin:0 0 12px;font-family:${fontFamily};font-size:15px;line-height:24px;color:#374151;">Hi Jane,</p>
<p style="margin:0 0 12px;font-family:${fontFamily};font-size:15px;line-height:24px;color:#374151;">We have an exciting new opportunity at <strong>${companyName}</strong> that matches your background.</p>
</td>
</tr>
<tr>
<td style="padding:0 40px 24px;background-color:#ffffff;">
${ctaButton('View Role & Apply', '#', primaryColor)}
</td>
</tr>
<tr>
<td style="padding:0 40px 24px;background-color:#ffffff;border-radius:0 0 8px 8px;">
<p style="margin:0;font-family:${fontFamily};font-size:14px;color:#6b7280;">Best,<br/>${companyName} Recruiting Team</p>
</td>
</tr>
<tr>
<td style="padding:16px 40px;font-family:${fontFamily};font-size:11px;color:#9a9a9a;text-align:center;">
${companyName} · <a href="#" style="color:#9a9a9a;">Unsubscribe</a>
</td>
</tr>
</table>
</center>
</body></html>`;
}

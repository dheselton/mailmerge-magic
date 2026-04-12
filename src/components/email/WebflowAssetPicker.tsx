import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Upload, Loader2, Info } from 'lucide-react';
import { webflowAdapter, type WebflowAsset } from '@/adapters/webflow';
import { toast } from 'sonner';

interface WebflowAssetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (asset: WebflowAsset) => void;
  siteId?: string;
}

export function WebflowAssetPicker({ open, onOpenChange, onSelect, siteId = 's1' }: WebflowAssetPickerProps) {
  const [assets, setAssets] = useState<WebflowAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    webflowAdapter.getAssets(siteId).then(a => {
      setAssets(a);
      setLoading(false);
    });
  }, [open, siteId]);

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setUploading(true);
    try {
      const uploaded = await webflowAdapter.uploadAsset(siteId, file);
      setAssets(prev => [uploaded, ...prev]);
      toast.success(`Uploaded ${file.name}`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const extBadge = (type: string) => {
    if (type.includes('svg')) return 'SVG';
    if (type.includes('png')) return 'PNG';
    if (type.includes('jpeg') || type.includes('jpg')) return 'JPG';
    if (type.includes('gif')) return 'GIF';
    if (type.includes('webp')) return 'WEBP';
    return 'IMG';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Webflow Asset Library</DialogTitle>
          <DialogDescription>
            Browse and select images from your Webflow site, or upload new ones.
          </DialogDescription>
        </DialogHeader>

        {/* Size guidance */}
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-muted/50 border text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>For best results in emails, use images <strong>600px wide</strong>. JPG or PNG recommended. Images will be scaled to fit the email layout.</span>
        </div>

        {/* Search + Upload */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="pl-9 h-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            Upload New
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {/* Asset Grid */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              {search ? 'No assets match your search' : 'No assets found'}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 py-1">
              {filtered.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => {
                    onSelect(asset);
                    onOpenChange(false);
                  }}
                  className="group relative border rounded-lg overflow-hidden bg-muted/20 hover:ring-2 hover:ring-primary transition-all text-left"
                >
                  <div className="aspect-video bg-muted/30 flex items-center justify-center overflow-hidden">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2 space-y-1">
                    <p className="text-xs font-medium truncate">{asset.name}</p>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {extBadge(asset.type)}
                      </Badge>
                      {asset.dimensions && (
                        <span className="text-[10px] text-muted-foreground">
                          {asset.dimensions.width}×{asset.dimensions.height}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

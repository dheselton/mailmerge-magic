

## Enhanced Image Block with Webflow Asset Picker

### Problem
The current image block only has a raw URL input — users don't know what sizes work, can't browse existing assets, and can't upload new images. It needs a Webflow-integrated asset picker plus smart size guidance.

### Plan

**1. Extend Webflow adapter** (`src/adapters/webflow.ts`)
- Add `uploadAsset(siteId: string, file: File): Promise<WebflowAsset>` to the interface and stub
- Add `dimensions` field to `WebflowAsset` (`width`, `height`) for size info
- Add more realistic mock assets with varied dimensions

**2. Create `WebflowAssetPicker` dialog** (`src/components/email/WebflowAssetPicker.tsx`)
- A `Dialog` component that fetches assets from `webflowAdapter.getAssets()`
- Grid of asset thumbnails with name, dimensions, and file type badge
- Search/filter bar to find assets by name
- Click to select → inserts URL into the image block
- "Upload New" button at top: opens a file input, calls `webflowAdapter.uploadAsset()`, then selects the newly uploaded asset
- Shows recommended size guidance: "For best results, use images 600px wide" as a helper note at the top

**3. Enhance the image `BlockEditor`** in `EmailComposer.tsx`
- Add a "Browse Assets" button next to the URL input that opens `WebflowAssetPicker`
- Add image size guidance text below the URL input: "Recommended: 600px wide, JPG/PNG. Images will be scaled to fit."
- Add optional width input (number field, default 600) so users can control rendering width
- Show detected dimensions in the preview thumbnail when an image is loaded

**4. Update `ImageBlock` type** (`src/types/email-types.ts`)
- Add optional `webflowAssetId?: string` to track which Webflow asset was used (for future sync)

### Files Changed

| File | Change |
|------|--------|
| `src/adapters/webflow.ts` | Add `uploadAsset`, add `dimensions` to `WebflowAsset`, expand mocks |
| `src/components/email/WebflowAssetPicker.tsx` | **New** — asset browser dialog with grid, search, upload |
| `src/components/email/EmailComposer.tsx` | Update image `BlockEditor` with asset picker trigger, size guidance, width control |
| `src/types/email-types.ts` | Add `webflowAssetId` to `ImageBlock` |


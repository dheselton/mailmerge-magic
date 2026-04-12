

## Dynamic Block-Based Email Editor with HTML Parsing

### Problem
The Visual and Code editors are disconnected. Selecting a starter template or importing HTML only populates the Code tab — the Visual form stays empty. The Visual form has fixed fields that don't adapt to the template's actual content. Users must edit code even for simple changes. There's also no image support.

### Solution
Replace the fixed 6-field form with a **dynamic content block system** that automatically adapts to any HTML source. The parser extracts what's in the HTML and creates only the relevant block editors — no empty fields, no missing fields.

---

### Architecture

```text
HTML (any source)
       │
       ▼
┌──────────────────┐
│ parseHtmlToBlocks │  ← DOMParser-based extractor
└──────────────────┘
       │
       ▼
  ContentBlock[]        ← heading, text, image, button, divider, spacer
       │
       ├──► Visual Editor (dynamic block list, add/remove/reorder)
       │
       └──► renderBlocksToHTML() ──► Code Editor (full email HTML)
```

Bidirectional sync: switching tabs re-parses or re-renders.

---

### Content Block Types

| Type | Fields | When shown |
|------|--------|------------|
| `heading` | text, level (h1/h2/h3) | Detected `<h1>`–`<h3>` |
| `text` | content | Detected `<p>` or text-heavy `<td>` |
| `image` | url, alt, width | Detected `<img>` |
| `button` | label, url | Detected styled `<a>` (background + padding) |
| `divider` | — | Detected `<hr>` or border-top separators |
| `spacer` | height | User-added only |

### Plan

**1. Define `ContentBlock` type** in `src/types/email-types.ts`
- Discriminated union with `type` field
- Extend `AnnouncementForm` with `blocks: ContentBlock[]` and `useBlocks: boolean`
- Backward compatible — legacy flat fields still work when `useBlocks` is false

**2. HTML-to-blocks parser** in `src/lib/email-utils.ts`
- `parseHtmlToBlocks(html: string): ContentBlock[]` using `DOMParser`
- Walks the email body's table structure, extracts content in document order
- Skips boilerplate: preheader div, MSO conditionals, unsubscribe footer
- Identifies buttons by inline style heuristics (background + display:inline-block or VML roundrect)
- Extracts `<img>` with src, alt, width
- Groups adjacent short `<p>` tags vs long text blocks

**3. Blocks-to-HTML renderer** in `src/lib/email-utils.ts`
- `renderBlocksToHTML(blocks: ContentBlock[], siteConfig): string`
- Reuses the existing `emailShell()` wrapper from mock data (extract to shared utility)
- Each block type maps to a table row with proper inline styles
- Images render as fluid `<img>` inside table cells with max-width
- Buttons use the existing `ctaButton()` VML helper

**4. Dynamic Visual Editor UI** in `src/components/email/EmailComposer.tsx`
- When blocks are present, render a list of inline block editors instead of fixed fields
- Each block: minimal editor (Input for heading, Textarea for text, URL+alt+preview for image, label+URL for button)
- Delete (×) button on each block to remove it
- "Add block" dropdown at bottom: Heading, Text, Image, Button, Divider
- Up/down arrows for reordering

**5. Wire all entry points to parse → populate blocks**
- Starter Library select → parse HTML → set blocks → open in Visual mode
- Import HTML file → parse → set blocks → Visual mode
- Paste HTML → parse → set blocks
- AI Chat "Apply" → parse → set blocks
- Tab switch Code→Visual → re-parse `htmlBody` into blocks (toast: "Fields extracted from HTML")
- Tab switch Visual→Code → `renderBlocksToHTML(blocks)` into `htmlBody`

**6. Update `AnnouncementLayoutPreview`** to render blocks dynamically — images, multiple headings/text sections, buttons all shown in order.

**7. Update `TemplatesTab` and `CampaignsTab`** starter library handlers to use block parsing instead of raw_html mode.

**8. Extract `emailShell()` and `ctaButton()`** from `email-mock-data.ts` into `email-utils.ts` so the renderer can reuse them.

### Files Changed

| File | Change |
|------|--------|
| `src/types/email-types.ts` | Add `ContentBlock` union, extend `AnnouncementForm` with `blocks` + `useBlocks` |
| `src/lib/email-utils.ts` | Add `parseHtmlToBlocks()`, `renderBlocksToHTML()`, move `emailShell()`/`ctaButton()` here, update `emptyAnnouncementForm()` |
| `src/components/email/EmailComposer.tsx` | Replace fixed form with dynamic block editor, wire parsing at all import/switch points, add image block support |
| `src/components/email/AnnouncementLayoutPreview.tsx` | Render blocks dynamically |
| `src/components/email/CampaignsTab.tsx` | Update `handleApplyAI` and starter library to use block parsing |
| `src/components/email/TemplatesTab.tsx` | Update starter library handler to parse into blocks and open Visual mode |
| `src/components/email/StarterLibraryDialog.tsx` | No changes needed |
| `src/data/email-mock-data.ts` | Remove `emailShell`/`ctaButton` (moved to utils), keep template HTML strings and exports |


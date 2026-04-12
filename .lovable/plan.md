

## Add Recruiting CRM Starter Templates + Brand Settings Tab (Revised)

### Key change from previous plan
Removed "Offer Letter Preview" and "Application Received" templates — those belong to an ATS, not a recruiting CRM. Replaced with CRM-appropriate outreach and engagement templates.

### New Starter Templates (6 additions → 12 total)

| # | Name | Category | Has Images |
|---|------|----------|------------|
| 7 | Welcome to Talent Community | Engagement | Hero banner image |
| 8 | Hiring Manager Introduction | Sourcing | Headshot placeholder |
| 9 | Culture Spotlight | Engagement | Hero image + team photo |
| 10 | Diversity & Inclusion Event | Engagement | Hero banner |
| 11 | Passive Candidate Outreach | Sourcing | Company logo header |
| 12 | Employee Spotlight / Testimonial | Engagement | Employee photo + quote |

All templates are outbound CRM communications — things a recruiter or talent team would proactively send, not automated ATS status updates.

### Brand Settings

New **Settings** tab in Email module:
- Primary & secondary color pickers
- Font family dropdown (email-safe fonts + custom)
- Company logo URL with preview
- Company name field
- Brand settings injected into `renderBlocksToHTML()` and `emailShell()`

### Plan

**1.** Add `BrandSettings` type to `src/types/email-types.ts`

**2.** Create `SettingsTab` component (`src/components/email/SettingsTab.tsx`) with color pickers, font selector, logo input, company name

**3.** Add 6 new template HTML strings to `src/data/email-mock-data.ts` with hero images and inline photos; add `'Onboarding'` category removed — keep existing categories

**4.** Update `StarterLibraryDialog.tsx` — add category filter chips for browsing 12 templates

**5.** Wire Settings tab into `EmailModule.tsx`, manage `BrandSettings` state

**6.** Update `emailShell()`, `ctaButton()`, `renderBlocksToHTML()` in `src/lib/email-utils.ts` to accept optional `BrandSettings` and inject brand colors/fonts

### Files Changed

| File | Change |
|------|--------|
| `src/types/email-types.ts` | Add `BrandSettings` interface |
| `src/components/email/SettingsTab.tsx` | **New** — brand config form |
| `src/data/email-mock-data.ts` | 6 new CRM-focused templates with images |
| `src/components/email/StarterLibraryDialog.tsx` | Category filter chips |
| `src/pages/EmailModule.tsx` | Settings tab + BrandSettings state |
| `src/lib/email-utils.ts` | Brand-aware rendering |
| `src/components/email/CampaignsTab.tsx` | Pass brand settings to renderer |


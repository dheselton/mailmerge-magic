

## Refine Starter Email Templates for Recruiting CRM

### Problem
The current 3 starter templates are bare-bones single-line HTML snippets with no styling, no email-client compatibility, and no recruiting-specific content. They need to be production-quality, responsive, table-based HTML emails that render correctly across all major email clients (Gmail, Outlook, Apple Mail, Yahoo, mobile).

### Plan

**1. Expand to 6 recruiting-specific starter templates** in `src/data/email-mock-data.ts`:

| Template | Purpose |
|----------|---------|
| **Job Announcement** | Announce a new open role with title, team, location, and Apply CTA |
| **Event Invitation** | Invite candidates to a career fair, webinar, or meetup |
| **Candidate Newsletter** | Monthly talent community update with multiple content blocks |
| **Interview Confirmation** | Confirm interview details — date, time, interviewer, prep tips |
| **Referral Request** | Ask existing employees/contacts to refer candidates |
| **Talent Pool Re-engagement** | Re-engage cold candidates with new opportunities |

Each template will include:
- Full `<!DOCTYPE html>` document structure with MSO conditionals for Outlook
- Table-based layout (no divs for structure) — max 600px centered container
- Inline styles only (no `<style>` block reliance for critical rendering)
- `@media` queries for mobile responsiveness in supporting clients
- Brand-neutral color scheme (dark text on white, neutral CTA button) so it works for any company
- Merge tags: `{{member_name}}`, `{{company_name}}`, `{{job_title}}`, `{{apply_url}}`, `{{unsubscribe_url}}`
- Proper preheader text, alt text patterns, and unsubscribe footer
- MSO VML roundrect buttons for Outlook

**2. Add `subject` and `category` fields** to the `STARTER_TEMPLATES` type so the dialog can show richer info and pre-fill the subject line.

**3. Enhance `StarterLibraryDialog`** in `src/components/email/StarterLibraryDialog.tsx`:
- Add a scaled iframe preview of each template inside the card
- Add category badges (e.g., "Sourcing", "Scheduling", "Engagement")
- Pass subject back to the composer when selected
- Wider dialog (`max-w-3xl`) with a 2-column grid

**4. Wire "From Starter Library"** — enable the currently disabled dropdown item in `TemplatesTab.tsx` to open the StarterLibraryDialog.

### Files Changed
- `src/data/email-mock-data.ts` — replace 3 simple templates with 6 full HTML templates
- `src/components/email/StarterLibraryDialog.tsx` — enhanced UI with previews and categories
- `src/components/email/TemplatesTab.tsx` — wire up starter library dropdown item
- `src/components/email/CampaignsTab.tsx` — wire up starter library if applicable there too


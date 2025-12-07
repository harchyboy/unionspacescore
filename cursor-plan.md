# Add “last activity” under contact names

We will replace the dash under each contact’s name in the HTML contacts list with a friendly “Last activity” subline.

## Plan
1) Use existing activity data  
   - Rely on the `lastActivityHours`/`lastActivity` data from `/api/contacts` (mapped from Zoho) already present in the list response.
2) Format a friendly string  
   - 0–1 hour → “Just now”; <24h → “Xh ago”; <7d → “Xd ago”; otherwise show a date or “Not tracked” when missing.
3) Render under name  
   - In `public/Contacts List Page.html`, replace the dash under the name with this formatted string, keeping spacing/layout unchanged.
4) Fallbacks  
   - Show “Not tracked” (or “—” if no data) so rows without activity still render cleanly and keep click-to-open behavior.


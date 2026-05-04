# Acreages Demo Agent Context

## Current Workspace
- Active repo: `C:\Users\praka\Documents\GitHub\realestatedemo`
- The site is now being edited directly in the real repo, not the older temp copy.
- Current dev server target used during recent checks: `http://127.0.0.1:4178/`

## Site Structure
- Multi-page static Vite site
- Routes:
  - `/`
  - `/projects/`
  - `/villas/`
  - `/investor/`
  - `/nri/`
  - `/gallery/`
  - `/blogs/`
  - `/contact/`
  - `/dashboard/`

## Shared Architecture
- Shared data modules in `/data`
- Shared app code in `/app`
- Shared stylesheet in `/style.css`
- Shared layout rendered by JS into shell HTML pages
- Multi-page Vite build configured in `/vite.config.js`

## Functional Requirements Preserved
- Lead form saves to `localStorage`
- Dashboard reads local lead records
- CSV export works
- Gallery supports lightbox
- Theme toggle persists preference in `localStorage`
- Homepage and route pages share one render system through `app/pages.js`

## Public Data Sources Used
- `https://acreages.co.in/`
- `https://acreages.co.in/projects/`
- `https://acreages.co.in/rivlynestate/`
- `https://acreages.co.in/premium-farmhouse-serenity-park/`
- `https://acreages.co.in/premium-farmhouse-diviana-park/`
- `https://acreages.co.in/elarise-park/`
- `https://acreages.co.in/premium-farmhouse-avyay-park/`
- `acreages_complete_website_data_document_clean.docx`

## Main Word Data Source
- Primary structured content source is now `acreages_complete_website_data_document_clean.docx` in the repo root.
- Website content additions should be compared against this root document first.
- Keep treating this as a content and data migration source, not a redesign trigger.
## UI Preservation Direction
- User explicitly wants the original premium UI/UX foundation preserved.
- Use a surgical improvement approach only.
- Do not redesign the whole site.
- Prefer existing classes, spacing rhythm, card language, and dark premium aesthetic before introducing anything new.

## Major Work Already Completed
- Converted the old long one-page flow into route-based pages for Home, Projects, Villas, Investor, NRI, Gallery, Blogs, Contact, and Dashboard.
- Replaced stale anchor navigation with real route-based navigation.
- Restored the design closer to the original premium dark visual language after an over-redesign pass upset the user.
- Improved the navbar UX by increasing hit areas, grouping lower-priority links into `More`, improving mobile navigation, and restoring the theme toggle.
- Fixed the navbar overlap issue by switching to the mobile navigation pattern earlier and widening the header shell.
- Kept light mode support while preserving the core premium style.
- Added the animated homepage featured-project showcase below the trust stats band.

## Featured Projects Showcase Added
- Uses the existing `featuredProjects` data from `data/projects.js`.
- Markup lives in `app/pages.js`.
- Behavior lives in `app/main.js`.
- Styling lives in `style.css`.
- Pattern chosen: premium tabbed showcase with one active project at a time.
- Includes:
  - autoplay every `5.2s`
  - manual tab switching
  - progress dots
  - `Prev` / `Next` controls
  - pause on hover/focus
  - touch swipe support on mobile

## Acreages Assistant Added
- Premium floating chatbot launcher added to the shared site shell.
- Main runtime file: `/app/chatbot.js`
- Bootstrapped from `/app/main.js`
- Knowledge source: `/chatbot/knowledge-base.json`
- Knowledge base is generated from the uploaded Word document using `/scripts/build-chatbot-kb.py`
- The assistant uses document-derived project profiles, services, contacts, quick actions, and chunked knowledge text.
- Retrieval logic is lightweight client-side search over the generated chunks plus structured project matching.
- Chatbot supports:
  - project recommendations
  - project comparison prompts
  - pricing / availability routing
  - brochure / callback / site-visit lead capture
  - NRI, investor, legal, villas, channel partner, referral, and careers answers
  - lead saving into the existing localStorage agent record
- UI styling was added in `/style.css` and intentionally kept premium, compact, and layered over the current design rather than redesigning the page.

## Static Asset Build Notes
- `vite.config.js` now copies `/photos` and `/chatbot` into `dist` during production build.
- This fixes production availability for image paths and the chatbot knowledge JSON.

## Known Copy / Code Notes
- `app/pages.js` uses `&bull;` for user-facing separators in some card labels.
- Keep copy grounded in public Acreages information only.
- Some villa and future-project details remain intentionally neutral because the public site does not fully confirm them.
- The chatbot generator script currently prints JSON to stdout; use PowerShell redirection to rebuild the file in this workspace:
  - `python scripts\build-chatbot-kb.py | Set-Content -Path chatbot\knowledge-base.json -Encoding utf8`

## Verification Status
- `npm run build` passed after the chatbot and static-copy changes.
- Recent HTTP checks returned `200` for:
  - homepage
  - `/chatbot/knowledge-base.json`
- Production build now contains:
  - `/dist/photos/...`
  - `/dist/chatbot/knowledge-base.json`
  - `/dist/chatbot/acreages_complete_website_data_document_clean.docx`

## Primary Files Recently Touched
- `/app/chatbot.js`
- `/app/main.js`
- `/app/pages.js`
- `/style.css`
- `/vite.config.js`
- `/scripts/build-chatbot-kb.py`
- `/chatbot/knowledge-base.json`
- `/AGENT_CONTEXT.md`

## Word Data Expansion Added
- Added richer Acreages content from the root Word document into `/data/brand.js`, `/data/projects.js`, `/data/blogs.js`, `/data/villas.js`, `/data/leads.js`, and new `/data/support.js`.
- Expanded `/app/pages.js` so Home, Projects, Villas, Investor, NRI, Blogs, Contact, and Dashboard now surface more public Acreages detail without changing the approved UI/UX direction.
- Lead project options now include Violet Park II, Leafwood Park, Orchard Park, Shrivardhan Seawinds Park, and Shahapur Nest Park.

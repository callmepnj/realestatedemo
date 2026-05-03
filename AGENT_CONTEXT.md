# Acreages Demo Agent Context

## Current Workspace
- Writable working copy: `C:\Users\praka\AppData\Local\Temp\realestatedemo-acreages`
- Original repo in `Documents` is blocked by Windows Controlled Folder Access and cannot be edited directly by the agent.

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
- Status updates persist
- CSV export persists
- Gallery supports lightbox
- Theme toggle defaults to light mode and saves preference in `localStorage`

## Public Data Sources Used
- `https://acreages.co.in/`
- `https://acreages.co.in/projects/`
- `https://acreages.co.in/rivlynestate/`
- `https://acreages.co.in/premium-farmhouse-serenity-park/`
- `https://acreages.co.in/premium-farmhouse-diviana-park/`
- `https://acreages.co.in/elarise-park/`
- `https://acreages.co.in/premium-farmhouse-avyay-park/`

## Remaining Notes
- Some project details remain intentionally neutral because they are not fully published on the public site.
- Villa page uses honest wording and public concept pricing only where shown on Acreages pages.

## Cleanup Pass Completed
- Converted the long single-page structure into separate pages for Home, Projects, Villas, Investor, NRI, Gallery, Blogs, Contact, and Dashboard.
- Fixed stale anchor-based navigation data and replaced it with real route-based navigation.
- Cleaned visible encoding glitches and tightened UI copy across shared templates.
- Made light mode the default theme and kept the persisted theme toggle.
- Fixed the header CTA styling bug by switching it to the shared primary button system.
- Added explicit multi-page Vite inputs so production builds now output every route correctly.
- Verified `npm install` and `npm run build` in the temp workspace.
- Verified HTTP `200` responses on:
  - `http://127.0.0.1:4175/`
  - `http://127.0.0.1:4175/projects/`
  - `http://127.0.0.1:4175/villas/`
  - `http://127.0.0.1:4175/investor/`
  - `http://127.0.0.1:4175/nri/`
  - `http://127.0.0.1:4175/gallery/`
  - `http://127.0.0.1:4175/blogs/`
  - `http://127.0.0.1:4175/contact/`
  - `http://127.0.0.1:4175/dashboard/`
- Verified dev server HTTP `200` responses on:
  - `http://127.0.0.1:4176/`
  - `http://127.0.0.1:4176/projects/`
  - `http://127.0.0.1:4176/contact/`
  - `http://127.0.0.1:4176/dashboard/`

## Primary Files Touched In Cleanup
- `/data/navigation.js`
- `/data/blogs.js`
- `/app/site.js`
- `/app/pages.js`
- `/app/main.js`
- `/vite.config.js`

## UI Preservation Direction
- User explicitly asked to preserve the original premium UI/UX foundation.
- Current implementation has been moved back toward the original dark premium visual language from the repo history.
- Keep future edits surgical: improve structure, copy, routing, responsiveness, and reliability without redesigning the interface.
- Prefer existing classes and layout patterns from the original demo before introducing new visual systems.

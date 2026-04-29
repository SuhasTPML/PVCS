# Voting System Plan - Cine Sammana

## Feasibility

This plan is implementable in the current repo, but it requires a new backend and a front-end flow change.

What already matches:
- The four category IDs already exist in `data.js`
- The voting swiper page already renders category-by-category nominee carousels
- The frontend already keeps local voting state per category

What is missing:
- There is no Apps Script backend in the repo yet
- There is no phone-capture step
- There is no final submission flow
- There is no duplicate-checking persistence layer yet

## Scope For This Phase

Build the core voting flow only:
- User votes in all 4 categories
- Phone number is collected only after the last category
- One submission writes all selections together
- Duplicate voting is blocked by phone number
- Success, duplicate, and error states are shown clearly

Leave these for a later phase:
- Live aggregated vote counts
- Live vote share display
- Previous-vote lookup for duplicate submissions

## 1. Backend: Apps Script Web App

Use Google Apps Script as the submission API and results API.

### Sheet schema

One row per submission:

```txt
timestamp | phone | best-film | best-director | best-performance | audience-choice
```

### `doPost(e)`

Responsibilities:
- Parse `phone` and all 4 category selections from the request body
- Validate all required fields are present
- Validate phone server-side with `/^[6-9]\d{9}$/`
- Acquire a `LockService` lock before checking and writing
- Check whether the phone already exists in the sheet
- If duplicate, return `{ status: "duplicate" }`
- If new, append the row and return `{ status: "ok" }`

### `doGet(e)`

Responsibilities:
- Read all submission rows
- Return aggregated vote counts per nominee per category as JSON

### Deployment settings

- Execute as: Me
- Who has access: Anyone, even anonymous

## 2. Frontend Voting State

Track selections in memory until final submission:

```js
{
  "best-film": null,
  "best-director": null,
  "best-performance": null,
  "audience-choice": null
}
```

Behavior:
- On each category vote, store the nominee ID for that category
- Mark the category complete in local state
- After all 4 categories are selected, advance to phone capture
- Do not send partial submissions

## 3. Phone Capture Step

Recommended implementation: add a final swiper step after Category 04.

Why this is the better fit:
- It keeps the flow in one linear experience
- It avoids a separate overlay lifecycle and z-index complexity
- It matches the existing swipe-first interaction model

Behavior:
- Show phone entry only after all 4 categories are complete
- Strip `+91` or a leading `0` before validation
- Validate client-side with `/^[6-9]\d{9}$/`
- Disable the submit CTA until the phone is valid

## 4. Submission and Feedback

States:

| State | Behavior |
|---|---|
| Loading | Disable submit, show spinner, prevent double submit |
| Success | Show thank-you screen with a summary of selections |
| Duplicate | Show a friendly already-voted message |
| Network error | Keep selections and allow retry |

Recommended duplicate behavior:
- Show a generic "You have already voted" message
- Do not try to reveal previous picks in this phase

## 5. Live Vote Display

Not part of the core phase.

If added later:
- Poll the `doGet` endpoint every 30 seconds
- Show vote share percentages per nominee per category
- Keep the endpoint read-only and aggregated only

## 6. Existing Repo Notes

Important current-state note:
- `voting-data-augment.js` expands the nominee set for carousel testing
- That file should be removed or disabled for production voting

The current voting swiper also uses in-memory state only, so the backend integration will require new submit and status handling inside `voting-swiper.js`.

## 7. Static Asset Hosting Trial (GitHub Pages vs Cloudflare Pages)

CMS accepts HTML only. CSS and JS will be hosted externally and referenced via absolute URLs.

### Why this is needed

The CMS cannot serve separate `.css` or `.js` files with correct MIME types. Hosting assets on a CDN-backed static host solves this without restructuring the CMS HTML.

### Trial plan

**Step 1 — Set up GitHub Pages**
- Create a new public repo (e.g. `cinesammana-assets`)
- Push all static files: `styles.css`, `data.js`, `app.js`, `voting-swiper.js`, `voting-data-augment.js`, images, SVGs
- Enable GitHub Pages from the `main` branch root
- Confirm assets are reachable at `https://<user>.github.io/cinesammana-assets/styles.css`

**Step 2 — Update the CMS HTML**
- Replace all relative references in the HTML with absolute GitHub Pages URLs
- Test the voting page loads and behaves correctly end to end

**Step 3 — Rate limit smoke test**
- Run a burst test against the asset URLs using curl:
  ```bash
  for i in {1..200}; do curl -s -o /dev/null -w "%{http_code}\n" \
    https://<user>.github.io/cinesammana-assets/voting-swiper.js & done
  ```
- Watch for any `429` responses or response time degradation
- If all 200 return `200` cleanly, GitHub Pages is sufficient

**Step 4 — If GitHub Pages shows strain, switch to Cloudflare Pages**
- Create a Cloudflare Pages project, connect the same repo
- Cloudflare deploys from the same files — no code changes needed
- Asset URLs change to `https://cinesammana-assets.pages.dev/...`
- Update the CMS HTML references and retest

### Decision criteria

| Result | Action |
|---|---|
| No `429`s, fast responses | Stay on GitHub Pages |
| Occasional `429`s or slow tail | Move to Cloudflare Pages |
| Consistent failures | Investigate repo config, then move to Cloudflare |

### Expected outcome

At 30k votes over a few days, peak load is well under GitHub Pages limits. Cloudflare Pages is the fallback if any issues appear during the smoke test.

---

## Acceptance Criteria

The plan is complete when:
- A user can vote in all 4 categories in sequence
- The phone step appears only after all 4 selections are made
- The final submit writes one row to the sheet
- Duplicate phone submissions are rejected
- The UI handles loading, success, duplicate, and retry states

## Open Questions

1. Do we keep the phone step as a final swiper slide, or switch to a modal overlay?
2. Should duplicate submissions show only a generic message, or a more detailed explanation?
3. Is live vote display intentionally deferred to a later phase?

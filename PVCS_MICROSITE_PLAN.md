# PVCS Microsite Plan

Created: 2026-05-07
Last updated: 2026-05-08

## Status Snapshot

Implemented:

- Review-only stage switch inside the hamburger menu
- Shared microsite shell with stage-aware home hero
- Pre-vote hero, sponsor band, photo gallery, and video gallery sections
- During-vote voting flow with 4 categories, 2-column nominee grid, previous/next navigation, click-to-vote, auto-advance, and final submission screen
- Voting stats gating and vote-share-only rendering
- Post-vote winners destination wiring and winners pages
- Stage-aware desktop header nav, mobile bottom nav, and hamburger menu model
- Dedicated `Photos` and `Videos` routes backed by the existing gallery and reel sections
- Gallery lightbox for desktop and mobile photo cards
- Embedded YouTube Shorts reels in the video gallery

Partial or still to refine:

- During-vote home messaging still uses countdown language in some places
- Nomination page still renders as a full route shell rather than a compact floating widget
- Exact stage date boundaries are still unresolved
- ILU meaning is still not documented in the plan

## Purpose

Define the content and navigation plan for the PVCS microsite across three stages:

1. Pre Vote
2. During Vote
3. Post Vote

The intent is to keep one shared microsite shell and change the first-fold message, calls to action, and supporting content based on the active stage.

## Planning Principles

- Keep the home experience stage-aware rather than building three unrelated sites.
- Preserve one consistent brand header and navigation model across all stages.
- Let the hero area and primary CTA change by stage.
- Keep sponsor visibility high, especially on desktop.
- Use auto-scrolling media only where it helps discovery, not everywhere.
- Treat stage switching as a manually controlled state for now.

## Stage Summary

| Stage | Primary goal | Primary CTA | Content emphasis |
|---|---|---|---|
| Pre Vote | Build awareness and anticipation | Count down to vote start | Hero, sponsors, galleries |
| During Vote | Drive voting completion | Vote now | Voting flow, eligibility, reminders |
| Post Vote | Close the loop and celebrate outcomes | View results / recap | Winners, highlights, archives |

### Stage Controller

Keep the active stage switcher inside the hamburger menu for review and testing.

Behavior:

- Available under a separate `Review` section in the menu.
- Lets the team trigger `Pre Vote`, `During Vote`, and `Post Vote`.
- Should not be part of the public-facing navigation.
- Exists only for manual stage control until automation is defined.

## 1. Pre Vote

Status: implemented in the microsite shell.

### Home Page Structure

The pre-vote home page should be the main landing experience.

Recommended order:

1. Brand header
2. Trophy / hero visual
3. Heading and description with countdown messaging
4. Voting info block showing the start date
5. ILU section with main logo and sponsors
6. Sponsor band, if available, in the first fold on desktop
7. Photo gallery
8. Video gallery in reel format

### Pre Vote Messaging

- Focus on anticipation, credibility, and event awareness.
- Use the countdown as the main utility element in the hero.
- Make the voting start date explicit.
- Keep the language promotional rather than transactional.

### Navigation For Pre Vote

Desktop:

- Show `6` visible header items plus the hamburger menu.
- Do not show bottom nav.
- Visible header items:
  - `Home`
  - `Contests`
  - `Photos`
  - `Videos`
  - `Process`
  - `About Us`

Mobile:

- Show `Home + 3 items + Menu` in the bottom nav.
- Bottom nav items:
  - `Home`
  - `Contests`
  - `Photos`
  - `Videos`
  - `Menu`

Hamburger menu:

- The menu is always a superset of the visible nav.
- Pre-vote menu items:
  - `Home`
  - `Contests`
  - `Photos`
  - `Videos`
  - `Process`
  - `About Us`
  - `Jury`
  - `Cine Corner`
  - `Previous Editions`
  - `Terms and Conditions`

### Desktop First Fold Rule

If sponsor assets are available, the sponsor band should be visible in the first fold on desktop without pushing the hero below the fold too aggressively.

## 2. During Vote

Status: core voting flow implemented; some home-page messaging and nomination behavior still need refinement.

### Home Page Structure

The during-vote experience should pivot the microsite into a voting-first state while keeping the home page visually consistent.

Recommended order:

1. Brand header
2. Voting status hero
3. Trophy visual
4. Heading and description
5. Voting button and nominations button
6. Sponsor band
7. Photo gallery
8. Video gallery
9. Process and terms access

### During Vote Page Model

The second stage should be split into three functional areas:

1. Home
2. Voting Page
3. Nomination Page
4. Voting Stats

The home page remains the same shell, but the stage-specific CTAs route into the voting and nomination experiences.

### During Vote Messaging

- Make the active voting status obvious immediately.
- Replace countdown language with live action language.
- Keep the home page focused on two actions: voting and nominations.
- Reduce distraction from non-voting content.
- Keep supporting content accessible, but not dominant.

### During Vote Navigation

- Keep the desktop rule as `6 visible items + hamburger menu`.
- Keep the mobile rule as `Home + 3 items + Menu`.
- Make the voting destination the most prominent visible action.

Desktop visible items:

- `Home`
- `Vote Now`
- `Contests`
- `Photos`
- `Videos`
- `Process`

Mobile bottom nav:

- `Home`
- `Vote Now`
- `Contests`
- `Process`
- `Menu`

Hamburger menu:

- The menu remains a superset of the visible nav.
- During-vote menu items:
  - `Home`
  - `Vote Now`
  - `Contests`
  - `Photos`
  - `Videos`
  - `Process`
  - `About Us`
  - `Jury`
  - `Cine Corner`
  - `Previous Editions`
  - `Terms and Conditions`

### Behavioral Notes

- The voting flow should be one clear path from home to vote completion.
- The voting page should not use swipe or other complicated gestures.
- If voting is stage-gated, the home hero should state that clearly.
- If voting is open, avoid burying the vote CTA below galleries or sponsor content.

### Voting Page

The voting page should use a simple, linear card-based flow.

Layout rules:

- ILU and sponsor band stay at the top.
- Show 4 voting categories.
- Use 1 screen per vote category.
- Provide previous and next buttons for category navigation.
- Allow up to 8 nominees per category.
- Render nominee cards in a 2-column grid.
- Vote by clicking a card.
- Do not use swipe, drag, or other hidden gesture interactions.
- As soon as a user selects a nominee, advance to the next category screen.

Voting interaction rules:

- A selected card should clearly show the chosen state.
- The user should move category by category.
- The navigation buttons should control category movement, not voting selection.
- Users can go back and change votes.
- Users cannot advance without voting on the current screen.
- Keep the flow readable on both desktop and mobile.

Stepper rules:

- Use a full-page stepper on both mobile and desktop.
- `Previous` and `Next` buttons should move between category screens.
- If the current category is not voted, block forward progress.

### Final Submission Screen

After the 4 categories are completed, show a separate final screen before submit.

Fields:

- Name
- District, using a dropdown with Karnataka districts and `Others` at the top
- Mobile number

Rules:

- Collect the details at the end of the vote flow only.
- Keep this screen separate from the category voting screens.
- Add front-end validation only.
- Name must be at least 2 characters.
- Mobile must be an Indian mobile number.
- Submit the vote only after this screen is completed.

### Nomination Page

The nomination page should be a floating widget, not a separate heavy page shell.

Behavior:

- Open from a dropdown that lists all categories.
- After choosing a category, auto-scroll to that specific section.
- Keep the widget compact and easy to dismiss.
- Use it as a quick jump tool, not a second primary flow.

### Voting Stats

Stats should be hidden until 2 days before the event date.

Rules:

- Do not show stats earlier than 2 days before the event.
- Show vote share only, not raw vote counts.
- Limit stats to the public 4 voting categories only.
- Use a visual format such as a pie chart or a similar share-based graphic.
- Keep stats separate from the voting action itself so they do not distract from voting completion.

## 3. Post Vote

Status: winners destination and post-vote routing implemented; recirculation details still need polishing.

### Home Page Structure

The post-vote experience should feel like a recap and celebration, not a dead-end.

Recommended order:

1. Brand header
2. Results or thank-you hero
3. Winner highlight or recap message
4. Winner CTA instead of voting CTA
5. Photo gallery
6. Video gallery
7. Previous editions
8. About us
9. Jury
10. Cine corner
11. Terms and Conditions

### Post Vote Page Model

The post-vote page should shift from voting to winners.

Behavior:

- Show winners in place of voting screens.
- Keep the page structure familiar so users can still navigate without relearning the microsite.
- Use the winners page as the main destination after the event closes.
- Both the voting CTA and nominations CTA should lead to the winners page.
- The winners page should show all winners, not just the public voting categories.

### Post Vote Messaging

- Thank users for participating.
- Highlight the outcome or the story of the event.
- Point users toward archives, previous editions, and evergreen content.
- Keep the tone celebratory and editorial.

### Post Vote Navigation

- Keep the desktop rule as `6 visible items + hamburger menu`.
- Keep the mobile rule as `Home + 3 items + Menu`.
- Replace the voting action with `Winners`.
- Continue to suppress the desktop bottom nav.

Desktop visible items:

- `Home`
- `Winners`
- `Contests`
- `Photos`
- `Videos`
- `Process`

Mobile bottom nav:

- `Home`
- `Winners`
- `Photos`
- `Videos`
- `Menu`

Hamburger menu:

- The menu remains a superset of the visible nav.
- Post-vote menu items:
  - `Home`
  - `Winners`
  - `Contests`
  - `Photos`
  - `Videos`
  - `Process`
  - `About Us`
  - `Jury`
  - `Cine Corner`
  - `Previous Editions`
  - `Terms and Conditions`

## Shared Content Modules

These modules can be reused across stages:

- Brand header
- Trophy or hero visual
- Sponsor band
- Photo gallery
- Video gallery
- Process section
- About us
- Jury
- Cine corner
- Previous editions
- Terms and Conditions

## Shared Responsive Rules

- Mobile: show the stage-specific `Home + 3 items + Menu` bottom nav.
- Desktop: do not show bottom nav.
- Desktop header always shows `6` visible items plus the hamburger menu.
- The hamburger menu is always a superset of the visible nav for the active stage.
- Give the hero and first fold the most stage-specific treatment.
- Let galleries and sponsor bands remain consistent anchors across the experience.

## Content Priority Rules

1. The active stage message always wins over secondary content.
2. The vote CTA must always be easier to find than gallery or archive content during the voting stage.
3. Sponsor visibility should be high, but not at the expense of the main stage message.
4. Galleries should support the story, not compete with the hero.

## Open Questions

- What are the exact date boundaries for Pre Vote, During Vote, and Post Vote?
- What does ILU stand for in the microsite content?
- Is the sponsor band mandatory, or only shown when sponsor assets are available?
- Should the during-vote home page link directly into the voting flow or to a voting explainer first?
- Should the post-vote stage show winners, participation stats, or both?

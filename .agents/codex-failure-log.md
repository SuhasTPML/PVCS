# Codex Failure Log

Use this file to store short lessons from failed attempts that later had a working fix.
This includes code changes, shell commands, search/read patterns, replace/edit attempts, Git workflows, browser-testing steps, and other Codex operating mistakes.

## Entry Template
- Context: ...
- Command/workflow: ...
- Failed approach: ...
- Symptom: ...
- Working approach: ...
- Next-time rule: ...

## 2026-04-09 - Compact table placeholders in seat results
- Context: Stabilizing `seat-results-widget.html?compact=1` so party and alliance views keep the same internal table height.
- Command/workflow: Compact table placeholder rows in `renderTable()`.
- Failed approach: Added placeholder rows with `tr.style.visibility = 'hidden'`.
- Symptom: Alliance mode still rendered a much shorter table area than party mode, so the internal layout shifted even though the outer widget height stayed fixed.
- Working approach: Keep placeholder rows in the DOM with a `placeholder-row` class and hide them with `opacity: 0` plus `pointer-events: none` so they still reserve row height.
- Next-time rule: For layout-stabilizing placeholder table rows, do not hide the `<tr>` with `visibility: hidden`; use transparent rows that preserve normal table sizing.

## 2026-04-09 - Patch against exact live markup before editing
- Context: Removing the visible title and description from `map-widget.html`.
- Command/workflow: `apply_patch` against a UI markup block.
- Failed approach: Patched against an assumed controls block shape without re-reading the exact current HTML.
- Symptom: `apply_patch` failed because the expected lines did not match the file.
- Working approach: Read the exact surrounding HTML/CSS block first, then patch against the current text.
- Next-time rule: When editing UI markup that has already changed in prior iterations, inspect the exact current snippet before applying a structural patch.

## 2026-04-09 - Do not scale the whole key battles widget to fit 500px
- Context: Making `key-battles-widget.html` use the full iframe width on embedded LP pages.
- Command/workflow: Fixed-height widget fitting logic in `fitWidgetToViewport()`.
- Failed approach: Scaled `#widgetScaleRoot` down with `transform: scale(...)` whenever the natural height exceeded `500px`.
- Symptom: The iframe itself was full width, but the live card rail shrank to a visibly narrower width because the whole widget was being transformed.
- Working approach: Keep the viewport fixed at `500px`, remove the root scale transform, and tighten internal spacing so the layout fits naturally.
- Next-time rule: For fixed-height embeds, do not solve overflow by scaling the full widget root; reduce internal spacing or restructure the layout so the content keeps its true width.

## 2026-04-09 - Rename wrapper selectors safely when UI spacing classes change
- Context: `key-battles-widget.html` got stuck on the loader after the search wrapper spacing class was changed.
- Command/workflow: Loader hide/show logic for the search shell.
- Failed approach: Continued using `searchEl.closest('.mb-5')` after the wrapper class was changed to `mb-3`.
- Symptom: The script threw `Cannot read properties of null (reading 'style')` during startup, so `widget-loading` was never cleared and the page stayed on the loader.
- Working approach: Give the wrapper a stable `id` (`search-shell`) and reference it directly with a null-safe check.
- Next-time rule: Do not couple JS behavior to utility spacing classes; use stable IDs or data attributes for elements the script needs to show or hide.

## 2026-04-10 - Verify web app endpoints with elevated curl and quoted URLs
- Context: Checking whether an Apps Script deployment supported the new `multiValues` action.
- Command/workflow: Network verification with `curl.exe` from PowerShell.
- Failed approach: Ran `curl` inside the sandbox and also passed URLs containing `&` without robust command quoting.
- Symptom: Requests either failed at the network layer or produced misleading empty/sign-in responses, making it unclear whether the deployment was actually serving the new code.
- Working approach: Run `curl.exe` with elevated permissions and pass the full URL as a single quoted `--url` argument.
- Next-time rule: For external endpoint verification in this repo, use elevated `curl.exe` and quote the entire URL explicitly so query params are not reinterpreted by PowerShell.

## 2026-04-13 - Use the exact workspace root in `apply_patch` targets
- Context: Cleaning up non-legacy source paths after switching the widgets to CloudFront-only mode.
- Command/workflow: Manual file edits with `apply_patch`.
- Failed approach: Used an absolute path that omitted the `Claude\Experiments` segment of the workspace root.
- Symptom: `apply_patch` failed with a file-not-found error even though the file existed in the repo.
- Working approach: Re-run `apply_patch` with the full absolute path under `C:\Users\suhas.bhandari\Downloads\Claude\Experiments\CMS Widgets\Elections`.
- Next-time rule: When patching by absolute path in this repo, copy the full `cwd` prefix exactly from the environment context before editing.

## 2026-04-14 - Use the real Python interpreter for detached local hosting
- Context: Starting the repo-root HTTP server for browser QA.
- Command/workflow: Detached local hosting with `Start-Process`.
- Failed approach: Launched `Start-Process` with `C:\Users\suhas.bhandari\.local\bin\py.cmd` and `-3 -m http.server ...`.
- Symptom: `Start-Process` returned a PID, but the process exited immediately and Playwright hit `ERR_CONNECTION_REFUSED`.
- Working approach: Launch `Start-Process` with `C:\Users\suhas.bhandari\AppData\Local\Programs\Python\Python312\python.exe -m http.server 8000 --bind 127.0.0.1`.
- Next-time rule: For detached local servers in this repo, do not use `py.cmd` as a launcher; use the real Python executable with escalated permissions.

## 2026-04-14 - Do not chain git commands with `&&` in this PowerShell environment
- Context: Staging and committing repo changes from the Codex shell.
- Command/workflow: Git staging and commit commands in PowerShell.
- Failed approach: Ran combined commands like `git add ... && git commit -m ...`.
- Symptom: PowerShell rejected `&&` with `The token '&&' is not a valid statement separator in this version.`
- Working approach: Run git commands as separate shell invocations.
- Next-time rule: In this repo's PowerShell environment, do not chain commands with `&&`; execute sequential git commands separately.

## 2026-04-14 - Do not call `parseNumber` before its declaration in `map-widget.html`
- Context: Adding default auto-refresh wiring near the top-level query-param constants in `map-widget.html`.
- Command/workflow: Manual refresh-config edit with `apply_patch`.
- Failed approach: Computed `REFRESH_MS` with `parseNumber(...)` before the helper was defined later in the file.
- Symptom: The widget stayed on the loader with `ReferenceError: parseNumber is not defined`.
- Working approach: Use `Number(...)` directly in the early `REFRESH_MS` initializer.
- Next-time rule: In `map-widget.html`, top-level constants declared before helper functions must not rely on later function declarations.

## 2026-04-14 - Avoid the WindowsApps `python.exe` alias for local generation tasks
- Context: Regenerating `graphify-corpus/graphify-out/*` before committing widget tab-name changes.
- Command/workflow: Inline Python generation from PowerShell.
- Failed approach: Piped the script into `python -`, which resolved to `C:\Users\suhas.bhandari\AppData\Local\Microsoft\WindowsApps\python.exe`.
- Symptom: The shell failed with `Program 'python.exe' failed to run: The file cannot be accessed by the system`.
- Working approach: Run the script with `C:\Users\suhas.bhandari\AppData\Local\Programs\Python\Python312\python.exe -`.
- Next-time rule: In this repo, do not rely on the WindowsApps `python.exe` shim for local generation tasks; use the real Python 3.12 executable path.

## 2026-04-14 - Re-read the exact export-style block before patching lead-seat visuals
- Context: Removing the extra outline from leading seats in `seat-results-widget.html`.
- Command/workflow: Manual `apply_patch` edit spanning both live chart styling and the share/export clone CSS.
- Failed approach: Patched against an assumed lead-seat CSS block that no longer matched the current export-style text.
- Symptom: `apply_patch` failed with an expected-lines mismatch.
- Working approach: Read the exact surrounding lines for the clone CSS and seat render block, then patch against the current text.
- Next-time rule: When a visual treatment is implemented in both live rendering and export CSS, inspect both current blocks before applying a multi-hunk patch.

## 2026-04-20 - Re-read drifted graph corpus embed snippet before patching
- Context: Syncing the graph corpus copy of `home-special-events-seat-compact.html` with the root embed change.
- Command/workflow: `apply_patch` against `graphify-corpus/iframe embeds/home-special-events-seat-compact.html`.
- Failed approach: Reused the root-file patch context without re-reading the corpus copy.
- Symptom: `apply_patch` failed because the corpus file still pointed at `state=TAMIL_NADU` and had a different iframe line.
- Working approach: Re-read the exact corpus snippet, then patch against the current text.
- Next-time rule: When mirroring a change into graph-corpus copies, do not assume the snapshot matches the root file; inspect the corpus file first.

## 2026-04-20 - Compute widget height dynamically, not once at load
- Context: Adding a desktop 410px cap with a mobile 500px cap in `seat-results-widget.html`.
- Command/workflow: Desktop height cap and `fitWidgetToViewport()` scaling logic.
- Failed approach: Cached the embed max height in a top-level constant from `getComputedStyle(...)` during initial load.
- Symptom: The iframe could stay stuck at the old 500px inline height after resizing to desktop because the cached value did not update.
- Working approach: Read the current breakpoint in a helper (`window.matchMedia('(min-width: 768px)')`) each time `fitWidgetToViewport()` runs.
- Next-time rule: For responsive iframe sizing, compute breakpoint-dependent heights at render/resize time instead of caching them once at startup.

## 2026-04-24 - Use elevated git staging when index lock permission fails
- Context: Committing the state-tab persistence change in the election widgets.
- Command/workflow: `git add` for the modified widget files.
- Failed approach: Ran staging inside the sandbox without escalation.
- Symptom: `fatal: Unable to create .../.git/index.lock: Permission denied`.
- Working approach: Retry the git write operation with elevated permissions.
- Next-time rule: If `git add` or similar repo-write commands fail on `.git/index.lock`, rerun them with escalated permissions before changing strategy.

## 2026-04-24 - Use elevated git branch creation when ref lock permission fails
- Context: Starting a new branch for Assam pre-2023 SVG mapping work.
- Command/workflow: `git switch -c assam-pre2023-svg`.
- Failed approach: Created the branch inside the sandbox without escalation.
- Symptom: `Unable to create .../.git/refs/heads/...lock: Permission denied`.
- Working approach: Retry the branch-creation command with elevated permissions.
- Next-time rule: If branch creation or ref updates fail with a lock permission error, rerun the git command with escalation before trying a different branch name or workflow.

## 2026-04-24 - Graphify update does not rebuild this HTML widget corpus
- Context: Refreshing graph snapshots after changing `map-widget.html` Assam geometry behavior.
- Command/workflow: `graphify update graphify-corpus`.
- Failed approach: Tried to use the local graphify CLI update path as if it would rebuild the widget corpus from the mirrored HTML files.
- Symptom: The CLI reported `No code files found - nothing to rebuild`, so the graph snapshot did not refresh.
- Working approach: Use `scripts/sync_graphify_corpus.py` to mirror the root widget files into `graphify-corpus/` first; do not rely on `graphify update` for this repo's HTML widget snapshot.
- Next-time rule: For widget behavior changes in this repo, sync the corpus with `scripts/sync_graphify_corpus.py` and expect `graphify update` to skip HTML-only widget files.

## 2026-04-28 - Move binary map assets with filesystem commands
- Context: Consolidating unused geometry files into one folder under `root/`.
- Command/workflow: `apply_patch` move attempt for `*.geojson` assets.
- Failed approach: Tried to move the geometry files with a multi-file patch hunk.
- Symptom: `apply_patch` rejected the hunk as empty for the source file and did not move the assets.
- Working approach: Create the destination folder, then use `Move-Item -LiteralPath ... -Destination ...` for the asset files.
- Next-time rule: For bulk asset moves in this repo, use filesystem moves instead of `apply_patch` when the files are not being edited.

## 2026-04-29 - Patch encoded JS data against exact file header
- Context: Adding voting categories to `data.js` for the voting carousel.
- Command/workflow: `apply_patch` insertion at the top of `data.js`.
- Failed approach: Patched against an assumed plain-text file header without re-reading the exact current bytes/encoding.
- Symptom: `apply_patch` could not match the expected opening lines and failed the edit.
- Working approach: Re-read the first lines from the live file and patch against the exact current `window.CINE_SITE_DATA = {` anchor.
- Next-time rule: When a file has encoding noise or copied text, always patch against the exact current opening lines instead of assuming the header text.

## 2026-04-29 - Re-read the live gesture block before patching swipe behavior
- Context: Fixing the voting carousel swipe/settle interaction in `app.js`.
- Command/workflow: `apply_patch` on the pointer-drag settlement block.
- Failed approach: Reused an older context snippet for the drag handler after the file had already changed.
- Symptom: `apply_patch` failed to find the expected `pointermove` / `settleDrag` lines.
- Working approach: Re-read the live `initVoting()` section and patch against the exact current gesture block.
- Next-time rule: For interaction fixes in a file that has already been edited, always re-open the live block immediately before patching.

## 2026-04-29 - Use a separate augment script when a large data file is awkward to patch
- Context: Expanding the voting categories from 3 nominees to 12 nominees each.
- Command/workflow: Data expansion for `data.js` plus page script loading.
- Failed approach: Tried to append a large expansion block directly to `data.js` after the fact.
- Symptom: The patch context would not match the encoded/live tail of the file, so the edit kept failing.
- Working approach: Leave `data.js` alone and add a dedicated `voting-data-augment.js` loader, then include it on the voting pages before the render scripts.
- Next-time rule: For bulky dummy-data growth in an already messy file, prefer a small augment script over forcing a brittle patch into the original source.

## 2026-04-29 - Add GitHub remotes with elevated config writes
- Context: Connecting the repo to `https://github.com/SuhasTPML/PVCS.git` before pushing voting changes.
- Command/workflow: `git remote add origin ...`
- Failed approach: Ran the remote add once without escalation.
- Symptom: Git could not lock `.git/config` and returned `Permission denied`.
- Working approach: Retry `git remote add` with elevated permissions.
- Next-time rule: When setting or changing a remote in this workspace, expect `.git/config` writes to require escalation.

## 2026-04-29 - Patch voting swiper against live blocks
- Context: Adding lock/unlock behavior so a voted carousel only swipes after `Change vote`.
- Command/workflow: `apply_patch` against `voting-swiper.js` and `styles.css`.
- Failed approach: Patched against stale snippets after the file had already been edited several times.
- Symptom: `apply_patch` could not find the expected click-handler and state-init context.
- Working approach: Re-read the live line ranges, then patch smaller hunks around the exact current blocks.
- Next-time rule: For iterative UI edits, always reopen the live function block before patching and prefer smaller hunks over one large patch.

## 2026-04-29 - Use PowerShell-safe quoting with `rg` patterns and globs
- Context: Debugging why `Change vote` was not shown on the voting swiper card after selection.
- Command/workflow: `rg` searches across `*.html` and `voting-*.js`.
- Failed approach: Used a double-quoted regex with escaped quotes and passed `voting-*.js` directly as a path argument.
- Symptom: `rg` failed with regex parse errors and Windows path syntax errors.
- Working approach: Use single-quoted regex patterns and pass explicit files or `-g '*.html'` with `.` as the search root.
- Next-time rule: In this PowerShell workspace, prefer `rg --line-number -g '*.ext' 'pattern' .` and avoid wildcard path arguments like `file-*.js`.

## 2026-04-29 - Use escalation for git writes and push in this workspace
- Context: Staging, committing, and pushing voting swiper frontend updates.
- Command/workflow: `git add`, `git commit -m`, `git push origin master`.

## 2026-05-07 - Resolve skill paths from the user profile, not the repo root
- Context: Reading the UI/UX skill instructions before editing the PVCS microsite.
- Command/workflow: `Get-Content` against `.codex/skills/.system/ui-ux-pro-max/SKILL.md`.
- Failed approach: Looked for the skill file relative to the workspace and under a shortened home path.
- Symptom: PowerShell returned `cannot find path` errors for both guesses.
- Working approach: Read the skill from `C:\Users\suhas.bhandari\.codex\skills\.system\ui-ux-pro-max\SKILL.md`.
- Next-time rule: When a skill lives outside the repo, resolve it from the user profile path shown in the skills list, not from the workspace root.

## 2026-05-07 - Rewrite drifted HTML shells when the live block no longer matches
- Context: Swapping the static home shell in `index.html` for stage-aware render targets.
- Command/workflow: `apply_patch` against the existing home section.
- Failed approach: Patched the old home markup in place after the file had already drifted and the text was mojibake-heavy.
- Symptom: `apply_patch` could not find the expected block even though the section looked similar in the terminal.
- Working approach: Replace the whole file content with a clean shell rewrite so the route placeholders are exact.
- Next-time rule: For HTML shells with encoded or heavily drifted markup, prefer a full-file rewrite over a large in-place patch.

## 2026-05-07 - Capture detached local server logs on a fresh port
- Context: Smoke-testing the rewritten microsite in a local browser.
- Command/workflow: Detached `Start-Process` server launch.
- Failed approach: Started the server without redirected output and then assumed the first port was usable.
- Symptom: The browser harness hit `ERR_CONNECTION_REFUSED`, so it was unclear whether the server had started or exited immediately.
- Working approach: Relaunch on a fresh port with redirected stdout/stderr and confirm the process stays running before testing.
- Next-time rule: When a detached local host is flaky, use a fresh port plus redirected logs to prove it is actually alive before browser testing.
- Failed approach: Ran git write/network commands in sandbox mode first.
- Symptom: `.git/index.lock` permission errors on add/commit and GitHub connection failure on push.
- Working approach: Retry git write and push commands with escalated permissions.
- Next-time rule: If git add/commit hits lock permission or push cannot connect in sandbox, rerun with escalation immediately.

## 2026-04-29 - Keep PowerShell quoting simple in `rg` checks
- Context: Verifying Kannada content updates in `data.js` and voting HTML files.
- Command/workflow: `rg --line-number ...` validation command in PowerShell.
- Failed approach: Used complex double-quoted patterns with embedded escaped quotes and alternation.
- Symptom: PowerShell/rg parsing failed with unterminated string and invalid path/regex errors.
- Working approach: Run smaller `rg` checks with simple patterns or quote the whole regex in single quotes.
- Next-time rule: In this workspace, prefer multiple simple `rg` commands over one complex quoted pattern in PowerShell.

## 2026-04-29 - Confirm git push status after timeout if output shows remote update
- Context: Pushing voting updates to `origin/master`.
- Command/workflow: `git push origin master` with escalated permissions.
- Failed approach: Treated a command timeout as a definite push failure.
- Symptom: Shell returned timeout code, but output already showed `master -> master`.
- Working approach: Verify with `git rev-parse HEAD` vs `git rev-parse origin/master` after timeout.
- Next-time rule: If `git push` times out but prints a successful ref update, validate refs before retrying.

## 2026-04-30 - Use escalated curl for external GitHub Pages stress checks
- Context: Stress testing hosted `styles.css` and `voting-swiper.js` on `https://suhastpml.github.io/PVCS/`.
- Command/workflow: External asset checks with `curl.exe` from this workspace.
- Failed approach: Ran the first request inside the sandbox without escalation.
- Symptom: Curl returned HTTP `000` and non-zero exit code.
- Working approach: Rerun with escalated permissions and keep using `curl.exe` for timed/status metrics.
- Next-time rule: For real external endpoint/load checks in this repo, switch to escalated `curl.exe` immediately after a sandbox HTTP `000` result.

## 2026-04-30 - Replace encoded markdown blocks with regex when patch context is unstable
- Context: Updating the stress-test section in `VOTING_PLAN.md`.
- Command/workflow: `apply_patch` against section headings containing mojibake punctuation (`â€”`).
- Failed approach: Patched the whole block using expected-line matching against manually copied text.
- Symptom: `apply_patch` failed to find expected lines even though the visible content looked correct.
- Working approach: Use a targeted PowerShell raw-string regex replacement for the full section, then run a small cleanup patch for formatting.
- Next-time rule: If markdown contains encoding-noise characters and a large hunk fails to match, replace the section via raw regex and verify line-by-line after.

## 2026-04-30 - Use HEAD mode for 1000-parallel curl asset checks
- Context: Running a 1000-concurrency burst against GitHub Pages asset URLs.
- Command/workflow: `curl.exe --parallel --parallel-max 1000` with per-transfer output + write-out metrics.
- Failed approach: Used `GET` transfers with output sinks (`NUL` and temp files) at extreme parallelism.
- Symptom: Curl returned many `curl: (23) client returned ERROR on write ...` messages and non-zero exit code even though parsed HTTP codes were `200`.
- Working approach: Run the high-concurrency burst with `--head` and parse `--write-out` lines for status/timing, which removed local write bottlenecks and returned exit code `0`.
- Next-time rule: For extreme parallel stress checks where only status/timing are needed, prefer `HEAD` requests over `GET` body downloads to avoid client-side write errors.

## 2026-04-30 - Avoid PowerShell text rewrites on UTF-8 HTML in Windows PowerShell 5.1
- Context: Updating HTML asset URLs to hosted GitHub Pages links.
- Command/workflow: Bulk multi-file HTML replacement using `Get-Content`/`Set-Content` in PowerShell 5.1.
- Failed approach: Read and rewrote UTF-8 HTML files with non-ASCII Kannada content using default text encoding behavior.
- Symptom: Kannada text became mojibake (`à²...`) and BOM/format noise appeared in diffs.
- Working approach: Recover text by reversing CP1252/UTF-8 mojibake conversion, then use encoding-safe write and verify only targeted URL lines changed.
- Next-time rule: For UTF-8 files with non-ASCII content in this environment, avoid default PowerShell text I/O; use encoding-explicit workflows and verify language text after bulk replacements.

## 2026-04-30 - Use regex replacements when `apply_patch` misses encoded HTML context
- Context: Updating specific home/voting `href` links in `index.html`.
- Command/workflow: `apply_patch` against anchor lines containing non-ASCII text in attributes/content.
- Failed approach: Patched full anchor lines with exact expected-text matching.
- Symptom: `apply_patch` failed to find expected lines despite visually correct targets.
- Working approach: Run narrow regex-based replacements on stable ASCII attribute prefixes (class + href), then verify with `rg`.
- Next-time rule: When an HTML line includes encoding-sensitive text, patch using stable attribute-token replacements instead of full-line matching.

## 2026-04-30 - Use `rg -g` instead of shell globs in PowerShell file filters
- Context: Verifying remaining voting-page references across HTML and JS files during swiper-only cleanup.
- Command/workflow: `rg` searches scoped to `*.html` and `*.js` in Windows PowerShell.
- Failed approach: Passed `*.html` and `*.js` as direct path arguments to `rg`.
- Symptom: `rg` failed with Windows path syntax errors like `The filename, directory name, or volume label syntax is incorrect. (os error 123)`.
- Working approach: Use `rg -g '*.html' -g '*.js' 'pattern' .` so ripgrep handles the file filtering itself.
- Next-time rule: In this PowerShell workspace, do not pass shell-style globs as path arguments to `rg`; use `-g` filters with `.` as the search root.

## 2026-04-30 - Do not repurpose `data-page` markers that scoped CSS depends on
- Context: Converting the repo to keep only the swiper voting experience while leaving the live route at `/PVCS/voting`.
- Command/workflow: Swiper-route cleanup across `voting-swiper.html`, `app.js`, and shared navigation state.
- Failed approach: Changed `voting-swiper.html` from `data-page="voting-swiper"` to `data-page="voting"` to match the live route name.
- Symptom: The live page loaded but most swiper-specific layout/styles disappeared because large sections of `styles.css` were scoped to `body[data-page="voting-swiper"]`.
- Working approach: Keep the live route as `/PVCS/voting`, restore `data-page="voting-swiper"` for the page-scoped CSS, and make shared app logic treat both `voting` and `voting-swiper` as the active vote page.
- Next-time rule: Before renaming a page-state marker like `data-page`, search CSS and JS for selectors that depend on it; keep the marker stable unless all scoped selectors are migrated together.

## 2026-04-30 - Do not rely on bubbled `click` alone for Swiper card actions on mobile
- Context: Making the `Vote Now` CTA work reliably inside the swiper-based mobile voting cards.
- Command/workflow: In-card vote action handling in `voting-swiper.js`.
- Failed approach: Relied on a delegated `click` handler alone after relaxing Swiper click-prevention settings.
- Symptom: Horizontal swipe still worked on mobile, but tapping `Vote Now` could do nothing because touch interaction suppressed the synthetic click.
- Working approach: Handle `pointerup` for touch/pen targets in capture phase, route it through the same vote-action handler, and keep a short duplicate-action guard so the later `click` does not double-submit.
- Next-time rule: For CTA buttons embedded inside swipeable mobile surfaces, do not trust bubbled `click` alone; add a touch-safe `pointerup` path with deduping.

## 2026-04-30 - Check mobile hit geometry before assuming a tap-handler bug
- Context: Investigating why `Vote Now` on the swiper cards still failed on mobile after adding touch-safe event handling.
- Command/workflow: Browser debugging of the live `/PVCS/voting` route with Playwright geometry and hit-testing checks.
- Failed approach: Focused first on event-handler logic (`click` / `pointerup`) without verifying whether the visible CTA was actually inside the tappable viewport.
- Symptom: The code paths looked correct, but users still could not activate the card CTA on mobile.
- Working approach: Measure the button and bottom-nav rectangles and use `elementFromPoint(...)` on the button area; this showed the CTA was mostly below the viewport and the only visible sliver was inside the fixed bottom-nav zone.
- Next-time rule: For mobile tap bugs in transformed/swipe layouts, inspect live element geometry and hit-testing first; a layout/overlay collision can fully explain a “tap does nothing” report even when event handlers are wired correctly.
## 2026-05-07 - PowerShell command separator
- Context: Committing tracked changes in this repo.
- Command/workflow: `git add -u && git commit -m "Update PVCS microsite interactions"`
- Failed approach: Used `&&` in PowerShell.
- Symptom: PowerShell parser rejected `&&` as an invalid statement separator.
- Working approach: Use `;` between commands in PowerShell.
- Next-time rule: Prefer PowerShell-native separators and avoid shell syntax copied from bash.

## 2026-05-07 - Git metadata write blocked
- Context: Creating a commit in this workspace.
- Command/workflow: `git add -u; git commit -m "Update PVCS microsite interactions"`
- Failed approach: Ran git commit in the sandbox without escalation.
- Symptom: Git could not create `.git/index.lock` and returned `Permission denied`.
- Working approach: Reran the commit with escalated permissions.
- Next-time rule: If git needs to write metadata under `.git`, expect sandbox approval may be required.

## 2026-05-07 - GitHub push auth
- Context: Pushing the local commit to `origin/master`.
- Command/workflow: `git push origin master`
- Failed approach: Relied on the existing HTTPS credential helper.
- Symptom: Push failed because the credential prompt had no TTY and stored GitHub tokens were invalid.
- Working approach: Check `gh auth status` first and refresh GitHub auth before retrying the push.
- Next-time rule: Verify GitHub CLI/auth state before attempting a push in this environment.

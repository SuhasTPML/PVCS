# AGENTS.md

## Codex Failure Memory

Use this rule to avoid repeating the same failed approach across future Codex runs, including both codebase-specific mistakes and Codex workflow mistakes.

### When to log

- If a Codex command, patch, workflow, search pattern, file-reading method, replace/edit attempt, tooling choice, or assumption fails and a different approach is later used successfully, record it.
- Log only reusable lessons, not one-off typos or trivial retries.

### Where to log

- Append the note to `.agents/codex-failure-log.md`.

### What to log

Keep each entry short and actionable:

- date
- task context
- command or workflow context
- failed approach
- failure symptom or error
- working approach
- rule to follow next time

Examples of things worth logging:

- a shell command pattern that failed in this environment
- a `rg` or search pattern that was misleading or too broad
- an `apply_patch` approach that was fragile
- a file replacement/edit pattern that caused unnecessary churn
- a browser-testing or local-hosting step that failed
- a Git workflow mistake that should be avoided next time

### Entry format

Use this template:

```md
## YYYY-MM-DD - Short title
- Context: ...
- Command/workflow: ...
- Failed approach: ...
- Symptom: ...
- Working approach: ...
- Next-time rule: ...
```

### Current expectation

- Before finishing a task that required recovering from a failed attempt, update `.agents/codex-failure-log.md`.
- Before retrying a similar workflow, scan `.agents/codex-failure-log.md` for relevant past failures.


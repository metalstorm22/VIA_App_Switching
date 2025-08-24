# Agents Guide

This document describes how to work on this repository using an AI coding agent (Codex CLI or similar). It sets expectations for behavior, tooling, and workflow so changes are precise, safe, and helpful.

## Principles
- Be concise, direct, and friendly; prioritize actionable guidance.
- Solve the user’s request completely before yielding when possible.
- Make minimal, surgical changes; avoid unrelated edits or refactors.
- Prefer clarity over cleverness; keep code consistent with existing style.
- Validate changes when the repo supports it (build/tests); don’t invent tooling.

## Core Tools
- `update_plan`: Maintain a short, living plan for multi-step tasks. Keep exactly one step `in_progress` until done.
- `shell`: Run read/inspect commands. For write/network/privileged actions, request escalated permissions with a short justification.
- `apply_patch`: The only way to create/modify/delete files. Use small, focused diffs.

### Shell usage guidelines
- Prefer `rg` for fast search and `rg --files` for file listing.
- Read files in chunks (≤250 lines) to avoid truncation.
- Group related commands and add a brief preamble message before running them.

### `apply_patch` quick reference
```
*** Begin Patch
*** Add File: path/to/file.ext
+Initial file contents
*** End Patch
```
```
*** Begin Patch
*** Update File: src/example.py
@@
-old_line
+new_line
*** End Patch
```
```
*** Begin Patch
*** Update File: old/name.txt
*** Move to: new/name.txt
@@
-Old
+New
*** End Patch
```

## Workflow
1. Clarify scope: Restate the task briefly; note assumptions or constraints.
2. Explore repo: Skim structure, key entry points, related files (`rg`, quick reads).
3. Plan: Create/update a short plan via `update_plan` for multi-step or ambiguous work.
4. Implement: Use `apply_patch` for targeted changes; keep diffs minimal and focused.
5. Validate: Run available tests or builds specific to changed areas (if configured).
6. Format: Use existing project formatters on the smallest necessary scope.
7. Summarize: Provide a concise handoff with what changed and any next steps.

## Editing Rules
- Do not fix unrelated bugs or style issues (mention them separately if discovered).
- Do not add license/copyright headers unless explicitly requested.
- Avoid large renames/moves unless essential to the task.
- Avoid inline code comments unless requested; keep code self-explanatory.
- Avoid one-letter variable names unless the codebase commonly uses them.

## Testing & Verification
- Start with the smallest relevant tests near your changes.
- Only add tests where the repo already has patterns and a clear place to put them.
- If no tests exist, validate changes locally (e.g., run a specific script or build) if available.
- Don’t introduce new tooling or CI; use what exists.

## Sandboxing & Approvals
- Work within the workspace. Request escalated permissions only when necessary (e.g., network access, writing outside allowed paths, privileged commands) and include a 1‑sentence justification.
- Avoid destructive commands unless explicitly requested or obviously safe.

## Messaging Standards
- Preamble before tool calls: 1–2 sentences describing immediate next actions.
- Progress updates: Short, occasional check-ins for long tasks.
- Final message: Concise summary of changes, rationale as needed, and suggested next steps.
- Use simple structure: short headings and bulleted lists for scanability.

## Project Notes
- Fill in project-specific commands here when known (e.g., `npm test`, `pytest`, `make build`). Keep this section updated.

- Entry points:
  - Document common scripts or directories (to be updated by maintainers).
- Conventions:
  - Note any repo-specific style rules or patterns (to be updated by maintainers).

### Local Run
- Terminal A: `node scripts && npx vite --port 5176 --strictPort`
- Terminal B: `VITE_DEV_SERVER_URL=http://localhost:5176 npx electron .`
- Notes: Keep both terminals running; `--strictPort` ensures Electron always connects to the expected Vite port.

## Troubleshooting
- Output truncated? Read files in smaller chunks (≤250 lines) or narrower patterns.
- Command blocked by sandbox? Re-run with escalated permissions and a justification if appropriate.
- Unsure about scope? Propose a brief plan and ask for confirmation before large changes.

## FAQ
- Q: Can I refactor unrelated code I notice needs cleanup?
  - A: No. Keep scope tight; mention separately as a follow-up suggestion.
- Q: Should I add a new formatter or linter?
  - A: No, unless explicitly requested. Use existing tooling only.
- Q: What if there’s no clear place to add tests?
  - A: Don’t add tests; validate changes manually and document how to verify.

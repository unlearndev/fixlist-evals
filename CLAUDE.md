# Fixlist

Repairs inbox for a lettings agency, with an AI triage feature (`src/triage/`) that calls Claude.

- Run TypeScript directly with Node 22.18+: `node scripts/<file>.ts`. Imports use `.ts` extensions, and only erasable TypeScript syntax (no enums).
- `npm test` runs the unit tests, `npm run typecheck` checks types, `npm run dev` serves the app.
- Use the triage feature through `triage()` in `src/triage/triage.ts`. Don't call the Anthropic API directly from elsewhere: the only other call is the evals' model grader, in `evals/judge.ts`.
- `data/` is seed data. Don't edit `data/triage-log.jsonl` or `data/properties.json`.

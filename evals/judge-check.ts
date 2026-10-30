// Does the model grader agree with you? Runs the code checks and the judge over the
// summaries you graded by hand, and compares.
//   npm run judge:check
import { readJsonl } from "../server/data.ts";
import type { Triage } from "../src/triage/schema.ts";
import { graders } from "./graders.ts";
import { JUDGE_MODEL, judge } from "./judge.ts";
import { cost } from "./prices.ts";
import { RUBRIC } from "./rubric.ts";
import type { Case } from "./types.ts";

type HumanGrade = { id: string; summary: string; pass: boolean; note?: string };

const cases = new Map(readJsonl<Case>("evals/dataset.jsonl").map((c) => [c.id, c]));
const human = readJsonl<HumanGrade>("evals/human-grades.jsonl").filter((g) => cases.has(g.id));
const codeChecks = graders.filter((g) => g.name === "contact_details" || g.name === "length");

console.log(`Judge check · ${JUDGE_MODEL} · ${RUBRIC.length} ${RUBRIC.length === 1 ? "question" : "questions"} · ${human.length} summaries you graded\n`);

const results = await Promise.all(
  human.map(async (h) => {
    const c = cases.get(h.id)!;
    const output: Triage = { ...c.expected, summary: h.summary };
    const code = codeChecks.map((g) => ({ id: g.label, ...g.grade(output, c.expected) })).filter((r) => !r.pass);
    const judgement = await judge(c.report, h.summary, RUBRIC);
    const failed = Object.entries(judgement.verdicts).filter(([, v]) => !v.pass);
    return { h, code, failed, judgement, pass: code.length === 0 && failed.length === 0 };
  }),
);

const agree = results.filter((r) => r.pass === r.h.pass);
console.log(`Agrees with you on ${agree.length} of ${results.length} (${Math.round((agree.length / results.length) * 100)}%)\n`);

const disagreements = results.filter((r) => r.pass !== r.h.pass);
if (disagreements.length) {
  console.log("Disagreements");
  for (const r of disagreements) {
    const why = r.h.pass
      ? r.code.length
        ? `${r.code[0].id}: ${r.code[0].detail}`
        : `${r.failed[0][0]}: ${r.failed[0][1].reason}`
      : `your note: ${r.h.note ?? "(none)"}`;
    console.log(`  ${r.h.id}  you: ${r.h.pass ? "pass" : "fail"}  graders: ${r.pass ? "pass" : "fail"}   ${why}`);
  }
  console.log("");
}

const fails = [
  ...RUBRIC.map((c) => `${c.id} ${results.filter((r) => r.failed.some(([id]) => id === c.id)).length}`),
  `code checks ${results.filter((r) => r.code.length).length}`,
];
console.log(`Fails by check: ${fails.join(" · ")}`);

const fresh = results.filter((r) => !r.judgement.cached);
const usage = fresh.reduce(
  (s, r) => ({ input_tokens: s.input_tokens + r.judgement.usage.input_tokens, output_tokens: s.output_tokens + r.judgement.usage.output_tokens }),
  { input_tokens: 0, output_tokens: 0 },
);
console.log(
  `${results.length} judge calls (${results.length - fresh.length} cached) · ${usage.input_tokens.toLocaleString("en-GB")} tokens in · ${usage.output_tokens.toLocaleString("en-GB")} out · $${cost(JUDGE_MODEL, usage).toFixed(2)}`,
);

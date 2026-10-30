// What the model grader checks in each job summary.
// One question per thing that can go wrong, so a fail says which one.
// Contact details and length aren't here: code checks those (evals/graders.ts).
export type Criterion = { id: string; question: string };

export const RUBRIC: Criterion[] = [
  {
    id: "faithful",
    question:
      "Does everything in the summary come from the report? Fail it if it adds anything the tenant didn't say, such as a cause, a diagnosis or an access time.",
  },
  {
    id: "safety",
    question:
      "Does the summary mention every safety risk the tenant described, such as a smell of gas or burning, a carbon monoxide alarm, sparking, or water near electrics? Pass it if the report describes no safety risk.",
  },
  {
    id: "location",
    question:
      "Does the summary say where in the property the problem is, the same as the report? Pass it if the report doesn't say where.",
  },
  {
    id: "all_problems",
    question:
      "If the report describes more than one problem, does the summary mention each one? Pass it if the report describes only one problem.",
  },
];

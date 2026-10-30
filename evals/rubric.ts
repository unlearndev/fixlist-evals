// What the model grader checks in each job summary.
// One question per thing that can go wrong, so a fail says which one.
export type Criterion = { id: string; question: string };

export const RUBRIC: Criterion[] = [
  { id: "good", question: "Is this a good job summary for the contractor?" },
];

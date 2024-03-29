import { TASK_IMPACT } from '@prisma/client';

export const pointsToAwardOnTaskCompletion: {
  [impact in TASK_IMPACT]: number;
} = {
  LOW_IMPACT_LOW_EFFORT: 10,
  LOW_IMPACT_HIGH_EFFORT: 30,
  HIGH_IMPACT_LOW_EFFORT: 20,
  HIGH_IMPACT_HIGH_EFFORT: 50,
};

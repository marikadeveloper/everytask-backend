import { TASK_IMPACT } from '@prisma/client';

export function pointsToAwardOnTaskCompletion(impact: TASK_IMPACT): number {
  switch (impact) {
    case 'LOW_IMPACT_LOW_EFFORT':
      return 10;
    case 'LOW_IMPACT_HIGH_EFFORT':
      return 30;
    case 'HIGH_IMPACT_LOW_EFFORT':
      return 20;
    case 'HIGH_IMPACT_HIGH_EFFORT':
      return 50;
    default:
      return 0;
  }
}

/**
 * **Points for Task Completion:**

- **Low Effort Low Impact (LELI):** 10 points (Simple and minimal impact tasks)
- **Low Effort High Impact (LEHI):** 20 points (Easy tasks with significant outcomes)
- **High Effort Low Impact (HELI):** 30 points (Time-consuming tasks with minimal impact)
- **High Effort High Impact (HEHI):** 50 points (Challenging tasks with significant outcomes)
 */

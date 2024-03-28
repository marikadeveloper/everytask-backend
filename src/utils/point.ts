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

export const levels: { id: number; name: string; points: number }[] = [
  { id: 1, name: 'Newbie', points: 0 },
  { id: 2, name: 'Apprentice', points: 100 },
  { id: 3, name: 'Procrastinator Slayer', points: 500 },
  { id: 4, name: 'Master of Efficiency', points: 1000 },
  { id: 5, name: 'Time Lord', points: 2000 },
  { id: 6, name: 'Legend', points: 5000 },
];

export function pointsToTheNextLevel(currentPoints: number): number {
  const nextLevel = levels.find((level) => level.points > currentPoints);
  if (!nextLevel) {
    return 0;
  }
  return nextLevel.points - currentPoints;
}

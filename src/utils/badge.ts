import { Task, TaskCounter, User } from '@prisma/client';
import dayjs from 'dayjs';
import prisma from '../db';

export async function importBadges(req, res, next) {
  const badges: { code: string; name: string; description: string }[] = [
    {
      code: 'ice-breaker',
      name: 'Ice Breaker',
      description: 'Complete your first task',
    },
    {
      code: 'early-bird',
      name: 'Early Bird',
      description: 'Complete 3 tasks before noon',
    },
    {
      code: 'night-owl',
      name: 'Night Owl',
      description: 'Finish 2 tasks after 10pm',
    },
    {
      code: 'busy-bee',
      name: 'Busy Bee',
      description: 'Complete 5 tasks in one day',
    },
    {
      code: 'over-achiever',
      name: 'Over Achiever',
      description: 'Complete 10 tasks in one day',
    },
    {
      code: 'streak-starter',
      name: 'Streak Starter',
      description: 'Begin a 3-day task completion streak',
    },
    {
      code: 'persistence-pays-off',
      name: 'Persistence Pays Off',
      description: 'Maintain a 7-day completion streak',
    },
    {
      code: 'weekend-warrior',
      name: 'Weekend Warrior',
      description: 'Conquer 5 tasks over the weekend',
    },
    {
      code: 'small-wins-matter',
      name: 'Small Wins Matter',
      description: 'Celebrate completing 3 tiny tasks (e.g., making your bed)',
    },
    {
      code: 'epic-achiever',
      name: 'Epic Achiever',
      description: 'Finish a particularly difficult or long-term task',
    },
    {
      code: 'overcomer',
      name: 'Overcomer',
      description: 'Finish a task you procrastinated on for a week',
    },
    {
      code: 'early-completion',
      name: 'Early Completion',
      description: 'Finish a major task significantly ahead of schedule',
    },
    {
      code: 'master-organizer',
      name: 'Master',
      description: 'Categorize and tag 10 tasks effectively',
    },
    {
      code: 'streak-superstar',
      name: 'Streak Superstar',
      description: 'Maintain a 30-day completion streak',
    },
    {
      code: 'level-up-legend',
      name: 'Level Up Legend',
      description: 'Reach the highest user level in the app',
    },
    {
      code: 'bug-buster',
      name: 'Bug Buster',
      description: 'Report and help fix a bug in the app',
    },
    {
      code: 'appreciation-award',
      name: 'Appreciation Award',
      description: 'Receive a special badge from the app developers',
    },
    {
      code: 'hundo-hustler',
      name: 'Hundo Hustler',
      description: 'Complete 100 tasks in total',
    },
    {
      code: 'task-titan',
      name: 'Task Titan',
      description: 'Complete 500 tasks in total',
    },
    {
      code: 'all-star-achiever',
      name: 'All-Star Achiever',
      description: 'Get all the badges in the app',
    },
  ];
  // insert all badges in the database
  await prisma.badge.createMany({
    data: badges,
  });

  res.json({ message: 'Badges imported' });
}

export const badgeCompletion: { [code: string]: (...args) => boolean } = {
  'ice-breaker': (taskCounter: TaskCounter) => taskCounter.completed === 1,
  'early-bird': (taskCounter: TaskCounter) =>
    taskCounter.completedBeforeNoon === 5,
  'night-owl': (taskCounter: TaskCounter) =>
    taskCounter.completedAfterTenPm === 5,
  'busy-bee': (taskCounter: TaskCounter) => taskCounter.completedToday === 5,
  'over-achiever': (taskCounter: TaskCounter) =>
    taskCounter.completedToday === 10,
  'streak-starter': (todo: User) => false,
  'persistence-pays-off': (todo: User) => false,
  'weekend-warrior': (taskCounter: TaskCounter) =>
    taskCounter.completedOnWeekend === 5,
  'small-wins-matter': (taskCounter: TaskCounter) =>
    taskCounter.completedTiny === 5,
  'epic-achiever': (todo) => false,
  overcomer: (task: Task) =>
    dayjs(task.createdAt).isBefore(dayjs().subtract(1, 'week')),
  'early-completion': (task: Task) => {
    // check if it was HIGH_IMPACT_HIGH_EFFORT and completed significantly ahead of the deadline
    if (task.impact === 'HIGH_IMPACT_HIGH_EFFORT') {
      const dueDate = dayjs(task.dueDate);
      const completedDate = dayjs();
      const daysAhead = dueDate.diff(completedDate, 'day');
      return daysAhead > 5;
    } else {
      return false;
    }
  },
  'master-organizer': (taskCounter: TaskCounter) =>
    taskCounter.categorized === 10,
  'streak-superstar': (todo: User) => false,
  'level-up-legend': (todo: User) => false,
  'hundo-hustler': (taskCounter: TaskCounter) => taskCounter.completed === 100,
  'task-titan': (taskCounter: TaskCounter) => taskCounter.completed === 500,
  'all-star-achiever': (todo: User) => false,
};

const badgesAwardableOnTaskCompletion = [
  'ice-breaker',
  'early-bird',
  'night-owl',
  'busy-bee',
  'over-achiever',
  'weekend-warrior',
  'small-wins-matter',
  'overcomer',
  'early-completion',
  'hundo-hustler',
  'task-titan',
];
export function badgesToAwardOnTaskCompletion(
  taskCounter: TaskCounter,
): string[] {
  const badgesToAward: string[] = [];
  for (const badgeCode of badgesAwardableOnTaskCompletion) {
    if (badgeCompletion[badgeCode](taskCounter)) {
      badgesToAward.push(badgeCode);
    }
  }
  return badgesToAward;
}

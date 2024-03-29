import {
  Streak,
  TASK_IMPACT,
  Task,
  TaskCounter,
  User,
  UserBadge,
} from '@prisma/client';
import dayjs from 'dayjs';
import prisma from '../db';
import { getMaxLevel } from './level';

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

const TOT_BADGES_COUNT = 20;

export const badgeCompletion = (input: {
  taskCounter?: TaskCounter;
  task?: Task;
  streak?: Streak;
  user?: User;
  userBadges?: UserBadge[];
}): {
  [code: string]: () => boolean;
} => {
  const { taskCounter, task, streak, user, userBadges } = input;

  return {
    'ice-breaker': () => taskCounter?.completed === 1,
    'early-bird': () => taskCounter?.completedBeforeNoon === 5,
    'night-owl': () => taskCounter?.completedAfterTenPm === 5,
    'busy-bee': () => taskCounter?.completedToday === 5,
    'over-achiever': () => taskCounter?.completedToday === 10,
    'weekend-warrior': () => taskCounter?.completedOnWeekend === 5,
    'small-wins-matter': () =>
      taskCounter?.completedTiny === 5 &&
      task?.impact === TASK_IMPACT.LOW_IMPACT_LOW_EFFORT,
    overcomer: () =>
      dayjs(task?.createdAt).isBefore(dayjs().subtract(1, 'week')),
    'early-completion': () => {
      if (!task) return false;
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
    'master-organizer': () => taskCounter?.categorized === 10,
    'hundo-hustler': () => taskCounter?.completed === 100,
    'task-titan': () => taskCounter?.completed === 500,
    'streak-starter': () => streak?.current === 3,
    'streak-superstar': () => streak?.current === 30,
    'persistence-pays-off': () => streak?.current === 7,
    'epic-achiever': () => task?.impact === TASK_IMPACT.HIGH_IMPACT_HIGH_EFFORT,
    'level-up-legend': () => user?.level === getMaxLevel(),
    'all-star-achiever': () => userBadges?.length === TOT_BADGES_COUNT, // TODO
  };
};

const badgesAwardableOnTaskCompletion = [
  'ice-breaker',
  'early-bird',
  'night-owl',
  'busy-bee',
  'over-achiever',
  'weekend-warrior',
  'small-wins-matter',
  'overcomer', // Task input required
  'early-completion', // Task input required
  'hundo-hustler',
  'task-titan',
];
export function badgesToAwardOnTaskCompletion(input: {
  taskCounter: TaskCounter;
  task: Task;
}): string[] {
  const badgesToAward: string[] = [];
  const badgeCompletionLogic = badgeCompletion(input);

  // TODO: do not award badges that have already been awarded

  for (const badgeCode of badgesAwardableOnTaskCompletion) {
    if (badgeCompletionLogic[badgeCode]()) {
      badgesToAward.push(badgeCode);
    }
  }
  return badgesToAward;
}

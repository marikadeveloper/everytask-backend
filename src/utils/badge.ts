import { Streak, TASK_IMPACT, Task, TaskCounter, User } from '@prisma/client';
import dayjs from 'dayjs';
import prisma from '../db';
import { BadgeCode } from '../types/enums';
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

// Helper function to check if a user already has a badge
const userAlreadyHasBadge = (userBadges, badgeCode): boolean =>
  userBadges.some((ub) => ub.badge.code === badgeCode);

// Helper functions for complex conditions
const isTaskCompletedBeforeWeek = (task): boolean =>
  dayjs(task?.createdAt).isBefore(dayjs().subtract(1, 'week'));

const isTaskHighImpactHighEffortCompletedEarly = (task): boolean => {
  if (!task || task.impact !== TASK_IMPACT.HIGH_IMPACT_HIGH_EFFORT)
    return false;
  const dueDate = dayjs(task.dueDate);
  const completedDate = dayjs();
  return dueDate.diff(completedDate, 'day') > 5;
};

export const badgeCompletion = async (input: {
  taskCounter?: TaskCounter;
  task?: Task;
  streak?: Streak;
  user: User;
}): Promise<{
  [code: string]: () => boolean;
}> => {
  const { taskCounter, task, streak, user } = input;
  const userId = user.id;

  const userBadges = await prisma.userBadge.findMany({
    where: {
      userId,
    },
    include: {
      badge: {
        select: {
          code: true,
        },
      },
    },
  });

  const badgeConditions = [
    {
      code: BadgeCode.ICE_BREAKER,
      condition: () => taskCounter?.completed === 1,
    },
    {
      code: BadgeCode.EARLY_BIRD,
      condition: () => taskCounter?.completedBeforeNoon === 5,
    },
    {
      code: BadgeCode.NIGHT_OWL,
      condition: () => taskCounter?.completedAfterTenPm === 5,
    },
    {
      code: BadgeCode.BUSY_BEE,
      condition: () => taskCounter?.completedToday === 5,
    },
    {
      code: BadgeCode.OVER_ACHIEVER,
      condition: () => taskCounter?.completedToday === 10,
    },
    { code: BadgeCode.STREAK_STARTER, condition: () => streak?.current === 3 },
    {
      code: BadgeCode.PERSISTENCE_PAYS_OFF,
      condition: () => streak?.current === 7,
    },
    {
      code: BadgeCode.WEEKEND_WARRIOR,
      condition: () => taskCounter?.completedOnWeekend === 5,
    },
    {
      code: BadgeCode.SMALL_WINS_MATTER,
      condition: () =>
        taskCounter?.completedTiny === 5 &&
        task?.impact === TASK_IMPACT.LOW_IMPACT_LOW_EFFORT,
    },
    {
      code: BadgeCode.EPIC_ACHIEVER,
      condition: () => task?.impact === TASK_IMPACT.HIGH_IMPACT_HIGH_EFFORT,
    },
    {
      code: BadgeCode.OVERCOMER,
      condition: () => isTaskCompletedBeforeWeek(task),
    },
    {
      code: BadgeCode.EARLY_COMPLETION,
      condition: () => isTaskHighImpactHighEffortCompletedEarly(task),
    },
    {
      code: BadgeCode.MASTER_ORGANIZER,
      condition: () => taskCounter?.categorized === 10,
    },
    {
      code: BadgeCode.HUNDO_HUSTLER,
      condition: () => taskCounter?.completed === 100,
    },
    {
      code: BadgeCode.TASK_TITAN,
      condition: () => taskCounter?.completed === 500,
    },
    {
      code: BadgeCode.STREAK_SUPERSTAR,
      condition: () => streak?.current === 30,
    },
    {
      code: BadgeCode.LEVEL_UP_LEGEND,
      condition: () => user?.level === getMaxLevel(),
    },
    {
      code: BadgeCode.ALL_STAR_ACHIEVER,
      condition: () => userBadges?.length === TOT_BADGES_COUNT,
    },
  ];

  // Map each badge to a function that checks its condition
  return badgeConditions.reduce((acc, { code, condition }) => {
    acc[code] = () => !userAlreadyHasBadge(userBadges, code) && condition();
    return acc;
  }, {});
};

async function getBadgesToAward(
  input: {
    userId: string;
    taskCounter?: TaskCounter;
    task?: Task;
    streak?: Streak;
  },
  badgeCodes: BadgeCode[],
): Promise<BadgeCode[]> {
  const badgesToAward: BadgeCode[] = [];
  const user = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
  });

  const badgeCompletionLogic = await badgeCompletion({ ...input, user });

  for (const badgeCode of badgeCodes) {
    if (badgeCompletionLogic[badgeCode]()) {
      badgesToAward.push(badgeCode);
    }
  }
  return badgesToAward;
}

export async function badgesToAwardOnTaskCreation(input: {
  task: Task;
}): Promise<BadgeCode[]> {
  const badgeCodes = [BadgeCode.MASTER_ORGANIZER];

  return getBadgesToAward({ ...input, userId: input.task.userId }, badgeCodes);
}

export async function badgesToAwardOnTaskCompletion(input: {
  taskCounter: TaskCounter;
  task: Task;
}): Promise<BadgeCode[]> {
  const badgeCodes = [
    BadgeCode.ICE_BREAKER,
    BadgeCode.EARLY_BIRD,
    BadgeCode.NIGHT_OWL,
    BadgeCode.BUSY_BEE,
    BadgeCode.OVER_ACHIEVER,
    BadgeCode.WEEKEND_WARRIOR,
    BadgeCode.SMALL_WINS_MATTER,
    BadgeCode.OVERCOMER,
    BadgeCode.EARLY_COMPLETION,
    BadgeCode.HUNDO_HUSTLER,
    BadgeCode.TASK_TITAN,
  ];

  return getBadgesToAward({ ...input, userId: input.task.userId }, badgeCodes);
}

export async function badgesToAwardOnStreakUpdate(input: {
  streak: Streak;
}): Promise<BadgeCode[]> {
  const badgeCodes = [
    BadgeCode.STREAK_STARTER,
    BadgeCode.STREAK_SUPERSTAR,
    BadgeCode.PERSISTENCE_PAYS_OFF,
  ];

  return getBadgesToAward(
    { ...input, userId: input.streak.userId },
    badgeCodes,
  );
}

export async function badgesToAwardOnLevelUp(input: {
  userId: string;
}): Promise<BadgeCode[]> {
  const badgeCodes = [BadgeCode.LEVEL_UP_LEGEND];
  const { userId } = input;

  return getBadgesToAward(
    {
      userId,
    },
    badgeCodes,
  );
}

export async function badgesToAwardOnCategorization(input: {
  taskCounter: TaskCounter;
}): Promise<BadgeCode[]> {
  const badgeCodes = [BadgeCode.MASTER_ORGANIZER];

  return getBadgesToAward(
    {
      ...input,
      userId: input.taskCounter.userId,
    },
    badgeCodes,
  );
}

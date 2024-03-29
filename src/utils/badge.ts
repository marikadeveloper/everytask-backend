import { Streak, TASK_IMPACT, Task, TaskCounter, User } from '@prisma/client';
import dayjs from 'dayjs';
import prisma from '../db';
import { BadgeCode } from '../types/enums';
import { getMaxLevel } from './level';

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

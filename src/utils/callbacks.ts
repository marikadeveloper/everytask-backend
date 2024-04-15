import {
  Streak,
  TASK_IMPACT,
  TASK_STATUS,
  TaskCounter,
  UserBadge,
} from '@prisma/client';
import dayjs from 'dayjs';
import prisma from '../db';
import { BadgeCode } from '../types/enums';
import { Level } from '../types/level';
import {
  badgesToAwardOnCategorization,
  badgesToAwardOnLevelUp,
  badgesToAwardOnStreakUpdate,
  badgesToAwardOnTaskCompletion,
} from './badge';
import { levels } from './level';
import { pointsToAwardOnTaskCompletion } from './point';

const DATABASE_DATE_FORMAT = 'YYYY-MM-DD';

export async function updateStatusHistory({ taskId, status, updatedAt }) {
  await prisma.statusUpdate.create({
    data: {
      status,
      taskId,
      updatedAt,
    },
  });
}

export async function updateTaskDailyStat({
  updatedAt,
  userId,
  action,
  task,
  data = undefined,
}) {
  const dateWithoutTime = updatedAt.split('T')[0];
  const now = dayjs(dateWithoutTime)
    .startOf('day')
    .format(DATABASE_DATE_FORMAT);
  let createData: any = { userId, date: now };
  let updateData: any = {};

  if (action === 'create') {
    createData.created = 1;
    updateData.created = { increment: 1 };
  } else if (action === 'statusUpdate') {
    createData = {
      ...createData,
      inProgress: data.newStatus === TASK_STATUS.IN_PROGRESS ? 1 : 0,
      completed: data.newStatus === TASK_STATUS.DONE ? 1 : 0,
    };
    updateData = {
      inProgress: getIncrementDecrementStatusCounter(
        data.newStatus,
        TASK_STATUS.IN_PROGRESS,
        task.status,
      ),
      completed: getIncrementDecrementStatusCounter(
        data.newStatus,
        TASK_STATUS.DONE,
        task.status,
      ),
    };
  }

  // fetch the TaskDailyStat for the current user and date
  const foundTaskDailyStat = await prisma.taskDailyStat.findUnique({
    where: { userId_date: { userId, date: now } },
  });

  if (foundTaskDailyStat) {
    // update the TaskDailyStat
    return await prisma.taskDailyStat.update({
      where: { id: foundTaskDailyStat.id },
      data: updateData,
    });
  } else {
    // create the TaskDailyStat
    return await prisma.taskDailyStat.create({
      data: createData,
    });
  }
}

function getIncrementDecrementStatusCounter(
  newStatus,
  targetStatus,
  oldStatus,
) {
  if (newStatus === targetStatus) return { increment: 1 };
  if (oldStatus === targetStatus && newStatus !== targetStatus)
    return { decrement: 1 };
  return undefined;
}

async function resetDailyTaskCounters({ userId }) {
  return await prisma.taskCounter.update({
    where: { userId },
    data: { completedToday: 0 },
  });
}

export async function updateTaskCounter({
  updatedAt,
  userId,
  action,
  task,
  data = undefined,
}) {
  // find the TaskCounter for the current user
  let taskCounter = await prisma.taskCounter.findUnique({
    where: { userId: task.userId },
  });

  // it should be present as it is created when the user is created but for old users it may not be present
  if (!taskCounter) {
    taskCounter = await prisma.taskCounter.create({
      data: {
        userId: task.userId,
        updatedAt,
      },
    });
  }

  // reset daily and weekly counters if needed
  const dateWithoutTime = updatedAt.split('T')[0];
  const updatedAtWithoutTime = !!taskCounter.updatedAt?.split
    ? taskCounter.updatedAt.split('T')[0]
    : taskCounter.updatedAt;
  const hasBeenUpdatedBeforeToday = dayjs(updatedAtWithoutTime).isBefore(
    dayjs(dateWithoutTime).startOf('day'),
  );
  if (hasBeenUpdatedBeforeToday) {
    taskCounter = await resetDailyTaskCounters({ userId });
  }

  // update the counter
  if (action === 'create') {
    // total++, if task has category, categorized++
    taskCounter = await incrementTaskCounter(task, userId, updatedAt);
  } else if (action === 'statusUpdate' && data.newStatus === TASK_STATUS.DONE) {
    taskCounter = await updateTaskCounterOnCompletion(task, userId, updatedAt);
  }

  return taskCounter;
}

async function incrementTaskCounter(task, userId, updatedAt) {
  return await prisma.taskCounter.update({
    where: { userId },
    data: {
      total: { increment: 1 },
      categorized: task.categoryId ? { increment: 1 } : undefined,
      updatedAt,
    },
  });
}

async function updateTaskCounterOnCompletion(task, userId, completedAt) {
  const {
    completedBeforeNoon,
    completedAfterTenPm,
    completedOnWeekend,
    completedTiny,
  } = getCompletionMetrics(task, completedAt);
  return await prisma.taskCounter.update({
    where: { userId },
    data: {
      completedToday: { increment: 1 },
      completed: { increment: 1 },
      completedBeforeNoon: completedBeforeNoon ? { increment: 1 } : undefined,
      completedAfterTenPm: completedAfterTenPm ? { increment: 1 } : undefined,
      completedOnWeekend: completedOnWeekend ? { increment: 1 } : undefined,
      completedTiny: completedTiny ? { increment: 1 } : undefined,
      updatedAt: completedAt,
    },
  });
}

function getCompletionMetrics(task, _completedAt) {
  // shenaningans for timezone
  const completedAtHours = +_completedAt.split('T')[1].split(':')[0];
  const completedAtDate = _completedAt.split('T')[0];
  const completedAt = dayjs(completedAtDate).startOf('day');
  return {
    completedBeforeNoon: completedAtHours < 12,
    completedAfterTenPm: completedAtHours >= 22 && completedAtHours <= 4,
    completedOnWeekend: completedAt.day() === 0 || completedAt.day() === 6,
    completedTiny: task.impact === TASK_IMPACT.LOW_IMPACT_LOW_EFFORT,
  };
}

export async function updateUserStreak({
  userId,
  updatedAt,
}): Promise<Streak | undefined> {
  const userStreak = await prisma.streak.findUnique({
    where: { userId },
  });
  // updatedAt is a date like this: 2024-04-11T12:32:20.379Z
  // const now = dayjs().toDate();
  // const today = dayjs().startOf('day');
  const dateWithoutTime = updatedAt.split('T')[0];
  // userStreak.updatedAt has this format: 2024-04-11
  const lastUpdated = dayjs(userStreak?.updatedAt ?? 0).startOf('day');
  const lastUpdatedYesterday = dayjs()
    .startOf('day')
    .subtract(1, 'day')
    .isSame(lastUpdated, 'day');
  const lastUpdatedBeforeYesterday = lastUpdated.isBefore(
    dayjs().startOf('day').subtract(1, 'day'),
  );
  let updatedUserStreak;

  if (!userStreak) {
    // create streak
    updatedUserStreak = await prisma.streak.create({
      data: {
        userId,
        current: 1,
        longest: 1,
        updatedAt: dateWithoutTime,
      },
    });
  } else if (lastUpdatedYesterday) {
    // increment streak
    updatedUserStreak = await prisma.streak.update({
      where: { userId },
      data: {
        current: { increment: 1 },
        longest: Math.max(userStreak.current + 1, userStreak.longest),
        updatedAt: dateWithoutTime,
      },
    });
  } else if (lastUpdatedBeforeYesterday) {
    // reset streak
    updatedUserStreak = await prisma.streak.update({
      where: { userId },
      data: {
        current: 1,
        updatedAt: dateWithoutTime,
      },
    });
  }

  return updatedUserStreak;
}

async function updateUserPoints({
  userId,
  points,
}): Promise<Level | undefined> {
  // get current user level
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true },
  });

  // update user points
  let updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      points: { increment: points },
    },
  });

  // check if user can level up
  const gainedLevel = levels.find(
    (level) => level.points <= updatedUser.points && level.id > user.level,
  );

  if (gainedLevel) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        level: gainedLevel.id,
      },
    });
  }

  return gainedLevel;
}

export async function awardBadgesOnTaskCreate(
  taskCounter: TaskCounter,
): Promise<UserBadge[]> {
  const userId = taskCounter.userId;
  const badgesCodes = await badgesToAwardOnCategorization({
    taskCounter,
  });

  // insert badges into db
  if (badgesCodes.length) {
    await prisma.userBadge.createMany({
      data: badgesCodes.map((code) => ({
        userId,
        badgeId: code,
      })),
      skipDuplicates: true,
    });
  }

  return await prisma.userBadge.findMany({
    where: {
      userId,
    },
    include: {
      badge: true,
    },
  });
}

export async function awardPointsOnTaskComplete({
  taskImpact,
  userId,
}): Promise<{
  levelUp: Level | null;
  pointsAwarded: number;
}> {
  const pointsAwarded = pointsToAwardOnTaskCompletion[taskImpact];
  let levelUp = null;
  if (pointsAwarded) {
    levelUp = await updateUserPoints({
      userId,
      points: pointsAwarded,
    });
  }

  return { levelUp, pointsAwarded };
}

export async function awardBadgesOnTaskUpdate({
  originalTask,
  updates,
  taskCounter,
  updatedUserStreak,
  levelUp,
}): Promise<UserBadge[]> {
  const userId = originalTask.userId;

  if (!updates.status && !updates.categoryId) return [];

  let badgesCodes: BadgeCode[] = [];
  let badgesCodesFromStreak: BadgeCode[] = [];
  let badgesCodesFromLevelUp: BadgeCode[] = [];
  let badgesCodesFromCategorization: BadgeCode[] = [];
  let badgesCodesFromStatusUpdate: BadgeCode[] = [];

  if (updates.status === TASK_STATUS.DONE) {
    // get badges from status update
    badgesCodesFromStatusUpdate = await badgesToAwardOnTaskCompletion({
      taskCounter,
      task: originalTask,
    });

    if (updatedUserStreak) {
      // get badges from streak update
      badgesCodesFromStreak = await badgesToAwardOnStreakUpdate({
        streak: updatedUserStreak,
      });
    }

    if (levelUp) {
      // get badges from level up
      badgesCodesFromLevelUp = await badgesToAwardOnLevelUp({
        userId,
      });
    }
  }

  if (updates.categoryId) {
    // get badges from categorization
    badgesCodesFromCategorization = await badgesToAwardOnCategorization({
      taskCounter,
    });
  }

  // merge all badges
  badgesCodes = [
    ...badgesCodesFromStreak,
    ...badgesCodesFromLevelUp,
    ...badgesCodesFromCategorization,
    ...badgesCodesFromStatusUpdate,
  ];

  // insert badges into db
  if (badgesCodes.length) {
    await prisma.userBadge.createMany({
      data: badgesCodes.map((code) => ({
        userId,
        badgeId: code,
      })),
      skipDuplicates: true,
    });
  }

  return await prisma.userBadge.findMany({
    where: {
      userId,
      badgeId: { in: badgesCodes },
    },
    include: {
      badge: true,
    },
  });
}

export async function onTaskOrderUpdated({ originalTask, data }) {
  if (originalTask.status === data.status) {
    // case 1: moving task in the same column (not changing status)
    const isMovingUp = data.relativeOrder < originalTask.relativeOrder;

    const tasksToMove = await prisma.task.findMany({
      where: {
        relativeOrder: isMovingUp
          ? { gte: data.relativeOrder }
          : { gte: originalTask.relativeOrder },
        status: originalTask.status,
        id: { not: originalTask.id },
      },
    });

    await prisma.task.updateMany({
      where: {
        id: { in: tasksToMove.map((t) => t.id) },
      },
      data: {
        relativeOrder: isMovingUp ? { increment: 1 } : { decrement: 1 },
      },
    });
  } else {
    // case 2: moving task to another column (changing status)
    // in the old column, move all tasks with higher relative order one position up (index--)
    const tasksToMoveUp = await prisma.task.findMany({
      where: {
        relativeOrder: { gt: originalTask.relativeOrder },
        status: originalTask.status,
      },
    });

    await prisma.task.updateMany({
      where: {
        id: { in: tasksToMoveUp.map((t) => t.id) },
      },
      data: {
        relativeOrder: { decrement: 1 },
      },
    });

    // in the new column, move all tasks with higher or equal relative order one position down (index++)
    const tasksToMoveDown = await prisma.task.findMany({
      where: {
        relativeOrder: { gte: data.relativeOrder },
        status: data.status,
      },
    });

    await prisma.task.updateMany({
      where: {
        id: { in: tasksToMoveDown.map((t) => t.id) },
      },
      data: {
        relativeOrder: { increment: 1 },
      },
    });
  }
}

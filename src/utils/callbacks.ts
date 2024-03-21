import { TASK_IMPACT, TASK_STATUS } from '@prisma/client';
import dayjs from 'dayjs';
import prisma from '../db';
import { badgeCompletion, badgesToAwardOnTaskCompletion } from './badge';
import { levels } from './level';
import { pointsToAwardOnTaskCompletion } from './point';

async function updateStatusHistory({ taskId, status }) {
  await prisma.statusUpdate.create({
    data: {
      status,
      taskId,
    },
  });
}
/**
 * A function that updates the user's daily stats
 * @param userId  - the user id
 * @param action - the action that was performed on the task (create, statusUpdate)
 * @param task - the task that was created or updated
 * @param data - additional data that is needed for the action
 * @returns nothing
 */
async function updateTaskDailyStat({ userId, action, task, data = undefined }) {
  const now = dayjs().startOf('day').format('YYYY-MM-DD');

  if (action === 'create') {
    await prisma.taskDailyStat.upsert({
      create: {
        userId: task.userId,
        date: now,
        created: 1,
      },
      update: {
        created: { increment: 1 },
      },
      where: { userId_date: { userId, date: now } },
    });
  } else if (action === 'statusUpdate') {
    await prisma.taskDailyStat.upsert({
      create: {
        userId: task.userId,
        date: now,
        inProgress: data.newStatus === TASK_STATUS.IN_PROGRESS ? 1 : 0,
        completed: data.newStatus === TASK_STATUS.DONE ? 1 : 0,
      },
      update: {
        // in progress must be incremented if the new status is in progress and the old status is not in progress
        // in progress must be decremented if the new status is not in progress and the old status is in progress
        inProgress:
          data.newStatus === TASK_STATUS.IN_PROGRESS
            ? { increment: 1 }
            : task.status === TASK_STATUS.IN_PROGRESS &&
              data.newStatus !== TASK_STATUS.IN_PROGRESS
            ? { decrement: 1 }
            : undefined,
        // completed must be incremented if the new status is completed and the old status is not completed
        // completed must be decremented if the new status is not completed and the old status is completed
        completed:
          data.newStatus === TASK_STATUS.DONE
            ? { increment: 1 }
            : task.status === TASK_STATUS.DONE &&
              data.newStatus !== TASK_STATUS.DONE
            ? { decrement: 1 }
            : undefined,
      },
      where: { userId_date: { userId, date: now } },
    });
  }
}

/**
 * A function that resets the daily task counters
 * @param userId - the user id
 * @returns updated TaskCounter
 */
async function resetDailyTaskCounters({ userId }) {
  const updatedTaskCounter = await prisma.taskCounter.update({
    where: { userId },
    data: { completedToday: 0 },
  });

  return updatedTaskCounter;
}

/**
 * A function that updates the user's TaskCounter
 * @param userId  - the user id
 * @param action - the action that was performed on the task (create, statusUpdate)
 * @param task - the task that was created or updated
 * @param data - additional data that is needed for the action
 * @returns updated TaskCounter
 */
async function updateTaskCounter({ userId, action, task, data = undefined }) {
  // find the TaskCounter for the current user
  let taskCounter = await prisma.taskCounter.findUnique({
    where: { userId: task.userId },
  });

  // it should be present as it is created when the user is created but for old users it may not be present
  if (!taskCounter) {
    taskCounter = await prisma.taskCounter.create({
      data: {
        userId: task.userId,
        updatedAt: new Date(),
      },
    });
  }

  // reset daily and weekly counters if needed
  const hasBeenUpdatedBeforeToday = dayjs(taskCounter.updatedAt).isBefore(
    dayjs().startOf('day'),
  );
  if (hasBeenUpdatedBeforeToday) {
    taskCounter = await resetDailyTaskCounters({ userId });
  }

  // update the counter
  if (action === 'create') {
    // total++, if task has category, categorized++
    taskCounter = await prisma.taskCounter.update({
      where: { userId },
      data: {
        total: { increment: 1 },
        categorized: task.categoryId ? { increment: 1 } : undefined,
      },
    });
  } else if (action === 'statusUpdate') {
    /**
     * completedToday           Int      @default(0) // task master badge
      completedBeforeNoon      Int      @default(0) // early bird badge
      completedAfterTenPm      Int      @default(0) // night owl badge
      completedOnWeekend       Int      @default(0) // weekend warrior badge
      completedTiny            Int      @default(0) // small wins matter badge
      completed                Int      @default(0)
     */
    if (data.newStatus === TASK_STATUS.DONE) {
      const completedAt = dayjs();
      const completedBeforeNoon = completedAt.isBefore(
        completedAt.startOf('day').add(12, 'hour'),
      );
      const completedAfterTenPm = completedAt.isAfter(
        completedAt.startOf('day').add(22, 'hour'),
      );
      const completedOnWeekend =
        completedAt.day() === 0 || completedAt.day() === 6;
      const completedTiny = task.impact === TASK_IMPACT.LOW_IMPACT_LOW_EFFORT;

      taskCounter = await prisma.taskCounter.update({
        where: { userId },
        data: {
          completedToday: { increment: 1 },
          completed: { increment: 1 },
          completedBeforeNoon: completedBeforeNoon
            ? { increment: 1 }
            : undefined,
          completedAfterTenPm: completedAfterTenPm
            ? { increment: 1 }
            : undefined,
          completedOnWeekend: completedOnWeekend ? { increment: 1 } : undefined,
          completedTiny: completedTiny ? { increment: 1 } : undefined,
        },
      });
    }
  }

  return taskCounter;
}

/**
 * A function that updates the user's streaks on task completion
 * @param userId - the user id
 * @returns the updated UserStreak
 */
async function updateUserStreak({ userId }) {
  const userStreak = await prisma.streak.findUnique({
    where: { userId },
  });
  let updatedUserStreak;

  if (!userStreak) {
    updatedUserStreak = await prisma.streak.create({
      data: {
        userId,
        current: 1,
        longest: 1,
      },
    });
  } else {
    const now = new Date();
    const today = dayjs().startOf('day');
    const lastUpdated = dayjs(userStreak.updatedAt).startOf('day');
    const lastUpdatedYesterday = today.subtract(1, 'day').isSame(lastUpdated);
    if (lastUpdatedYesterday) {
      updatedUserStreak = await prisma.streak.update({
        where: { userId },
        data: {
          current: { increment: 1 },
          longest: Math.max(userStreak.current + 1, userStreak.longest),
          updatedAt: now,
        },
      });
    } else {
      updatedUserStreak = await prisma.streak.update({
        where: { userId },
        data: {
          current: 1,
          updatedAt: now,
        },
      });
    }
  }

  return updatedUserStreak;
}

async function updateUserPoints({ userId, points }) {
  // get current user level
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true },
  });

  // update user points
  const updatedUser = await prisma.user.update({
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

  return updatedUser;
}

export async function onTaskCreated(task): Promise<string[]> {
  // 1. if not present, add an entry for TaskDailyStat for the current user
  // 2. update TaskCounter for the current user - if updatedAt is not today, reset the counter
  // 3. award badges if needed
  const userId = task.userId;
  let badgesCodes: string[] = [];

  // 1. update TaskDailyStat for the current user
  await updateTaskDailyStat({ userId, action: 'create', task });

  // 2. update TaskCounter for the current user
  const taskCounter = await updateTaskCounter({
    userId,
    action: 'create',
    task,
  });

  // 3. award badges if needed
  // master organizer
  if (badgeCompletion['master-organizer'](taskCounter)) {
    await prisma.userBadge.create({
      data: {
        userId,
        badgeId: 'master-organizer',
      },
      include: { badge: true },
    });
    badgesCodes.push('master-organizer');
  }

  return badgesCodes;
}

export async function onTaskStatusUpdated({
  originalTask,
  newStatus,
}): Promise<{
  badgesCodes: string[];
  points: number;
}> {
  let badgesCodes: string[] = [];
  let pointsAwarded = 0;
  const userId = originalTask.userId;

  // 0. update status history
  await updateStatusHistory({ taskId: originalTask.id, status: newStatus });

  // 1. if not present, add an entry for TaskDailyStat for the current user
  await updateTaskDailyStat({
    userId,
    action: 'statusUpdate',
    task: originalTask,
    data: { newStatus },
  });

  // 2. update TaskCounter for the current user
  const taskCounter = await updateTaskCounter({
    userId,
    action: 'statusUpdate',
    task: originalTask,
    data: { newStatus },
  });

  // 3. award badges if needed
  if (badgeCompletion['master-organizer'](taskCounter)) {
    // status independent
    badgesCodes.push('master-organizer');
  }

  if (newStatus === TASK_STATUS.DONE) {
    const badgesToAward = await badgesToAwardOnTaskCompletion(taskCounter);
    badgesCodes = badgesCodes.concat(badgesToAward);
  }

  if (badgesCodes.length) {
    await prisma.userBadge.createMany({
      data: badgesCodes.map((code) => ({
        userId,
        badgeId: code,
      })),
      skipDuplicates: true,
    });
  }

  // 4. award points if needed
  if (newStatus === TASK_STATUS.DONE) {
    pointsAwarded = pointsToAwardOnTaskCompletion(originalTask.impact);
    if (pointsAwarded) {
      await updateUserPoints({ userId, points: pointsAwarded });
    }
  }

  // 5. update streaks
  if (newStatus === TASK_STATUS.DONE) {
    await updateUserStreak({ userId });
  }

  return { badgesCodes, points: pointsAwarded };
}

export async function onTaskOrderUpdated({ originalTask, data }) {
  if (originalTask.status === data.status) {
    // case 1: moving task in the same column (not changing status)
    const isMovingUp = data.relativeOrder < originalTask.relativeOrder;

    const tasksToMove = await prisma.task.findMany({
      where: {
        relativeOrder: isMovingUp
          ? { lte: originalTask.relativeOrder }
          : { lte: data.relativeOrder },
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

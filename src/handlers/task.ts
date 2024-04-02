import { Prisma, TASK_IMPACT, TASK_STATUS } from '@prisma/client';
import dayjs from 'dayjs';
import prisma from '../db';
import {
  awardBadgesOnTaskCreate,
  awardBadgesOnTaskUpdate,
  awardPointsOnTaskComplete,
  onTaskOrderUpdated,
  updateStatusHistory,
  updateTaskCounter,
  updateTaskDailyStat,
  updateUserStreak,
} from '../utils/callbacks';
import {
  isValidDate,
  removeUndefinedValuesFromPayload,
} from '../utils/functions';
import { okResponse } from '../utils/response';

const taskExternalFieldsToInclude = {
  checklistItems: {
    orderBy: {
      order: Prisma.SortOrder.asc,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
    },
  },
};

const getTasksFilters = (query) => {
  const filters: {
    status?: TASK_STATUS;
    categoryId?: { in: string[] };
    OR?: Array<{
      [key: string]: {
        contains: string;
        mode: 'insensitive';
      };
    }>;
    impact?: TASK_IMPACT;
  } = {};

  if (query.status) {
    filters.status = TASK_STATUS[query.status];
  }

  if (query.categoryIds?.length) {
    filters.categoryId = Array.isArray(query.categoryIds)
      ? { in: query.categoryIds }
      : { in: [query.categoryIds] };
  }

  if (query.containsText) {
    filters.OR = [
      {
        title: {
          contains: query.containsText,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: query.containsText,
          mode: 'insensitive',
        },
      },
    ];
  }

  if (query.impact) {
    filters.impact = TASK_IMPACT[query.impact];
  }

  return filters;
};

// Get all user's tasks with their checklist items
export const getTasks = async (req, res) => {
  const filters = getTasksFilters(req.body);

  // return tasks sorted by their relative order
  const tasks = await prisma.task.findMany({
    where: {
      userId: req.user.id,
      ...filters,
    },
    orderBy: {
      relativeOrder: Prisma.SortOrder.asc,
    },
    include: taskExternalFieldsToInclude,
  });

  res.json({
    data: tasks,
  });
};

// Get one task
export const getOneTask = async (req, res) => {
  const task = await prisma.task.findUnique({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    include: {
      ...taskExternalFieldsToInclude,
      statusHistory: {
        orderBy: {
          updatedAt: Prisma.SortOrder.desc,
        },
      },
    },
  });

  if (!task) {
    return res.status(404).json({
      message: 'Task not found',
    });
  }

  res.json({
    data: task,
  });
};

// Create a task
export const createTask = async (req, res) => {
  // check if dueDate is a valid date
  if (req.body.dueDate && !isValidDate(req.body.dueDate)) {
    return res.status(400).json({
      message: 'Invalid dueDate',
    });
  }

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const userId = req.user.id;
      // Calculate relative order, that is the order of the last task that has the same status + 1
      const lastTask = await prisma.task.findFirst({
        where: {
          userId,
          status: TASK_STATUS.TODO,
        },
        orderBy: {
          relativeOrder: Prisma.SortOrder.desc,
        },
      });

      const relativeOrder = lastTask ? lastTask.relativeOrder + 1 : 0;

      const optionalData = removeUndefinedValuesFromPayload({
        emoji: req.body.emoji,
        description: req.body.description,
        categoryId: req.body.categoryId,
      });

      // Create task
      const task = await prisma.task.create({
        data: {
          userId,
          title: req.body.title,
          dueDate: req.body.dueDate,
          impact: req.body.impact,
          relativeOrder,
          ...optionalData,
        },
      });

      await updateTaskDailyStat({ userId, action: 'create', task });

      const taskCounter = await updateTaskCounter({
        userId,
        action: 'create',
        task,
      });

      const badges = await awardBadgesOnTaskCreate(taskCounter);

      return { task, badges };
    });

    res.json({
      data: result,
    });
  } catch (error) {
    console.error(error);
    // Handle errors
    res
      .status(500)
      .json({ message: 'An error occurred during the task creation process' });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  const data = removeUndefinedValuesFromPayload(req.body);

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const userId = req.user.id;
      // Retrieve original task
      const originalTask = await prisma.task.findUnique({
        where: {
          id: req.params.id,
        },
      });

      if (!originalTask) {
        throw new Error('Task not found');
      }

      if (data.status === TASK_STATUS.DONE && !originalTask.firstCompletedAt) {
        data.firstCompletedAt = new Date().toISOString();
      }

      // Update task
      const task = await prisma.task.update({
        where: {
          id: req.params.id,
          userId,
        },
        data,
        include: taskExternalFieldsToInclude,
      });

      // Get taskcounter
      let taskCounter = await prisma.taskCounter.findUnique({
        where: {
          userId,
        },
      });

      // Handle kanban moving (only on task update)
      if (data.relativeOrder !== undefined) {
        await onTaskOrderUpdated({ originalTask, data });
      }

      if (data.status) {
        // update status history (only on task update, only if status has changed)
        if (data.status !== originalTask.status) {
          await updateStatusHistory({
            taskId: originalTask.id,
            status: data.status,
          });
        }

        // if not present, add an entry for TaskDailyStat for the current user
        await updateTaskDailyStat({
          userId,
          action: 'statusUpdate',
          task: originalTask,
          data: { newStatus: data.status },
        });

        // update TaskCounter for the current user
        taskCounter = await updateTaskCounter({
          userId,
          action: 'statusUpdate',
          task: originalTask,
          data: { newStatus: data.status },
        });
      }

      let updatedUserStreak;
      let pointsAwarded = 0;
      let levelUp;
      if (data.status === TASK_STATUS.DONE) {
        // update streaks
        updatedUserStreak = await updateUserStreak({ userId });
        // award points
        const pointsResult = await awardPointsOnTaskComplete({
          taskImpact: task.impact,
          userId,
        });
        pointsAwarded = pointsResult.pointsAwarded;
        levelUp = pointsResult.levelUp;
      }

      const badges = await awardBadgesOnTaskUpdate({
        originalTask,
        updates: data,
        taskCounter,
        updatedUserStreak,
        levelUp,
      });

      return {
        task,
        badges,
        pointsAwarded,
        levelUp,
        streak: updatedUserStreak,
      };
    });

    res.json({
      data: result,
    });
  } catch (error) {
    console.error(error);

    if (error.message === 'Task not found') {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    // Handle other errors
    res
      .status(500)
      .json({ message: 'An error occurred during the update process' });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    await prisma.task.delete({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    res.json(okResponse());
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An error occurred during the deletion process',
    });
  }
};

// Dashboard specific query
export const getDashboardTasks = async (req, res) => {
  const userId = req.user.id;
  // Get all tasks that are not done and are due today or are overdue
  const endOfToday = dayjs().endOf('day').toISOString();
  const dueTodayOrOverdue = await prisma.task.findMany({
    where: {
      userId,
      status: {
        not: TASK_STATUS.DONE,
      },
      dueDate: {
        lte: endOfToday,
      },
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Get 5 of the next upcoming tasks not done
  const upcomingTasks = await prisma.task.findMany({
    where: {
      userId,
      status: {
        not: TASK_STATUS.DONE,
      },
      dueDate: {
        gt: endOfToday,
      },
    },
    orderBy: {
      dueDate: Prisma.SortOrder.asc,
    },
    take: 5,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json({
    data: {
      dueTodayOrOverdue,
      upcomingTasks,
    },
  });
};

import { TASK_STATUS } from '@prisma/client';
import prisma from '../db';
import {
  onTaskCreated,
  onTaskOrderUpdated,
  onTaskStatusUpdated,
} from '../utils/callbacks';
import {
  isValidDate,
  removeUndefinedValuesFromPayload,
} from '../utils/functions';
import { okResponse } from '../utils/response';

const taskExternalFieldsToInclude = {
  checklistItems: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
};

// Get all user's tasks with their checklist items
export const getTasks = async (req, res) => {
  // return tasks sorted by their relative order
  const tasks = await prisma.task.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      relativeOrder: 'asc',
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
          updatedAt: 'desc',
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
      // Calculate relative order, that is the order of the last task that has the same status + 1
      const lastTask = await prisma.task.findFirst({
        where: {
          userId: req.user.id,
          status: TASK_STATUS.TODO,
        },
        orderBy: {
          relativeOrder: 'desc',
        },
      });

      const relativeOrder = lastTask ? lastTask.relativeOrder + 1 : 0;

      // Create task
      const task = await prisma.task.create({
        data: {
          userId: req.user.id,
          emoji: req.body.emoji,
          title: req.body.title,
          description: req.body.description,
          dueDate: req.body.dueDate,
          impact: req.body.impact,
          categoryId: req.body.categoryId,
          relativeOrder,
        },
      });

      // Update count of tasks created today and tasks created in total (non-blocking)
      // This operation should also be included in the transaction if it affects the database
      const badgesCodes: string[] = await onTaskCreated(task);

      return { task, badges: badgesCodes };
    });

    res.json({
      data: result,
    });
  } catch (error) {
    // Handle errors
    res
      .status(500)
      .json({ message: 'An error occurred during the task creation process' });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  const data = removeUndefinedValuesFromPayload(req.body);
  let badges: string[] = [];
  let pointsAwarded = 0;

  try {
    const result = await prisma.$transaction(async (prisma) => {
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
          userId: req.user.id,
        },
        data,
        include: taskExternalFieldsToInclude,
      });

      // Handle kanban moving
      if (data.relativeOrder !== undefined) {
        await onTaskOrderUpdated({ originalTask, data });
      }

      // Handle status change to award badges and points
      if (data.status) {
        const { badgesCodes, points } = await onTaskStatusUpdated({
          originalTask,
          newStatus: data.status,
        });

        badges = badgesCodes;
        pointsAwarded = points;
      }

      return { task, badges, pointsAwarded };
    });

    res.json({
      data: result,
    });
  } catch (error) {
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
  await prisma.task.delete({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  res.json(okResponse());
};

import prisma from '../db';
import { removeUndefinedValuesFromPayload } from '../utils/functions';
import { okResponse } from '../utils/response';

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
    include: {
      checklistItems: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
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
  });

  if (!task) {
    return res.status(404).json({
      message: 'Task not found',
    });
  }

  // get checklist items
  const checklistItems = await prisma.checklistItem.findMany({
    where: {
      taskId: task.id,
    },
  });

  res.json({
    data: {
      ...task,
      checklistItems,
    },
  });
};

// Create a task
export const createTask = async (req, res) => {
  // calculate relative order, that is the order of the last task that has the same status + 1
  const relativeOrder = await prisma.task.count({
    where: {
      userId: req.user.id,
      status: req.body.status,
    },
  });

  const task = await prisma.task.create({
    data: {
      userId: req.user.id,
      emoji: req.body.emoji,
      title: req.body.title,
      description: req.body.description,
      dueDate: new Date(req.body.dueDate),
      impact: req.body.impact,
      categoryId: req.body.categoryId,
      relativeOrder,
    },
  });

  res.json({
    data: task,
  });
};

// Update a task
export const updateTask = async (req, res) => {
  /**
   * TODO: refactor to use a transaction (https://www.prisma.io/docs/concepts/components/prisma-client/transactions#transactions)
   */

  /**
   * Update task is composed of:
   * - handling kanban moving (relativeOrder is in the payload)
   * - update statusHistory on status change
   * - TODO: add points to user on task completion (points amount TBD) - do not allocate points if task was already completed in the past
   */
  const data = removeUndefinedValuesFromPayload(req.body);

  // Retrieve original task
  const originalTask = await prisma.task.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!originalTask) {
    return res.status(404).json({
      message: 'Task not found',
    });
  }

  // Handle kanban moving
  if (data.relativeOrder !== undefined) {
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

  // Update status history if status changed
  if (data.status) {
    await prisma.statusUpdate.create({
      data: {
        status: data.status,
        taskId: originalTask.id,
      },
    });
  }

  const task = await prisma.task.update({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    data,
    include: {
      checklistItems: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json({
    data: task,
  });
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

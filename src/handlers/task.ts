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
  const data = removeUndefinedValuesFromPayload(req.body);

  // handle kanban moving
  if (data.relativeOrder !== undefined) {
    const task = await prisma.task.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    if (task.status === data.status) {
      const isMovingUp = data.relativeOrder < task.relativeOrder;

      const tasksToMove = await prisma.task.findMany({
        where: {
          relativeOrder: isMovingUp
            ? { gte: data.relativeOrder }
            : { lte: data.relativeOrder },
          status: task.status,
          id: { not: task.id },
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
    }
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

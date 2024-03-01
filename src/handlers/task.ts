import prisma from '../db';
import { removeUndefinedValuesFromPayload } from '../utils/functions';
import { okResponse } from '../utils/response';

// Get all user's tasks
export const getTasks = async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: {
      userId: req.user.id,
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
  const task = await prisma.task.create({
    data: {
      userId: req.user.id,
      emoji: req.body.emoji,
      title: req.body.title,
      description: req.body.description,
      dueDate: new Date(req.body.dueDate),
      impact: req.body.impact,
      categoryId: req.body.categoryId,
    },
  });

  res.json({
    data: task,
  });
};

// Update a task
export const updateTask = async (req, res) => {
  // the user could send only the fields he wants to update
  // so we need to filter the undefined values and update only the ones that are not undefined
  const data = removeUndefinedValuesFromPayload(req.body);

  const task = await prisma.task.update({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    data,
  });

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

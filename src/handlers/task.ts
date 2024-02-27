import prisma from '../db';

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

  res.json({
    data: task,
  });
};

// Create a task
export const createTask = async (req, res) => {
  const task = await prisma.task.create({
    data: {
      emoji: req.body.emoji,
      title: req.body.title,
      description: req.body.description,
      dueDate: new Date(req.body.dueDate),
      impact: req.body.impact,
      userId: req.user.id,
      categoryId: req.body.categoryId,
    },
  });

  res.json({
    data: task,
  });
};

// TODO: implement updateTask, deleteTask, addChecklistItem, updateChecklistItem, deleteChecklistItem....

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

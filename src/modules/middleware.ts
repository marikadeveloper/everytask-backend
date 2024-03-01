import { validationResult } from 'express-validator';
import prisma from '../db';

/**
 * Input errors middleware
 */
export const handleInputErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    next();
  }
};

/**
 * Task ownership middleware
 */
export const checkTaskOwnership = async (req, res, next) => {
  const task = await prisma.task.findUnique({
    where: {
      id: req.body.taskId || req.params.id,
      userId: req.user.id,
    },
  });

  if (!task) {
    return res.status(404).json({
      message: 'Task not found',
    });
  }

  next();
};

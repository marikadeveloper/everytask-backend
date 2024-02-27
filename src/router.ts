import { Router } from 'express';
import { body } from 'express-validator';
import { createTask, getOneTask, getTasks } from './handlers/task';
import { me } from './handlers/user';
import { handleInputErrors } from './modules/middleware';
import { TaskImpact } from './types/enums';

const router = Router();

/**
 * Current logged user (not used in the frontend for now)
 */
router.get('/me', me);

/**
 * Task
 */
router.get('/tasks', getTasks);
router.get('/tasks/:id', getOneTask);
router.post(
  '/tasks',
  body('title').isString(),
  body('dueDate').isString(),
  body('impact').isIn(Object.values(TaskImpact)),
  handleInputErrors,
  createTask,
);

// TODO: put, delete

router.use((err, req, res, next) => {
  if (err.type === 'auth') {
    res.status(401).json({
      message: 'Unauthorized',
    });
  } else if (err.type === 'input') {
    res.status(400).json({
      message: 'Invalid input',
      error: err.error,
    });
  } else {
    res.status(500).json({
      error: "That's on me",
    });
  }
  console.error(err.stack);
});

export default router;

import { Router } from 'express';
import { body } from 'express-validator';
import {
  createChecklistItem,
  deleteChecklistItem,
  updateChecklistItem,
} from './handlers/checklist-item';
import {
  createTask,
  deleteTask,
  getOneTask,
  getTasks,
  updateTask,
} from './handlers/task';
import { deleteUser, me, updateUser } from './handlers/user';
import { checkTaskOwnership, handleInputErrors } from './modules/middleware';
import { TaskImpact, TaskStatus } from './types/enums';

const router = Router();

/**
 * User
 */
router.get('/me', me);
router.put(
  '/me',
  body('name').optional().isString(),
  body('dateFormat').optional().isString(),
  updateUser,
);
router.delete('/me', deleteUser);

/**
 * Task
 */
router.post('/tasks', getTasks);
router.get('/tasks/:id', getOneTask);
router.post(
  '/task',
  body('emoji').optional().isString(),
  body('title').exists().isString(),
  body('description').optional().isString(),
  body('status').optional().isIn(Object.values(TaskStatus)),
  body('dueDate').exists().isString(),
  body('categoryId').optional().isString(),
  body('impact').exists().isIn(Object.values(TaskImpact)),
  handleInputErrors,
  createTask,
);
router.put(
  '/tasks/:id',
  body('emoji').optional().isString(),
  body('title').optional().isString(),
  body('description').optional().isString(),
  body('status').optional().isIn(Object.values(TaskStatus)),
  body('dueDate').optional().isString(),
  body('categoryId').optional().isString(),
  body('impact').optional().isIn(Object.values(TaskImpact)),
  body('relativeOrder').optional().isInt(),
  checkTaskOwnership,
  updateTask,
);
router.delete('/tasks/:id', checkTaskOwnership, deleteTask);
/**
 * Checklist items
 */
router.post(
  '/checklist-items',
  body('title').exists().isString(),
  body('taskId').exists().isString(),
  handleInputErrors,
  checkTaskOwnership,
  createChecklistItem,
);
router.put(
  '/checklist-items/:id',
  body('taskId').exists().isString(),
  body('title').optional().isString(),
  body('order').optional().isInt(),
  handleInputErrors,
  checkTaskOwnership,
  updateChecklistItem,
);
router.delete(
  '/checklist-items/:id',
  body('taskId').exists().isString(),
  handleInputErrors,
  checkTaskOwnership,
  deleteChecklistItem,
);

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

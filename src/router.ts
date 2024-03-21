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
import { changePassword, deleteUser, me, updateUser } from './handlers/user';
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
router.post(
  '/change-password',
  body('oldPassword').exists().isString(),
  body('password').exists().isString(),
  body('passwordConfirmation').exists().isString(),
  changePassword,
);

/**
 * Task
 */
router.post('/tasks', getTasks);
router.get('/tasks/:id', getOneTask);
router.post(
  '/task',
  body('dueDate').exists().isString(),
  body('impact').exists().isIn(Object.values(TaskImpact)),
  body('title').exists().isString(),
  body('categoryId').optional().isString(),
  body('description').optional().isString(),
  body('emoji').optional().isString(),
  handleInputErrors,
  createTask,
);
router.put(
  '/tasks/:id',
  body('categoryId').optional().isString(),
  body('description').optional().isString(),
  body('dueDate').optional().isString(),
  body('emoji').optional().isString(),
  body('impact').optional().isIn(Object.values(TaskImpact)),
  body('relativeOrder').optional().isInt(),
  body('status').optional().isIn(Object.values(TaskStatus)),
  body('title').optional().isString(),
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

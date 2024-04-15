import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from './handlers/category';
import {
  createChecklistItem,
  deleteChecklistItem,
  updateChecklistItem,
} from './handlers/checklist-item';
import {
  getMyAverageCompletionTimeByImpact,
  getMyBadges,
  getMyFastestTaskCompletion,
  getMyMostBusyHoursAndDays,
  getMyMostTasksCompletedInSingleDay,
  getMyStreak,
  getMyTaskCompletionCalendar,
  getMyTasksByCategory,
  getMyTasksByImpact,
  getMyTasksByStatus,
} from './handlers/stats';
import {
  createTask,
  deleteTask,
  getDashboardTasks,
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
router.post(
  '/change-password',
  body('oldPassword').exists().isString(),
  body('password').exists().isString(),
  body('passwordConfirmation').exists().isString(),
  changePassword,
);
router.delete('/me', deleteUser);

/**
 * Task
 */
router.post('/tasks', getTasks);
router.get('/tasks/:id', getOneTask);
router.post(
  '/task',
  body('updatedAt').exists().isString(),
  body('dueDate').exists().isString(),
  body('impact').exists().isIn(Object.values(TaskImpact)),
  body('title').exists().isString().trim().notEmpty().isLength({ min: 1 }),
  body('categoryId').optional().isString(),
  body('description').optional().isString(),
  body('emoji').optional().isString(),
  handleInputErrors,
  createTask,
);
router.put(
  '/tasks/:id',
  body('updatedAt').exists().isString(),
  body('categoryId').optional().isString(),
  body('description').optional().isString(),
  body('dueDate').optional().isString(),
  body('emoji').optional().isString(),
  body('impact').optional().isIn(Object.values(TaskImpact)),
  body('relativeOrder').optional().isInt(),
  body('status').optional().isIn(Object.values(TaskStatus)),
  body('title').optional().isString().trim().notEmpty().isLength({ min: 1 }),
  checkTaskOwnership,
  updateTask,
);
router.delete('/tasks/:id', checkTaskOwnership, deleteTask);
router.get(
  '/dashboard-tasks/:date',
  param('date').exists().isString(),
  getDashboardTasks,
);
/**
 * Checklist items
 */
router.post(
  '/checklist-items',
  body('title').exists().isString().trim().notEmpty().isLength({ min: 1 }),
  body('taskId').exists().isString(),
  handleInputErrors,
  checkTaskOwnership,
  createChecklistItem,
);
router.put(
  '/checklist-items/:id',
  body('taskId').exists().isString(),
  body('title').optional().isString().trim().notEmpty().isLength({ min: 1 }),
  body('order').optional().isInt(),
  handleInputErrors,
  checkTaskOwnership,
  updateChecklistItem,
);
router.delete(
  '/checklist-items/:id',
  handleInputErrors,
  checkTaskOwnership,
  deleteChecklistItem,
);

/**
 * Categories
 */
router.get('/categories', getCategories);
router.post(
  '/categories',
  body('name').exists().isString().trim().notEmpty(),
  handleInputErrors,
  createCategory,
);
router.put(
  '/categories/:id',
  body('name').exists().isString(),
  handleInputErrors,
  updateCategory,
);
router.delete('/categories/:id', deleteCategory);

/**
 * Stats
 */
router.get('/my-fastest-task-completion', getMyFastestTaskCompletion);
router.get('/my-most-productive-day', getMyMostTasksCompletedInSingleDay);
router.get('/my-tasks-by-status', getMyTasksByStatus);
router.get('/my-tasks-by-impact', getMyTasksByImpact);
router.get('/my-tasks-by-category', getMyTasksByCategory);
router.get('/my-task-completion-calendar', getMyTaskCompletionCalendar);
router.get('/my-most-busy-times', getMyMostBusyHoursAndDays);
router.get(
  '/my-average-completion-times-by-impact',
  getMyAverageCompletionTimeByImpact,
);
// Gamification stats
router.get('/my-badges', getMyBadges);
router.get('/my-streak', getMyStreak);

router.use((err, req, res, next) => {
  if (err.type === 'auth') {
    res.status(401).json({
      message: 'Unauthorized',
    });
  } else {
    res.status(500).json({
      error: "That's on me",
    });
  }
  console.error(err.stack);
});

export default router;

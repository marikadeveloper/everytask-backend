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
import { me } from './handlers/user';
import { checkTaskOwnership, handleInputErrors } from './modules/middleware';
import { TaskImpact } from './types/enums';

const router = Router();

/**
 * Current logged user (not used in the frontend for now)
 */
router.get('/me', me);

/**
 * Task
 */
/**
 * @swagger
 * components:
 *  schemas:
 *    Task:
 *      type: object
 *      required:
 *        - title
 *        - dueDate
 *        - impact
 *      properties:
 *        id:
 *          type: string
 *          description: The auto-generated id of the task
 *        emoji:
 *          type: string
 *          description: The emoji of the task
 *        title:
 *          type: string
 *          description: The title of the task
 *        description:
 *          type: string
 *          description: The description of the task
 *        status:
 *          type: enum ['TODO', 'IN_PROGRESS', 'DONE']
 *          description: The status of the task
 *        dueDate:
 *          type: string
 *          format: date-time
 *          description: The due date of the task
 *        createdAt:
 *          type: string
 *          format: date-time
 *          description: The date the task was created
 *        categoryId:
 *          type: string
 *          description: The category id of the task
 *        userId:
 *          type: string
 *          description: The id of the user who created the task
 *        impact:
 *          type: enum ['HIGH_IMPACT_HIGH_EFFORT', 'HIGH_IMPACT_LOW_EFFORT', 'LOW_IMPACT_HIGH_EFFORT', 'LOW_IMPACT_LOW_EFFORT']
 *          description: The impact of the task taking into account the effort and the impact
 *
 *
 *
 */
router.get('/tasks', getTasks);
router.get('/tasks/:id', getOneTask);
router.post(
  '/tasks',
  body('emoji').optional().isString(),
  body('title').exists().isString(),
  body('description').optional().isString(),
  body('status').exists().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
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
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
  body('dueDate').optional().isString(),
  body('categoryId').optional().isString(),
  body('impact').optional().isIn(Object.values(TaskImpact)),
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

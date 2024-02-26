import { Router } from 'express';
import { body } from 'express-validator';
import { createTask, getOneTask, getTasks } from './handlers/task';
import { handleInputErrors } from './modules/middleware';

const router = Router();

/**
 * Product
 */
// router.get('/product', getProducts);
// router.get('/product/:id', getOneProduct);
// // req.body must have a field called name
// router.put(
//   '/product/:id',
//   body('name').isString(),
//   handleInputErrors,
//   updateProduct,
// );
// router.post(
//   '/product',
//   body('name').isString(),
//   handleInputErrors,
//   createProduct,
// );
// router.delete('/product/:id', deleteProduct);

/**
 * Task
 */
router.get('/tasks', getTasks);
router.get('/tasks/:id', getOneTask);
router.post(
  '/tasks',
  body('title').isString(),
  body('dueDate').isString(),
  body('impact').isIn([
    'HIGH_IMPACT_HIGH_EFFORT',
    'HIGH_IMPACT_LOW_EFFORT',
    'LOW_IMPACT_HIGH_EFFORT',
    'LOW_IMPACT_LOW_EFFORT',
  ]),
  handleInputErrors,
  createTask,
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

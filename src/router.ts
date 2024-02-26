import { Router } from 'express';
import { getOneTask, getTasks } from './handlers/task';

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
router.get('/task/:id', getOneTask);

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

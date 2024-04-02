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
 *      example:
 *        id: abcde
 *        emoji: 🚀
 *        title: Finish the backend
 *        description: Finish the backend of the application
 *        status: TODO
 *        dueDate: 2024-12-31T23:59:59.999Z
 *        createdAt: 2024-01-01T23:59:59.999Z
 *        categoryId: abcde
 *        userId: abcde
 *        impact: HIGH_IMPACT_HIGH_EFFORT
 */

/**
 * @swagger
 * components:
 *  schemas:
 *    TaskUpdate:
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
 *        categoryId:
 *          type: string
 *          description: The category id of the task
 *        impact:
 *          type: enum ['HIGH_IMPACT_HIGH_EFFORT', 'HIGH_IMPACT_LOW_EFFORT', 'LOW_IMPACT_HIGH_EFFORT', 'LOW_IMPACT_LOW_EFFORT']
 *          description: The impact of the task taking into account the effort and the impact
 *      example:
 *        emoji: 🚀
 *        title: Finish the backend
 *        description: Finish the backend of the application
 *        status: TODO
 *        dueDate: 2024-12-31T23:59:59.999Z
 *        categoryId: abcde
 *        impact: HIGH_IMPACT_HIGH_EFFORT
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Returns a list of all tasks.
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     description: Returns a single task object for the given ID.
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */

/**
 * @swagger
 * /task:
 *   post:
 *     summary: Create a new task
 *     description: Creates a new task with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request (validation errors)
 */

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a specific task by ID
 *     description: Updates an existing task with the provided details.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the task
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdate'  # Define a separate schema for update
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request (validation errors)
 *       404:
 *         description: Task not found
 *       403:
 *         description: You are not authorized to update this task
 */

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a specific task by ID
 *     description: Deletes a task with the given ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the task
 *         type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       403:
 *         description: You are not authorized to delete this task
 */

/**
 * @swagger
 * /dashboard-tasks:
 *   get:
 *     summary: Get tasks for the dashboard
 *     description: Returns a list of tasks relevant to the dashboard.
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */

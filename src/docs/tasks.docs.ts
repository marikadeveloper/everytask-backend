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

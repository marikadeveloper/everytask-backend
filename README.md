# Everytask Backend

Hello :)

## Badge Bonanza!

https://www.prisma.io/docs/pulse/api-reference#create

### Ice Breaker - Complete your first task.

### Early Bird - Complete 3 tasks before noon.

Tabella TasksBeforeNoon con un campo `count` che tiene traccia del numero di task completati prima di mezzogiorno.

### Night Owl - Finish 2 tasks after 10 PM.

Tabella TasksAfterTenPM con un campo `count` che tiene traccia del numero di task completati dopo le 22:00.

### Busy Bee - Complete 5 tasks in a single day.

### Over Achiever - Finish 10 tasks in a single day.

### Streak Starter - Begin a 3-day task completion streak.

Quando nella tabella UserStreak c'è un record con `streak` uguale a 3.

### Persistence Pays Off - Maintain a 7-day completion streak.

Quando nella tabella UserStreak c'è un record con `streak` uguale a 7.

### Weekend Warrior - Conquer 5 tasks over the weekend.

Tabella TasksWeekend con un campo `count` che tiene traccia del numero di task completati durante il weekend.

### Small Wins Matter - Celebrate completing 3 tiny tasks (e.g., making your bed).

Tabella TinyTasks con un campo `count` che tiene traccia del numero di task completati.

### Epic Achiever - Finish a particularly difficult or long-term task.

Se completo un task con un valore di difficoltà alto.

### Overcomer - Finish a task you procrastinated on for a week.

Quando finisco un task, controllare se è stato creato una settimana fa.

### Early Completion - Finish a major task significantly ahead of schedule.

Quando finisco un task, controllare se è stato completato entro 5gg dalla scadenza.

### Master Organizer - Categorize and tag 10 tasks effectively.

Tabella CategorizedTasks con un campo `count` che tiene traccia del numero di task categorizzati.

### Streak Superstar - Maintain a 30-day completion streak.

Quando nella tabella UserStreak c'è un record con `streak` uguale a 30.

### Level Up Legend - Reach the highest user level in the app.

Quando do ad un utente il massimo livello, gli assegno questa medaglia.

### Bug Buster - Report and help fix a bug in the app.

### Appreciation Award: Receive a special badge from the app developers.

### Hundo Hustler - Complete 100 tasks.

### Task Titan - Complete 500 tasks.

### All-Star Achiever - Get all the badges in the app.

## Stats Ideas

Given the structure of your Prisma schema, you can create a variety of statistics queries to provide insightful data for a "Statistics" page in your app. Here are a few ideas that could be visualized with charts:

1. **Tasks Over Time**: Show the number of tasks created, completed, and in progress over time (daily, weekly, monthly). This can give users a sense of their productivity trends.

   ```prisma
   // For created tasks
   SELECT DATE_TRUNC('day', createdAt) AS date, COUNT(*) AS total
   FROM Task
   GROUP BY date
   ORDER BY date;

   // For completed tasks
   SELECT DATE_TRUNC('day', firstCompletedAt) AS date, COUNT(*) AS total
   FROM Task
   WHERE status = 'DONE'
   GROUP BY date
   ORDER BY date;
   ```

2. **Task Status Distribution**: Display the distribution of tasks by their current status (TODO, IN_PROGRESS, DONE). This helps users understand their workload.

   ```prisma
   SELECT status, COUNT(*) AS total
   FROM Task
   GROUP BY status;
   ```

3. **Impact and Effort Analysis**: Show the number of tasks by their impact and effort level. This can help users evaluate if they are focusing on the right tasks.

   ```prisma
   SELECT impact, COUNT(*) AS total
   FROM Task
   GROUP BY impact;
   ```

4. **User Points and Levels Over Time**: Track how users' points and levels change over time, which can be motivating for users to see their progress.

   ```prisma
   // Assuming you log points and level changes, you could query something like:
   SELECT DATE_TRUNC('day', updatedAt) AS date, AVG(points) AS average_points, AVG(level) AS average_level
   FROM User
   GROUP BY date
   ORDER BY date;
   ```

5. **Task Completion Time**: Analyze the average time it takes for tasks to move from TODO to DONE. This can help users understand their efficiency.

   ```prisma
   // This requires calculating the difference between createdAt and firstCompletedAt for tasks that are done.
   SELECT AVG(firstCompletedAt - createdAt) AS average_completion_time
   FROM Task
   WHERE status = 'DONE';
   ```

6. **Daily Task Statistics**: Utilize the `TaskDailyStat` model to show daily created, completed, and in-progress tasks. This provides a quick overview of daily activity.

   ```prisma
   SELECT date, created, completed, inProgress
   FROM TaskDailyStat
   WHERE userId = 'specific-user-id' // Filter by user ID
   ORDER BY date;
   ```

7. **Streaks and Badges**: Display the current streak and the longest streak of task completions, along with badges earned over time. This can be a fun way to gamify productivity.

   ```prisma
   // For streaks
   SELECT current, longest
   FROM Streak
   WHERE userId = 'specific-user-id';

   // For badges
   SELECT Badge.name, UserBadge.earnedAt
   FROM UserBadge
   JOIN Badge ON UserBadge.badgeId = Badge.code
   WHERE UserBadge.userId = 'specific-user-id'
   ORDER BY UserBadge.earnedAt;
   ```

To implement these queries using Prisma, you would use the Prisma Client API in your application's backend. The SQL-like queries above are conceptual and need to be translated into Prisma Client queries or raw SQL queries executed through Prisma's raw query capabilities, depending on your preference and the complexity of the query.

Bar Chart: This is useful for comparing the quantity of tasks in different categories, statuses, or impacts.

Pie Chart: This can be used to show the proportion of tasks in different statuses or categories.

Line Chart: This is great for showing the trend of tasks created or completed over time.

Stacked Bar Chart: This can be used to show the distribution of task statuses over time.

Histogram: This can be used to show the distribution of task creation or completion times.

Heatmap: This can be used to show the frequency of task completions on different days of the week or hours of the day.

Area Chart: This can be used to show the cumulative number of tasks created or completed over time.

Scatter Plot: This can be used to show the correlation between two variables, such as task creation time and completion time.

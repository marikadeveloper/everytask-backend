/**
 *
 */
async function checkBadges(user, task) {
  const badges = [];
  const earnedBadges = [];

  for (const badge of badges) {
    if (await badge.condition(user, task)) {
      earnedBadges.push(badge.code);
    }
  }

  return earnedBadges;
}

// export async function importBadges() {
//   const badges: { code: string; name: string; description: string }[] = [
//     {
//       code: 'early-bird',
//       name: 'Early Bird',
//       description: 'Complete 3 tasks before noon',
//     },
//     {
//       code: 'night-owl',
//       name: 'Night Owl',
//       description: 'Finish 2 tasks after 10pm',
//     },
//     {
//       code: 'busy-bee',
//       name: 'Busy Bee',
//       description: 'Complete 5 tasks in one day',
//     },
//     {
//       code: 'over-achiever',
//       name: 'Over Achiever',
//       description: 'Complete 10 tasks in one day',
//     },
//     {
//       code: 'workaholic',
//       name: 'Workaholic',
//       description: 'Complete 20 tasks in one day',
//     },
//     {
//       code: 'first-task',
//       name: 'First Task',
//       description: 'Complete your first task',
//     },
//     { code: '100-tasks', name: '100 Tasks', description: 'Complete 100 tasks' },
//     { code: '500-tasks', name: '500 Tasks', description: 'Complete 500 tasks' },
//     {
//       code: '1000-tasks',
//       name: '1000 Tasks',
//       description: 'Complete 1000 tasks',
//     },
//     {
//       code: '5000-tasks',
//       name: '5000 Tasks',
//       description: 'Complete 5000 tasks',
//     },
//     {
//       code: '10000-tasks',
//       name: '10000 Tasks',
//       description: 'Complete 10000 tasks',
//     },
//     {
//       code: 'streak-starter',
//       name: 'Streak Starter',
//       description: 'Begin a 3-day task completion streak',
//     },
//     {
//       code: 'persistence-pays-off',
//       name: 'Persistence Pays Off',
//       description: 'Maintain a 7-day completion streak',
//     },
//     {
//       code: 'weekend-warrior',
//       name: 'Weekend Warrior',
//       description: 'Conquer 5 tasks over the weekend',
//     },
//     {
//       code: 'power-hour',
//       name: 'Power Hour',
//       description: 'Complete 3 focused tasks within an hour',
//     },
//     {
//       code: 'multitasker-master',
//       name: 'Multitasker Master',
//       description: 'Finish 2 tasks from different categories in one sitting',
//     },
//     {
//       code: 'small-wins-matter',
//       name: 'Small Wins Matter',
//       description: 'Celebrate completing 3 tiny tasks (e.g., making your bed)',
//     },
//     {
//       code: 'planning-pro',
//       name: 'Planning Pro',
//       description: 'Schedule future tasks for the week ahead',
//     },
//     {
//       code: 'epic-achiever',
//       name: 'Epic Achiever',
//       description: 'Finish a particularly difficult or long-term task',
//     },
//     {
//       code: 'overcomer',
//       name: 'Overcomer',
//       description: 'Finish a task you procrastinated on for a week',
//     },
//     {
//       code: 'early-completion',
//       name: 'Early Completion',
//       description: 'Finish a major task significantly ahead of schedule',
//     },
//     {
//       code: 'organized-master',
//       name: 'Organized Master',
//       description: 'Categorize and tag 10 tasks effectively',
//     },
//     {
//       code: 'productivity-peak',
//       name: 'Productivity Peak',
//       description: 'Achieve a perfect week with 100% task completion',
//     },
//     {
//       code: 'streak-superstar',
//       name: 'Streak Superstar',
//       description: 'Maintain a 30-day completion streak',
//     },
//     {
//       code: 'level-up-legend',
//       name: 'Level Up Legend',
//       description: 'Reach the highest user level in the app',
//     },
//     {
//       code: 'holiday-hustle',
//       name: 'Holiday Hustle',
//       description: 'Finish X tasks during a specific holiday week',
//     },
//     {
//       code: 'bug-buster',
//       name: 'Bug Buster',
//       description: 'Report and help fix a bug in the app',
//     },
//     {
//       code: 'appreciation-award',
//       name: 'Appreciation Award',
//       description: 'Receive a special badge from the app developers',
//     },
//   ];

//   // insert all badges in the database
//   await prisma.badge.createMany({
//     data: badges,
//   });

//   console.log('Badges imported');
// }

/**
 * Statistics page
 */

import { TASK_STATUS } from '@prisma/client';
import dayjs from 'dayjs';
import prisma from '../db';

// get user badges
// frontend: simple list
/**
 * return example:
	"badges": [
		{
			"id": "ba4a7d42-60e5-4bc7-8537-bae39f0006f5",
			"earnedAt": "2024-03-26T16:36:13.056Z",
			"badge": {
				"code": "ice-breaker",
				"name": "Ice Breaker",
				"description": "Complete your first task",
				"icon": null
			}
		}
	]
 */
export const getMyBadges = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const myBadges = await prisma.userBadge.findMany({
    where: {
      userId: req.user.id,
    },
    select: {
      id: true,
      earnedAt: true,
      badge: true,
    },
  });

  const allBadges = await prisma.badge.findMany();

  res.json({ data: { myBadges, allBadges } });
};

// Tasks by status: Number and percentage of tasks in each status category (Todo, In Progress, Done).
// frontend: pie chart
/**
 * return example:
 * {
    "statusCount": {
      "IN_PROGRESS": 1,
      "DONE": 4
    },
    "statusPercentage": {
      "IN_PROGRESS": "20.00",
      "DONE": "80.00"
    }
  }
 */
export const getMyTasksByStatus = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  let where: { userId: string; createdAt?: any } = {
    userId: req.user.id,
  };

  const computationPeriodStart = req.body.computationPeriodStart;
  const computationPeriodEnd = req.body.computationPeriodEnd;

  if (computationPeriodEnd && computationPeriodStart) {
    // check if dates are valid
    if (!dayjs(computationPeriodStart).isValid()) {
      res
        .status(400)
        .json({ message: 'Invalid computation period start date' });
      return;
    }

    if (!dayjs(computationPeriodEnd).isValid()) {
      res.status(400).json({ message: 'Invalid computation period end date' });
      return;
    }

    // check if start date is before end date
    if (dayjs(computationPeriodStart).isAfter(computationPeriodEnd)) {
      res.status(400).json({ message: 'Invalid computation period' });
      return;
    }

    where = {
      ...where,
      createdAt: {
        gte: computationPeriodStart,
        lte: computationPeriodEnd,
      },
    };
  }

  const tasks = await prisma.task.findMany({
    where,
    select: {
      status: true,
    },
  });

  const statusCount = tasks.reduce((acc, task) => {
    acc[task.status] = acc[task.status] ? acc[task.status] + 1 : 1;
    return acc;
  }, {});

  const totalTasks = tasks.length;

  const statusPercentage = Object.keys(statusCount).reduce((acc, key) => {
    acc[key] = ((statusCount[key] / totalTasks) * 100).toFixed(2);
    return acc;
  }, {});

  res.json({ data: { statusCount, statusPercentage } });
};

// Tasks by impact: Number and percentage of tasks in each impact category (Low, Medium, High).
// frontend: pie chart
/**
 * return example:
 * {
    "impactCount": {
      "HIGH_IMPACT_LOW_EFFORT": 2,
      "HIGH_IMPACT_HIGH_EFFORT": 2,
      "LOW_IMPACT_HIGH_EFFORT": 1
    },
    "impactPercentage": {
      "HIGH_IMPACT_LOW_EFFORT": "40.00",
      "HIGH_IMPACT_HIGH_EFFORT": "40.00",
      "LOW_IMPACT_HIGH_EFFORT": "20.00"
    }
  }
 */
export const getMyTasksByImpact = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  let where: { userId: string; createdAt?: any } = {
    userId: req.user.id,
  };

  const computationPeriodStart = req.body.computationPeriodStart;
  const computationPeriodEnd = req.body.computationPeriodEnd;

  if (computationPeriodEnd && computationPeriodStart) {
    // check if dates are valid
    if (!dayjs(computationPeriodStart).isValid()) {
      res
        .status(400)
        .json({ message: 'Invalid computation period start date' });
      return;
    }

    if (!dayjs(computationPeriodEnd).isValid()) {
      res.status(400).json({ message: 'Invalid computation period end date' });
      return;
    }

    // check if start date is before end date
    if (dayjs(computationPeriodStart).isAfter(computationPeriodEnd)) {
      res.status(400).json({ message: 'Invalid computation period' });
      return;
    }

    where = {
      ...where,
      createdAt: {
        gte: computationPeriodStart,
        lte: computationPeriodEnd,
      },
    };
  }

  const tasks = await prisma.task.findMany({
    where,
    select: {
      impact: true,
    },
  });

  const impactCount = tasks.reduce((acc, task) => {
    acc[task.impact] = acc[task.impact] ? acc[task.impact] + 1 : 1;
    return acc;
  }, {});

  const totalTasks = tasks.length;

  const impactPercentage = Object.keys(impactCount).reduce((acc, key) => {
    acc[key] = ((impactCount[key] / totalTasks) * 100).toFixed(2);
    return acc;
  }, {});

  res.json({ data: { impactCount, impactPercentage } });
};

// Tasks by category: Number of tasks in each category.
// frontend: pie chart
/**
 * return example:
 * {
    "categoryCount": {
      "uncategorized": 1,
      "home": 4
    },
    "categoryPercentage": {
      "uncategorized": "20.00",
      "home": "80.00"
    }
  }
 */
export const getMyTasksByCategory = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  let where: { userId: string; createdAt?: any } = {
    userId: req.user.id,
  };

  const computationPeriodStart = req.body.computationPeriodStart;
  const computationPeriodEnd = req.body.computationPeriodEnd;

  if (computationPeriodEnd && computationPeriodStart) {
    // check if dates are valid
    if (!dayjs(computationPeriodStart).isValid()) {
      res
        .status(400)
        .json({ message: 'Invalid computation period start date' });
      return;
    }

    if (!dayjs(computationPeriodEnd).isValid()) {
      res.status(400).json({ message: 'Invalid computation period end date' });
      return;
    }

    // check if start date is before end date
    if (dayjs(computationPeriodStart).isAfter(computationPeriodEnd)) {
      res.status(400).json({ message: 'Invalid computation period' });
      return;
    }

    where = {
      ...where,
      createdAt: {
        gte: computationPeriodStart,
        lte: computationPeriodEnd,
      },
    };
  }

  const tasks = await prisma.task.findMany({
    where,
    select: {
      category: true,
    },
  });

  const categoryCount = tasks.reduce((acc, task) => {
    acc[task.category?.name || 'uncategorized'] = acc[
      task.category?.name || 'uncategorized'
    ]
      ? acc[task.category?.name || 'uncategorized'] + 1
      : 1;
    return acc;
  }, {});

  const categoryPercentage = Object.keys(categoryCount).reduce((acc, key) => {
    acc[key] = ((categoryCount[key] / tasks.length) * 100).toFixed(2);
    return acc;
  }, {});

  res.json({ data: { categoryCount, categoryPercentage } });
};

// Current streak
// frontend: simple number
/**
 * return example:
	"streak": {
		"id": "7866c513-4c91-4191-a5f8-00cf573312a6",
		"startDate": "2024-03-26T16:36:13.062Z",
		"updatedAt": "2024-03-27T14:28:53.728Z",
		"current": 1,
		"longest": 2,
		"userId": "d1fffe0a-2e6d-458c-b976-ca14ef67bc3d"
	}
}
 */
export const getMyStreak = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const streak = await prisma.streak.findUnique({
    where: {
      userId: req.user.id,
    },
  });

  res.json({ data: streak });
};

// Most tasks completed in a single day
// frontend: simple number
/**
 * return example:
 * {
    "mostTasksCompleted": {
      "date": "2024-03-26",
      "tasks": 3
    }
  }
 */
export const getMyMostTasksCompletedInSingleDay = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: req.user.id,
      firstCompletedAt: {
        not: null,
      },
    },
    select: {
      firstCompletedAt: true,
    },
  });

  const tasksByDate = tasks.reduce((acc, task) => {
    const date = dayjs(task.firstCompletedAt).format('YYYY-MM-DD');

    acc[date] = acc[date] ? acc[date] + 1 : 1;

    return acc;
  }, {});

  const mostTasksCompleted = Object.keys(tasksByDate).reduce(
    (mostTasks, date) => {
      if (tasksByDate[date] > mostTasks.tasks) {
        mostTasks.date = date;
        mostTasks.tasks = tasksByDate[date];
      }

      return mostTasks;
    },
    { date: '', tasks: 0 },
  );

  res.json({ data: mostTasksCompleted });
};

// Fastest task completion time (in minutes)
// frontend: simple number
/**
 * return example:
 * {
    "fastestTaskCompletion": {
      "title": "Task 1",
      "time": "1.00"
    }
  }
 */
export const getMyFastestTaskCompletion = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: req.user.id,
      status: 'DONE',
    },
    select: {
      title: true,
      createdAt: true,
      firstCompletedAt: true,
    },
  });

  const fastestTask = tasks.reduce(
    (fastest, task) => {
      const completionTime = dayjs(task.firstCompletedAt).diff(
        task.createdAt,
        'minutes',
      );

      if (completionTime < fastest.time) {
        fastest.title = task.title;
        fastest.time = completionTime;
      }

      return fastest;
    },
    { title: '', time: Infinity },
  );

  res.json({ data: fastestTask });
};

// Get last two months of task completion
// https://nivo.rocks/calendar/
/**
 * return example:
 * {
	"taskCompletionCalendar": [
		{
			"day": "2024-03-26",
			"value": 3
		},
		{
			"day": "2024-03-27",
			"value": 2
		}
	]
}
 */
export const getMyTaskCompletionCalendar = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const dailyStats = await prisma.taskDailyStat.findMany({
    where: {
      userId: req.user.id,
      date: {
        gte: dayjs().subtract(2, 'month').toISOString(),
      },
    },
    select: {
      date: true,
      completed: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  if (!dailyStats.length) {
    res.json({ data: { calendar: [], from: '', to: '' } });
    return;
  }

  const taskCompletionCalendar = dailyStats.map((stat) => ({
    day: dayjs(stat.date).format('YYYY-MM-DD'),
    value: stat.completed,
  }));

  const from = dayjs(dailyStats[0].date).startOf('month').format('YYYY-MM-DD');
  const to = dayjs(dailyStats[dailyStats.length - 1].date)
    .endOf('month')
    .format('YYYY-MM-DD');

  res.json({ data: { calendar: taskCompletionCalendar, from, to } });
};

// Most busy hours and days - show the frequency of task completions on different days of the week or hours of the day
// frontend: heatmap
/**
 * return example:
 * [
 * {
    "id": "monday", // day of the week
    "data": [
      {
        "x": "00:00", // hour
        "y": 2 // number of completed tasks
      },
      {
        "x": "01:00",
        "y": 3
      },
    ]
  },
  {
    "id": "tuesday",
    "data": [
      {
        "x": "00:00",
        "y": 1
      },
      {
        "x": "01:00",
        "y": 2
      },
    ]
  },
  ...
 * ]
 */
export const getMyMostBusyHoursAndDays = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const completedTasks = await prisma.task.findMany({
    where: {
      userId: req.user.id,
      status: TASK_STATUS.DONE,
    },
    select: {
      firstCompletedAt: true,
    },
    orderBy: {
      firstCompletedAt: 'asc',
    },
  });

  const busyDays = completedTasks.reduce((acc, task) => {
    const day = dayjs(task.firstCompletedAt).format('dddd');
    const hour = dayjs(task.firstCompletedAt).format('HH:00');

    if (!acc[day]) {
      acc[day] = {};
    }

    if (!acc[day][hour]) {
      acc[day][hour] = 0;
    }

    acc[day][hour]++;

    return acc;
  }, {});

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const hoursOfDay = Array.from(
    { length: 24 },
    (_, i) => i.toString().padStart(2, '0') + ':00',
  );

  const busyDaysArray = daysOfWeek.map((day) => ({
    id: day.toLowerCase().slice(0, 3),
    data: hoursOfDay.map((hour) => ({
      x: hour,
      y: busyDays[day]?.[hour] || 0,
    })),
  }));

  res.json({ data: busyDaysArray });
};

// Average completion time by impact (in minutes)
// frontend: bar chart
/**
 * return example:
 * {
    "averageCompletionTime": {
      "HIGH_IMPACT_HIGH_EFFORT": "10.00",
      "HIGH_IMPACT_LOW_EFFORT": "5.00",
      "LOW_IMPACT_HIGH_EFFORT": "20.00",
      "LOW_IMPACT_LOW_EFFORT": "15.00"
    }
  }
 */
export const getMyAverageCompletionTimeByImpact = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: req.user.id,
      status: TASK_STATUS.DONE,
    },
    select: {
      impact: true,
      createdAt: true,
      firstCompletedAt: true,
    },
  });

  const completionTimeByImpact = tasks.reduce((acc, task) => {
    const completionTime = dayjs(task.firstCompletedAt).diff(
      task.createdAt,
      'minutes',
    );

    if (!acc[task.impact]) {
      acc[task.impact] = {
        total: 0,
        count: 0,
      };
    }

    acc[task.impact].total += completionTime;
    acc[task.impact].count++;

    return acc;
  }, {});

  const averageCompletionTime = Object.keys(completionTimeByImpact).reduce(
    (acc, impact) => {
      acc[impact] = (
        completionTimeByImpact[impact].total /
        completionTimeByImpact[impact].count
      ).toFixed(2);
      return acc;
    },
    {},
  );

  res.json({ data: averageCompletionTime });
};

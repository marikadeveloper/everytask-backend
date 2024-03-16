import dayjs from 'dayjs';
import prisma from '../db';

export async function getTasksDoneTodayCount({
  userId,
  after = null,
  before = null,
}) {
  let start = dayjs().startOf('day').toDate();
  let end = dayjs(start).add(1, 'day').toDate();

  if (after) {
    // after is today's hour after which I should count the completed tasks
    start = dayjs(start).hour(after).toDate();
  }

  if (before) {
    // before is today's hour before which I should count the completed tasks
    end = dayjs(start).hour(before).toDate();
  }

  const tasksDoneTodayCount = await prisma.task.count({
    where: {
      userId: userId,
      firstCompletedAt: {
        gte: start,
        lt: end,
      },
    },
  });

  return tasksDoneTodayCount;
}

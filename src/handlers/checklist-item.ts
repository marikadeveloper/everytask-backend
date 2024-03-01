import prisma from '../db';
import { removeUndefinedValuesFromPayload } from '../utils/functions';
import { okResponse } from '../utils/response';

// Add a checklist item to a task
export const createChecklistItem = async (req, res) => {
  const taskId = req.body.taskId;
  // get checklist items
  const checklistItemsCount = await prisma.checklistItem.count({
    where: {
      taskId,
    },
  });

  // current item order is the length of the checklist items
  const order = checklistItemsCount;

  const item = await prisma.checklistItem.create({
    data: {
      taskId,
      order,
      title: req.body.title,
    },
  });

  res.json({
    data: item,
  });
};

// update a checklist item
export const updateChecklistItem = async (req, res) => {
  const data = removeUndefinedValuesFromPayload(req.body);

  const item = await prisma.checklistItem.update({
    where: {
      id: req.params.id,
    },
    data,
  });

  res.json({
    data: item,
  });
};

// delete a checklist item
export const deleteChecklistItem = async (req, res) => {
  await prisma.checklistItem.delete({
    where: {
      id: req.params.id,
    },
  });

  res.json(okResponse());
};

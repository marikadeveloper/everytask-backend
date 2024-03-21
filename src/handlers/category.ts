import prisma from '../db';
import { okResponse } from '../utils/response';

// Get all categories
export const getCategories = async (req, res) => {
  const categories = await prisma.category.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      name: 'asc',
    },
  });

  res.json({
    data: categories,
  });
};

// Create category
export const createCategory = async (req, res) => {
  const category = await prisma.category.create({
    data: {
      name: req.body.name,
      userId: req.user.id,
    },
  });

  res.json({
    data: category,
  });
};

// Update category
export const updateCategory = async (req, res) => {
  const category = await prisma.category.update({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    data: {
      name: req.body.name,
    },
  });

  if (!category) {
    return res.status(404).json({
      message: 'Category not found',
    });
  }

  res.json({
    data: category,
  });
};

// Delete category
export const deleteCategory = async (req, res) => {
  const category = await prisma.category.delete({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!category) {
    return res.status(404).json({
      message: 'Category not found',
    });
  }

  res.json(okResponse());
};

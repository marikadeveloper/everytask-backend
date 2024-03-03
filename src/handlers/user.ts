import prisma from '../db';
import {
  comparePasswords,
  createJWT,
  decodeJWT,
  hashPassword,
} from '../modules/auth';
import { sendEmail } from '../modules/email';
import { removeUndefinedValuesFromPayload } from '../utils/functions';
import { okResponse, userResponse } from '../utils/response';

// register a new user
export const createNewUser = async (req, res, next) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: req.body.email,
        password: await hashPassword(req.body.password),
      },
    });

    res.json(userResponse(user));
  } catch (e) {
    e.type = 'input';
    next(e);
  }
};

// sign in a user
export const signIn = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const isValid = await comparePasswords(req.body.password, user.password);

  if (!isValid) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  res.json(userResponse(user));
};

// send reset password email with new token
export const sendResetPasswordEmail = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = createJWT(user);
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  // send email with link
  try {
    sendEmail(req.body.email, {
      type: 'reset-password',
      data: {
        link,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error sending email' });
    return;
  }

  res.json(okResponse());
};

// Reset password
export const resetPassword = async (req, res) => {
  if (req.body.password !== req.body.passwordConfirmation) {
    res.status(400).json({ message: 'Passwords do not match' });
    return;
  }

  // get user from token
  const user = decodeJWT(req.body.token);

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // update user password
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: await hashPassword(req.body.password),
    },
  });

  res.json(okResponse());
};

// return current logged user - AUTHORIZED ROUTE
export const me = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  res.json(userResponse(req.user));
};

// update user - AUTHORIZED ROUTE
export const updateUser = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const data = removeUndefinedValuesFromPayload(req.body);

  const user = await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data,
  });

  res.json(userResponse(user));
};

// delete user - AUTHORIZED ROUTE
export const deleteUser = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  await prisma.user.delete({
    where: {
      id: req.user.id,
    },
  });

  res.json(okResponse());
};

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
    // check if password has min. 8 characters with at least one number, one uppercase and one lowercase letter
    const passwordRegex =
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
      res.status(400).json({
        message:
          'Password must have at least 8 characters with at least one number, one uppercase and one lowercase letter',
      });
      return;
    }

    const password = hashPassword(req.body.password);

    const user = await prisma.user.create({
      data: {
        email: req.body.email,
        name: req.body.name,
        password,
      },
    });

    // create TaskCounter for the new user
    prisma.taskCounter.create({
      data: {
        userId: user.id,
      },
    });

    res.json(userResponse(user));
  } catch (e) {
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

  // get user from db
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  res.json(userResponse(user));
};

// update user - AUTHORIZED ROUTE
export const updateUser = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // the only editable fields are name and dateFormat for now
  const { name, dateFormat } = req.body;

  const data = removeUndefinedValuesFromPayload({
    name,
    dateFormat,
  });

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

export const changePassword = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  // check if oldPassword is correct
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });

  const isValid = await comparePasswords(req.body.oldPassword, user.password);

  if (!isValid) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (req.body.password !== req.body.passwordConfirmation) {
    res.status(400).json({ message: 'Passwords do not match' });
    return;
  }

  await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      password: await hashPassword(req.body.password),
    },
  });

  res.json(okResponse());
};

import { createJWT } from '../modules/auth';
import { levels } from './level';

// Generic responses
export function okResponse() {
  return { ok: true };
}

// User responses
export function userResponse(user) {
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      dateFormat: user.dateFormat,
      points: user.points,
      level: levels[user.level],
    },
    token: createJWT(user),
  };
}

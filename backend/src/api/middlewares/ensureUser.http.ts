import type { Request, Response, NextFunction } from 'express';
import { User } from '../../models/User.js';
import type { AuthenticatedRequest } from './auth.http.js';
import { AppError } from '../../common/errors/AppError.js';
import { logger } from '../../config/logger.js';

/** Auth0 JWT payload shape (subset we use) */
interface Auth0Payload {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: unknown;
}

/**
 * Ensures a User document exists for the authenticated Auth0 user (req.userId from JWT sub).
 * Must run after authHttp. Finds by auth0Sub; creates if missing; updates profile if found.
 * Sets req.dbUser to the User document.
 */
export async function ensureUserInDb(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  const sub = authReq.userId ?? authReq.auth?.payload?.sub;
  if (!sub || typeof sub !== 'string') {
    next(new Error('ensureUserInDb: missing auth sub'));
    return;
  }

  const payload = (authReq.auth?.payload ?? {}) as Auth0Payload;
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const name = typeof payload.name === 'string' ? payload.name : undefined;
  const picture = typeof payload.picture === 'string' ? payload.picture : undefined;

  try {
    let user = await User.findOne({ auth0Sub: sub }).exec();

    if (!user) {
      if (!email) {
        logger.warn({ sub }, 'Auth0 token missing email; cannot create user');
        next(new Error('User sync failed: email required'));
        return;
      }
      user = await User.create({
        email,
        auth0Sub: sub,
        name,
        picture,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      logger.info({ userId: user._id.toString(), email: user.email }, 'User created from Auth0');
    } else {
      const updates: { updatedAt: Date; name?: string; picture?: string } = {
        updatedAt: new Date(),
      };
      if (name !== undefined) updates.name = name;
      if (picture !== undefined) updates.picture = picture;
      await User.updateOne({ _id: user._id }, { $set: updates }).exec();
      user = (await User.findById(user._id).exec()) ?? user;
    }

    authReq.dbUser = user;
    next();
  } catch (err: unknown) {
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code: number }).code : null;
    if (code === 11000) {
      next(AppError.conflict('Email already registered with another account'));
      return;
    }
    logger.error({ err, sub }, 'ensureUserInDb failed');
    next(err);
  }
}

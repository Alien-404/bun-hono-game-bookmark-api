import type { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { PrismaClient } from '@prisma/client';
import type { JWTPayload } from 'hono/utils/jwt/types';
const prisma = new PrismaClient();

export const protect = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      { status: false, message: 'not authorized!', data: null },
      401
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const value = (await verify(
      token,
      Bun.env.SECRET_KEY || 'somerandomstring'
    )) as JWTPayload;

    const user = await prisma.user.findFirst({
      where: { email: value.email as string },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        gender: true,
      },
    });

    if (!user) {
      return c.json(
        { status: false, message: 'user not found!', data: null },
        404
      );
    }

    c.set('user', user);
    await next();
  } catch (err) {
    return c.json(
      { status: false, message: 'invalid token!', data: null },
      401
    );
  }
};

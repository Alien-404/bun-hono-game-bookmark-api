import { PrismaClient } from '@prisma/client';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { User } from '../types';
const prisma = new PrismaClient();

export default {
  profile: async (c: Context) => {
    try {
      const user: User = c.get('user' as any);

      // get user data
      const userData = await prisma.user.findFirst({
        where: {
          id: user.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          gender: true,
          username: true,
          _count: {
            select: {
              bookmarks: true,
            },
          },
        },
      });

      return c.json({
        status: true,
        messages: 'success',
        data: {
          ...userData,
          gender: userData?.gender ? 'Male' : 'Female',
        },
      });
    } catch (error) {
      throw new HTTPException(500, { cause: error });
    }
  },
};

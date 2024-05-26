import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { User } from '../types';
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default {
  index: async (c: Context) => {
    try {
      // get user data from auth
      const user: User = c.get('user' as any);
      const {
        title,
        platform,
        publisher,
        genre,
        sort = 'asc',
        page = '1',
        size = '10',
      } = c.req.query();

      const sortOrder = sort.toLowerCase() as Prisma.SortOrder;
      const pageNumber = parseInt(page, 10);
      const sizeNumber = parseInt(size, 10);

      if (!['asc', 'desc'].includes(sortOrder)) {
        return c.json(
          {
            status: false,
            message: 'sort available in asc or desc',
            data: null,
          },
          400
        );
      }

      // pagination
      const skip = (pageNumber - 1) * sizeNumber;

      // get games data
      const conditionData = {
        title: {
          contains: title || '',
        },
        platform: {
          contains: platform || '',
        },
        publisher: {
          contains: publisher || '',
        },
        genre: {
          contains: genre || '',
        },
      };

      const [games, totalGames] = await Promise.all([
        prisma.game.findMany({
          take: sizeNumber,
          skip: skip,
          orderBy: {
            releaseDate: sortOrder,
          },
          where: conditionData,
          select: {
            id: true,
            title: true,
            thumbnail: true,
            releaseDate: true,
            genre: true,
            publisher: true,
            platform: true,
          },
        }),
        prisma.game.count({
          where: conditionData,
        }),
      ]);

      // total pages
      const totalPages = Math.ceil(totalGames / sizeNumber);

      return c.json({
        status: true,
        message: 'success',
        data: {
          games,
          pageNumber,
          sizeNumber,
          totalGames,
          totalPages,
        },
      });
    } catch (error) {
      throw new HTTPException(500, { cause: error });
    }
  },

  show: async (c: Context) => {
    try {
      // get user data from auth
      const id = c.req.param('id');

      // check data
      const isGameValid = await prisma.game.findFirst({
        where: {
          id,
        },
      });

      if (!isGameValid) {
        return c.json(
          {
            status: false,
            message: `game with id: ${id} not found`,
            data: null,
          },
          404
        );
      }

      return c.json({
        status: true,
        message: 'success',
        data: isGameValid,
      });
    } catch (error) {
      throw new HTTPException(500, { cause: error });
    }
  },
};

import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { User } from '../types';
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default {
  create: async (c: Context) => {
    try {
      // get user data from auth
      const user: User = c.get('user' as any);
      const { name, description, category, gameId } = await c.req.json();

      // check game id is valid
      const isGameIdValid = await prisma.game.count({
        where: {
          id: {
            in: gameId,
          },
        },
      });

      if (isGameIdValid !== gameId.length) {
        return c.json(
          {
            status: false,
            message: 'make sure all game id is valid',
            data: null,
          },
          400
        );
      }

      // save data
      const bookmartUser = await prisma.bookmark.create({
        data: {
          name,
          description,
          category,
          userId: user.id,
          games: { connect: gameId.map((game: string) => ({ id: game })) },
        },
        select: {
          id: true,
        },
      });

      return c.json(
        {
          status: true,
          message: 'success',
          data: bookmartUser.id,
        },
        201
      );
    } catch (error) {
      throw new HTTPException(500, { cause: error });
    }
  },

  index: async (c: Context) => {
    try {
      // get user data from auth
      const user: User = c.get('user' as any);
      const {
        name,
        category,
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
        name: {
          contains: name || '',
        },
        category: {
          contains: category || '',
        },
        userId: user.id,
      };

      const [bookmarks, totalBookmark] = await Promise.all([
        prisma.bookmark.findMany({
          take: sizeNumber,
          skip: skip,
          orderBy: {
            createdAt: sortOrder,
          },
          where: conditionData,
          select: {
            id: true,
            name: true,
            category: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                games: true,
              },
            },
          },
        }),
        prisma.bookmark.count({
          where: conditionData,
        }),
      ]);

      // total pages
      const totalPages = Math.ceil(totalBookmark / sizeNumber);

      return c.json({
        status: true,
        message: 'success',
        data: {
          bookmarks,
          pageNumber,
          sizeNumber,
          totalBookmark,
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
      const user: User = c.get('user' as any);
      const id = c.req.param('id');

      // check data
      const isBookmarkValid = await prisma.bookmark.findFirst({
        where: {
          id,
        },
        include: {
          games: true,
          _count: {
            select: {
              games: true,
            },
          },
        },
      });

      if (!isBookmarkValid) {
        return c.json(
          {
            status: false,
            message: `bookmark with id: ${id} not found`,
            data: null,
          },
          404
        );
      }

      return c.json({
        status: true,
        message: 'success',
        data: isBookmarkValid,
      });
    } catch (error) {
      throw new HTTPException(500, { cause: error });
    }
  },

  link: async (c: Context) => {
    try {
      // get user data from auth
      const user: User = c.get('user' as any);
      const { gameId } = await c.req.json();
      const id = c.req.param('id');

      // check data
      const isBookmarkValid = await prisma.bookmark.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

      if (!isBookmarkValid) {
        return c.json(
          {
            status: false,
            message: `bookmark with id: ${id} not found`,
            data: null,
          },
          404
        );
      }

      // check game id is valid
      const isGameIdValid = await prisma.game.count({
        where: {
          id: {
            in: gameId,
          },
        },
      });

      if (isGameIdValid !== gameId.length) {
        return c.json(
          {
            status: false,
            message: 'make sure all game id is valid',
            data: null,
          },
          400
        );
      }

      // update bookmark
      await prisma.bookmark.update({
        where: {
          id: isBookmarkValid.id,
          userId: user.id,
        },
        data: {
          games: { connect: gameId.map((game: string) => ({ id: game })) },
        },
      });

      return c.json({
        status: true,
        message: 'success',
        data: null,
      });
    } catch (error) {
      throw new HTTPException(500, { cause: error });
    }
  },

  unlink: async (c: Context) => {
    try {
      // get user data from auth
      const user: User = c.get('user' as any);
      const { gameId } = await c.req.json();
      const id = c.req.param('id');

      // check data
      const isBookmarkValid = await prisma.bookmark.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

      if (!isBookmarkValid) {
        return c.json(
          {
            status: false,
            message: `bookmark with id: ${id} not found`,
            data: null,
          },
          404
        );
      }

      // check game id is valid
      const isGameIdValid = await prisma.game.count({
        where: {
          id: {
            in: gameId,
          },
        },
      });

      if (isGameIdValid !== gameId.length) {
        return c.json(
          {
            status: false,
            message: 'make sure all game id is valid',
            data: null,
          },
          400
        );
      }

      // update bookmark
      await prisma.bookmark.update({
        where: {
          id: isBookmarkValid.id,
          userId: user.id,
        },
        data: {
          games: { disconnect: gameId.map((game: string) => ({ id: game })) },
        },
      });

      return c.json({
        status: true,
        message: 'success',
        data: null,
      });
    } catch (error) {
      throw new HTTPException(500, { cause: error });
    }
  },

  update: async (c: Context) => {
    try {
      // get user data from auth
      const user: User = c.get('user' as any);
      const { name, category, description } = await c.req.json();
      const id = c.req.param('id');

      // check data
      const isBookmarkValid = await prisma.bookmark.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

      if (!isBookmarkValid) {
        return c.json(
          {
            status: false,
            message: `bookmark with id: ${id} not found`,
            data: null,
          },
          404
        );
      }

      // update bookmark
      await prisma.bookmark.update({
        where: {
          id: isBookmarkValid.id,
          userId: user.id,
        },
        data: {
          name,
          category,
          description,
        },
      });

      return c.json({
        status: true,
        message: 'success',
        data: null,
      });
    } catch (error) {
      throw new HTTPException(500, { cause: error });
    }
  },

  delete: async (c: Context) => {
    try {
      // get user data from auth
      const user: User = c.get('user' as any);
      const id = c.req.param('id');

      // check data
      const isBookmarkValid = await prisma.bookmark.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

      if (!isBookmarkValid) {
        return c.json(
          {
            status: false,
            message: `bookmark with id: ${id} not found`,
            data: null,
          },
          404
        );
      }

      // delete bookmark
      await prisma.bookmark.delete({
        where: {
          id: isBookmarkValid.id,
          userId: user.id,
        },
      });

      return c.json({
        status: true,
        message: 'success',
        data: null,
      });
    } catch (error) {
      throw new HTTPException(500, { cause: error });
    }
  },
};

import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { PrismaClient } from '@prisma/client';
import { sign } from 'hono/jwt';
const prisma = new PrismaClient();

export default {
  register: async (c: Context) => {
    try {
      const { email, name, username, password, gender } = await c.req.json();

      // check user data
      const isUserValid = await prisma.user.findFirst({
        where: {
          email,
          username,
        },
      });

      if (isUserValid) {
        return c.json(
          {
            status: false,
            message: 'user already exist',
            data: null,
          },
          409
        );
      }

      // hash passoword
      const hashPassowrd = await Bun.password.hash(password, {
        algorithm: 'bcrypt',
      });

      // save user
      const user = await prisma.user.create({
        data: {
          email,
          gender,
          name,
          password: hashPassowrd,
          username,
        },
        select: {
          id: true,
        },
      });

      return c.json(
        {
          status: true,
          messages: 'created',
          data: user,
        },
        201
      );
    } catch (error) {
      throw new HTTPException(500, { cause: error });
    }
  },

  login: async (c: Context) => {
    try {
      const { email, password } = await c.req.json();

      // check user data
      const isUserValid = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (!isUserValid) {
        return c.json(
          {
            status: false,
            message: 'user not exist',
            data: null,
          },
          409
        );
      }

      // validate password
      const isPasswordValid = await Bun.password.verify(
        password,
        isUserValid.password
      );

      if (!isPasswordValid) {
        return c.json(
          {
            status: false,
            message: 'credential not valid',
            data: null,
          },
          401
        );
      }

      // create access token
      const token = await sign(
        {
          email: isUserValid.email,
          name: isUserValid.name,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 7,
        },
        Bun.env.SECRET_KEY || 'somerandomstring'
      );

      return c.json({
        status: true,
        messages: 'success',
        data: {
          accessToken: token,
        },
      });
    } catch (error) {
      throw new HTTPException(500, { cause: error });
    }
  },
};

// read json data
import type { Game } from '../types';
const gamesDataJson = Bun.file('data/games.json');
const contents: Game[] = await gamesDataJson.json();

// packages
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// run
try {
  await prisma.$connect();
  contents.forEach(async (game) => {
    // insert
    const data = await prisma.game.create({
      data: {
        title: game.title,
        thumbnail: game.thumbnail,
        shortDescription: game.short_description,
        gameUrl: game.game_url,
        developer: game.developer,
        genre: game.genre,
        platform: game.platform,
        publisher: game.publisher,
        releaseDate: game.release_date,
      },
    });
  });
  // log
  console.log('success seeding data to database');
} catch (err) {
  console.error(err);
} finally {
  await prisma.$disconnect();
}

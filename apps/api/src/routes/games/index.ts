import { Hono } from "hono";
import authMiddleware from "../../middlewares/authMiddleware";
import { createCategory as createCategoryLegacy } from "./createCategory";
import { deleteGame as deleteGameLegacy } from "./deleteGame";
import { fetchGames } from "./fetchGames";
import { getCategories } from "./getCategories";
import { getGame } from "./getGame";
import { getGames } from "./getGames";
import { importGames } from "./importGames";
import { likeGame } from "./likeGame";
import {
  createCategory as createCategoryManaged,
  deleteCategory,
  getCategoryStats,
  getManagedCategories,
  updateCategory
} from "./manageCategories";
import {
  createGame,
  deleteGame as deleteManagedGame,
  getGameStats,
  getManagedGames,
  updateGame as updateManagedGame
} from "./manageGames";
import { playGame } from "./playGame";
import { rateGame } from "./rateGame";
import { serveGameFile } from "./serveGameFile";
import { testDb } from "./test-db";

import { updateGameStatus } from "./update-game-status";
import { updateGame as updateGameLegacy } from "./updateGame";
import { uploadGame } from "./uploadGame";
import comments from "./comments";
import { getManagedComments } from "./manageComments";

const games = new Hono();

// Public routes
games.get("/", getGames);
games.get("/test-db", testDb);

games.get("/update-status", updateGameStatus);
games.get("/categories", getCategories);

// Management routes (temporarily public for development)
games.get("/manage", getManagedGames);
games.post("/manage", createGame);
games.put("/manage/:id", updateManagedGame);
games.delete("/manage/:id", deleteManagedGame);
games.get("/manage/stats", getGameStats);
games.get("/manage/comments", getManagedComments);

// Category management routes (temporarily public for development)
games.get("/manage/categories", getManagedCategories);
games.post("/manage/categories", createCategoryManaged);
games.put("/manage/categories/:id", updateCategory);
games.delete("/manage/categories/:id", deleteCategory);
games.get("/manage/categories/stats", getCategoryStats);

// Game-specific routes (must come after management routes)
games.get("/:slug", getGame);
games.post("/:slug/play", playGame);
games.get("/:slug/play/*", serveGameFile);

// Comments moderation
games.route("/comments", comments);

// Protected routes (require authentication)
games.use("*", authMiddleware);
games.post("/upload", uploadGame);
games.put("/:id", updateGameLegacy);
games.delete("/:id", deleteGameLegacy);
games.post("/:id/like", likeGame);
games.post("/:id/rate", rateGame);
games.post("/categories", createCategoryLegacy);
games.post("/fetch", fetchGames);
games.post("/import", importGames);

export default games;

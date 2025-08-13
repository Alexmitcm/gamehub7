import { HEY_API_URL } from "@hey/data/constants";

export interface Game {
  id: string;
  title: string;
  slug: string;
  description?: string;
  instructions?: string;
  gameFileUrl: string;
  entryFilePath?: string;
  thumb1Url: string;
  thumb2Url: string;
  width: number;
  height: number;
  source: string;
  externalUrl?: string;
  status: string;
  isFeatured: boolean;
  playCount: number;
  likeCount: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  categories: GameCategory[];
  user?: {
    walletAddress: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
  };
  userLike?: boolean;
  userRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  _count?: {
    games: number;
  };
}

export interface GamesResponse {
  games: Game[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CategoriesResponse {
  categories: GameCategory[];
}

export interface FetchGamesParams {
  category?: string;
  search?: string;
  source?: string;
  sortBy?: "newest" | "popular" | "rating" | "plays";
  featured?: boolean;
  page?: number;
  limit?: number;
}

export const fetchGames = async (
  params: FetchGamesParams = {}
): Promise<GamesResponse> => {
  const searchParams = new URLSearchParams();

  if (params.category) searchParams.append("category", params.category);
  if (params.search) searchParams.append("search", params.search);
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params.featured) searchParams.append("featured", "true");
  if (params.source) searchParams.append("source", params.source);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());

  const response = await fetch(
    `${HEY_API_URL}/games?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch games");
  }

  return response.json();
};

export const fetchCategories = async (): Promise<CategoriesResponse> => {
  const response = await fetch(`${HEY_API_URL}/games/categories`);

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
};

export const fetchGame = async (slug: string): Promise<{ game: Game }> => {
  const response = await fetch(`${HEY_API_URL}/games/${slug}`);

  if (!response.ok) {
    throw new Error("Failed to fetch game");
  }

  return response.json();
};

export const playGame = async (
  slug: string,
  data: {
    playDuration?: number;
    score?: number;
    completed?: boolean;
  }
): Promise<{ success: boolean; gamePlay: any }> => {
  const response = await fetch(`${HEY_API_URL}/games/${slug}/play`, {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Failed to record game play");
  }

  return response.json();
};

export const likeGame = async (
  gameId: string
): Promise<{ success: boolean; liked: boolean }> => {
  const response = await fetch(`${HEY_API_URL}/games/${gameId}/like`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Failed to like game");
  }

  return response.json();
};

export const rateGame = async (
  gameId: string,
  rating: number
): Promise<{ success: boolean; rating: number }> => {
  const response = await fetch(`${HEY_API_URL}/games/${gameId}/rate`, {
    body: JSON.stringify({ rating }),
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Failed to rate game");
  }

  return response.json();
};

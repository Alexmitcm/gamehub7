import { useQuery } from "@tanstack/react-query";
import { fetchGames } from "@/helpers/gameHub";
import GameCard from "./GameCard";
import GameCardSkeleton from "./GameCardSkeleton";

interface GameHubFeedProps {
  category: string;
  search: string;
  source?: string;
  sortBy: "newest" | "popular" | "rating" | "plays";
  featured: boolean;
}

const GameHubFeed = ({ category, search, source, sortBy, featured }: GameHubFeedProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["games", { category, search, source, sortBy, featured }],
    queryFn: () => fetchGames({ category, search, sortBy, featured, source }),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(12)].map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            Failed to load games
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  if (!data?.games || data.games.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            No games found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {data.games.length} of {data.pagination.total} games
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
      
      {/* Pagination would go here */}
    </div>
  );
};

export default GameHubFeed; 
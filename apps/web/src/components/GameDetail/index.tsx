import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchGame } from "@/helpers/gameHub";
import { Spinner } from "@/components/Shared/UI";
import GamePlayer from "./GamePlayer";

const GameDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["game", slug],
    queryFn: () => fetchGame(slug!),
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data?.game) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Game not found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The game you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const { game } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Game Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {game.title}
        </h1>
        {game.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {game.description}
          </p>
        )}
        
        {/* Game Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <span>{game.playCount} plays</span>
          <span>{game.likeCount} likes</span>
          <span>Rating: {game.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Game Player */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="relative" style={{ aspectRatio: `${game.width}/${game.height}` }}>
            {game.gameFileUrl ? (
              <GamePlayer
                entryFilePath={(game as any).entryFilePath}
                gameFileUrl={game.gameFileUrl}
                height={game.height}
                title={game.title}
                width={game.width}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-700">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Game file not available
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    The game file could not be loaded.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {game.categories.map((category) => (
              <span
                key={category.id}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm dark:bg-blue-900 dark:text-blue-200"
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>

        {/* Instructions */}
        {game.instructions && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Instructions
            </h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {game.instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetail; 
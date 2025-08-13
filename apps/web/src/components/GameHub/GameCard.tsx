import { HeartIcon, PlayIcon, StarIcon } from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon
} from "@heroicons/react/24/solid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PLACEHOLDER_IMAGE } from "@hey/data/constants";
import { Link } from "react-router";
import { type Game, likeGame, rateGame } from "@/helpers/gameHub";

interface GameCardProps {
  game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
  const queryClient = useQueryClient();
  const [imageSrc, setImageSrc] = useState<string>(game.thumb1Url || game.thumb2Url || PLACEHOLDER_IMAGE);

  const likeMutation = useMutation({
    mutationFn: () => likeGame(game.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    }
  });

  const rateMutation = useMutation({
    mutationFn: (rating: number) => rateGame(game.id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    }
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleRate = (rating: number) => {
    rateMutation.mutate(rating);
  };

  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
      {/* Game Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          alt={game.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          src={imageSrc}
          onError={() => {
            // Fallback order: thumb2Url -> PLACEHOLDER_IMAGE
            setImageSrc((prev) => (prev !== game.thumb2Url && game.thumb2Url ? game.thumb2Url : PLACEHOLDER_IMAGE));
          }}
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/30">
          <Link
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white bg-opacity-90 text-gray-900 opacity-0 transition-opacity group-hover:opacity-100"
            to={`/gamehub/${game.slug}`}
          >
            <PlayIcon className="h-6 w-6" />
          </Link>
        </div>

        {/* Featured Badge */}
        {game.isFeatured && (
          <div className="absolute top-2 left-2 rounded-full bg-yellow-400 px-2 py-1 font-semibold text-xs text-yellow-900">
            Featured
          </div>
        )}

        {/* Like Button */}
        <button
          className="absolute top-2 right-2 rounded-full bg-white bg-opacity-90 p-1.5 text-gray-600 transition-colors hover:text-red-500"
          onClick={handleLike}
          type="button"
        >
          {game.userLike ? (
            <HeartSolidIcon className="h-4 w-4 text-red-500" />
          ) : (
            <HeartIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Game Info */}
      <div className="p-4">
        <h3 className="mb-2 font-semibold text-gray-900 text-lg dark:text-white">
          {game.title}
        </h3>

        {game.description && (
          <p className="mb-3 line-clamp-2 text-gray-600 text-sm dark:text-gray-300">
            {game.description}
          </p>
        )}

        {/* Categories */}
        <div className="mb-3 flex flex-wrap gap-1">
          {game.categories.slice(0, 2).map((category) => (
            <span
              className="rounded-full bg-gray-100 px-2 py-1 text-gray-600 text-xs dark:bg-gray-700 dark:text-gray-300"
              key={category.id}
            >
              {category.name}
            </span>
          ))}
          {game.categories.length > 2 && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-600 text-xs dark:bg-gray-700 dark:text-gray-300">
              +{game.categories.length - 2}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-gray-500 text-sm dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>{game.playCount} plays</span>
            <span>{game.likeCount} likes</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <span>{game.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              className="text-yellow-400 hover:text-yellow-500"
              key={star}
              onClick={() => handleRate(star)}
              type="button"
            >
              {star <= (game.userRating || 0) ? (
                <StarSolidIcon className="h-4 w-4" />
              ) : (
                <StarIcon className="h-4 w-4" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameCard;

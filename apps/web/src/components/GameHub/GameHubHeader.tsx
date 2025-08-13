import { MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Button from "../Shared/UI/Button";

interface GameHubHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sourceQuery: string;
  onSourceChange: (q: string) => void;
  sortBy: "newest" | "popular" | "rating" | "plays";
  onSortChange: (sort: "newest" | "popular" | "rating" | "plays") => void;
  showFeatured: boolean;
  onFeaturedChange: (featured: boolean) => void;
}

const GameHubHeader = ({
  searchQuery,
  onSearchChange,
  sourceQuery,
  onSourceChange,
  sortBy,
  onSortChange,
  showFeatured,
  onFeaturedChange,
}: GameHubHeaderProps) => {
  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Game Hub
          </h1>
          <Button
            variant={showFeatured ? "primary" : "secondary"}
            size="sm"
            onClick={() => onFeaturedChange(!showFeatured)}
            className="flex items-center gap-2"
          >
            <SparklesIcon className="h-4 w-4" />
            Featured
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
            />
          </div>

          {/* Source filter */}
          <div className="relative">
            <input
              type="text"
              placeholder="Source (e.g. Self, External)"
              value={sourceQuery}
              onChange={(e) => onSourceChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
          >
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="rating">Top Rated</option>
            <option value="plays">Most Played</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default GameHubHeader; 
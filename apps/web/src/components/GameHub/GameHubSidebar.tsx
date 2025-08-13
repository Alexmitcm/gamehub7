import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type GameCategory } from "@/helpers/gameHub";
import StatusBanner from "../Shared/UI/StatusBanner";

interface GameHubSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const GameHubSidebar = ({ selectedCategory, onCategoryChange }: GameHubSidebarProps) => {
  const { data: categoriesResponse, isLoading } = useQuery({
    queryKey: ["gameCategories"],
    queryFn: fetchCategories,
  });

  // Extract categories array from response and ensure it's an array
  const categories: GameCategory[] = Array.isArray(categoriesResponse?.categories) 
    ? categoriesResponse.categories 
    : [];

  if (isLoading) {
    return (
      <div className="w-64 rounded-lg bg-white p-4 dark:bg-gray-800">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64">
      <StatusBanner />
      <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Categories
      </h3>
      
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onCategoryChange("")}
          className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
            selectedCategory === ""
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          All Games
        </button>
        
        {categories.map((category: GameCategory) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(category.slug)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              selectedCategory === category.slug
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{category.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {category._count?.games || 0}
              </span>
            </div>
          </button>
        ))}
      </div>
      </div>
    </div>
  );
};

export default GameHubSidebar; 
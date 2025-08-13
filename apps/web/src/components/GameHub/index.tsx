import { useState } from "react";
import { useSearchParams } from "react-router";
import GameHubFeed from "./GameHubFeed";
import GameHubSidebar from "./GameHubSidebar";
import GameHubHeader from "./GameHubHeader";

const GameHub = () => {
  const [params, setParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>(params.get("category") || "");
  const [searchQuery, setSearchQuery] = useState<string>(params.get("q") || "");
  const [sourceQuery, setSourceQuery] = useState<string>(params.get("source") || "");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "rating" | "plays">((params.get("sort") as any) || "newest");
  const [showFeatured, setShowFeatured] = useState<boolean>(params.get("featured") === "1");

  const syncParams = (next: Partial<Record<string, string>>) => {
    const nextParams = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      if (v) nextParams.set(k, v);
      else nextParams.delete(k);
    });
    setParams(nextParams, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Optional status banner when redirected with status param */}
        {/* We keep it invisible here unless you want it visible in Hub too */}
        <GameHubHeader 
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); syncParams({ q }); }}
          sourceQuery={sourceQuery}
          onSourceChange={(s) => { setSourceQuery(s); syncParams({ source: s }); }}
          sortBy={sortBy}
          onSortChange={(s) => { setSortBy(s); syncParams({ sort: s }); }}
          showFeatured={showFeatured}
          onFeaturedChange={(v) => { setShowFeatured(v); syncParams({ featured: v ? "1" : "" }); }}
        />
        
        <div className="flex gap-6 py-6">
          <GameHubSidebar 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          <div className="flex-1">
            <GameHubFeed 
              category={selectedCategory}
              search={searchQuery}
              source={sourceQuery}
              sortBy={sortBy}
              featured={showFeatured}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHub; 
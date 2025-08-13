const GameCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
      {/* Thumbnail Skeleton */}
      <div className="aspect-video animate-pulse bg-gray-200 dark:bg-gray-700" />
      
      {/* Content Skeleton */}
      <div className="p-4">
        {/* Title Skeleton */}
        <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        
        {/* Description Skeleton */}
        <div className="mb-3 space-y-1">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        
        {/* Categories Skeleton */}
        <div className="mb-3 flex gap-1">
          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        
        {/* Stats Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
};

export default GameCardSkeleton; 
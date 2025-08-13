import { useState, useCallback, useMemo } from "react";
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useReferralStore } from "../store/referralStore";
import { debounce } from "../utils/performanceUtils";

interface EnhancedFilterPanelProps {
  isSearching: boolean;
  searchResults: number;
  hasResults: boolean;
}

export const EnhancedFilterPanel = ({ 
  isSearching, 
  searchResults, 
  hasResults 
}: EnhancedFilterPanelProps) => {
  const {
    walletFilter,
    balanceFilter,
    depthFilter,
    statusFilter,
    setWalletFilter,
    setBalanceFilter,
    setDepthFilter,
    setStatusFilter,
    clearFilters
  } = useReferralStore();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [localWalletFilter, setLocalWalletFilter] = useState(walletFilter);

  // Debounced search to prevent excessive filtering
  const debouncedSetWalletFilter = useMemo(
    () => debounce((value: string) => setWalletFilter(value), 300),
    [setWalletFilter]
  );

  const handleWalletFilterChange = useCallback((value: string) => {
    setLocalWalletFilter(value);
    debouncedSetWalletFilter(value);
  }, [setLocalWalletFilter, debouncedSetWalletFilter]);

  const handleClearFilters = useCallback(() => {
    setLocalWalletFilter("");
    clearFilters();
  }, [clearFilters]);

  const hasActiveFilters = useMemo(() => {
    return (
      walletFilter !== "" ||
      balanceFilter.min !== 0 ||
      balanceFilter.max !== Number.POSITIVE_INFINITY ||
      depthFilter.min !== 0 ||
      depthFilter.max !== Number.POSITIVE_INFINITY ||
      statusFilter !== "all"
    );
  }, [walletFilter, balanceFilter, depthFilter, statusFilter]);

  return (
    <div className="mb-6 space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={localWalletFilter}
          onChange={(e) => handleWalletFilterChange(e.target.value)}
          placeholder="Search by wallet address..."
          className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {localWalletFilter && (
          <button
            onClick={() => handleWalletFilterChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Status */}
      {localWalletFilter && (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
          <div className="flex items-center space-x-2">
            {isSearching ? (
              <>
                <div className="h-2 w-2 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-gray-600">Searching...</span>
              </>
            ) : hasResults ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-gray-600">
                  Found {searchResults} matching node{searchResults !== 1 ? "s" : ""}
                </span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-gray-600">No matching nodes found</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Advanced Filters</span>
          {hasActiveFilters && (
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          )}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
          {/* Balance Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Balance Range (USDT)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={balanceFilter.min === 0 ? "" : balanceFilter.min}
                  onChange={(e) => setBalanceFilter({
                    ...balanceFilter,
                    min: e.target.value === "" ? 0 : parseFloat(e.target.value)
                  })}
                  placeholder="Min"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={balanceFilter.max === Number.POSITIVE_INFINITY ? "" : balanceFilter.max}
                  onChange={(e) => setBalanceFilter({
                    ...balanceFilter,
                    max: e.target.value === "" ? Number.POSITIVE_INFINITY : parseFloat(e.target.value)
                  })}
                  placeholder="Max"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Depth Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Depth Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  min="0"
                  value={depthFilter.min === 0 ? "" : depthFilter.min}
                  onChange={(e) => setDepthFilter({
                    ...depthFilter,
                    min: e.target.value === "" ? 0 : parseInt(e.target.value)
                  })}
                  placeholder="Min"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  value={depthFilter.max === Number.POSITIVE_INFINITY ? "" : depthFilter.max}
                  onChange={(e) => setDepthFilter({
                    ...depthFilter,
                    max: e.target.value === "" ? Number.POSITIVE_INFINITY : parseInt(e.target.value)
                  })}
                  placeholder="Max"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "balanced" | "unbalanced")}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="balanced">Balanced</option>
              <option value="unbalanced">Unbalanced</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}; 
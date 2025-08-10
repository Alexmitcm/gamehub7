import { useState } from "react";
import {
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { useReferralStore } from "../store/referralStore";
import { exportReferralData } from "../utils/exportUtils";

interface EnhancedControlPanelProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleDrag: () => void;
  isDragging: boolean;
  isConnected: boolean;
  lastActivity: number;
}

export const EnhancedControlPanel = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleDrag,
  isDragging,
  isConnected,
  lastActivity
}: EnhancedControlPanelProps) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  
  const {
    currentNode,
    parentNode,
    childNodes,
    stats,
    treeData
  } = useReferralStore();

  const handleExport = async (format: "csv" | "pdf") => {
    if (!currentNode || !stats || !treeData) return;

    setIsExporting(true);
    try {
      await exportReferralData({
        currentNode,
        parentNode,
        childNodes,
        stats,
        treeData
      }, format);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const formatLastActivity = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Main Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onZoomOut}
            disabled={zoomLevel <= 0.1}
            className="flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:p-2.5"
            title="Zoom Out"
          >
            <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="ml-1 text-xs font-medium sm:text-sm">-</span>
          </button>

          <div className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
            <span className="text-xs font-medium text-gray-700 sm:text-sm">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          <button
            onClick={onZoomIn}
            disabled={zoomLevel >= 3}
            className="flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:p-2.5"
            title="Zoom In"
          >
            <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="ml-1 text-xs font-medium sm:text-sm">+</span>
          </button>

          <button
            onClick={onResetView}
            className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm"
            title="Reset View"
          >
            Reset
          </button>
        </div>

        {/* Drag Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleDrag}
            className={`flex items-center space-x-2 rounded-lg border px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
              isDragging
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
            title={isDragging ? "Disable Drag Mode" : "Enable Drag Mode"}
          >
            <ArrowsPointingOutIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">
              {isDragging ? "Drag Active" : "Drag Mode"}
            </span>
          </button>
        </div>
      </div>

      {/* Secondary Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Export Controls */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting || !currentNode}
            className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
            title="Export Data"
          >
            <DocumentArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">
              {isExporting ? "Exporting..." : "Export"}
            </span>
          </button>

          {showExportMenu && (
            <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="py-1">
                <button
                  onClick={() => handleExport("csv")}
                  disabled={isExporting}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  disabled={isExporting}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Export as PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
            title={showRawData ? "Hide Raw Data" : "Show Raw Data"}
          >
            {showRawData ? (
              <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span className="hidden sm:inline">
              {showRawData ? "Hide Data" : "Raw Data"}
            </span>
          </button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-xs font-medium text-gray-700 sm:text-sm">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600 sm:text-sm">
        <div className="flex items-center space-x-4">
          <span>Last updated: {formatLastActivity(lastActivity)}</span>
          {stats && (
            <span>Total referrals: {stats.totalReferrals}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Real-time updates</span>
        </div>
      </div>

      {/* Mobile-specific controls */}
      <div className="sm:hidden">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onZoomOut}
            disabled={zoomLevel <= 0.1}
            className="rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            Zoom Out
          </button>
          <button
            onClick={onZoomIn}
            disabled={zoomLevel >= 3}
            className="rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            Zoom In
          </button>
        </div>
      </div>
    </div>
  );
}; 
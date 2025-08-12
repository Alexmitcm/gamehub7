/**
 * Clears all Wagmi-related localStorage data to prevent history restoration conflicts
 * This should be called before any Wagmi configuration is created
 */
export const clearWagmiStorage = () => {
  if (typeof window === "undefined") return;

  const keys = Object.keys(localStorage);
  const wagmiKeys = keys.filter(
    (key) =>
      key.startsWith("wagmi") ||
      key.startsWith("wc") ||
      key.includes("walletconnect") ||
      key.includes("wagmi") ||
      key.includes("viem")
  );

  if (wagmiKeys.length > 0) {
    wagmiKeys.forEach((key) => {
      localStorage.removeItem(key);
    });
    console.log("🧹 Cleared Wagmi storage keys:", wagmiKeys);
  }
};

/**
 * Clears Wagmi storage and returns a promise that resolves after clearing
 * Useful for ensuring storage is cleared before proceeding
 */
export const clearWagmiStorageAsync = async (): Promise<void> => {
  clearWagmiStorage();
  // Small delay to ensure localStorage operations complete
  await new Promise((resolve) => setTimeout(resolve, 10));
};

/**
 * Suppresses Wagmi history restoration warnings in development
 */
export const suppressWagmiWarnings = () => {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return;
  }

  const originalWarn = console.warn;
  console.warn = (...args) => {
    // Suppress specific Wagmi history warnings
    if (
      args[0]?.includes?.("Restore will override. history") ||
      args[0]?.msg?.includes?.("Restore will override. history") ||
      args[0]?.context === "core/history"
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
};

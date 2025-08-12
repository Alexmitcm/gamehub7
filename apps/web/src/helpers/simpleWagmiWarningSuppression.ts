/**
 * Comprehensive Wagmi warning suppression
 * Handles bundled code and early warning generation
 */
export const simpleWagmiWarningSuppression = () => {
  if (typeof window === "undefined") return;

  // Store original console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  // Comprehensive filter function
  const shouldSuppress = (args: any[]): boolean => {
    return args.some((arg) => {
      // String checks
      if (typeof arg === "string") {
        const lowerArg = arg.toLowerCase();
        return (
          lowerArg.includes("restore will override") ||
          lowerArg.includes("core/history") ||
          lowerArg.includes("wagmi")
        );
      }

      // Object checks
      if (typeof arg === "object" && arg !== null) {
        const obj = arg as any;
        return (
          obj.msg === "Restore will override. history" ||
          obj.context === "core/history" ||
          obj.level === 50 ||
          obj.msg?.includes?.("Restore will override") ||
          obj.context?.includes?.("core/history")
        );
      }

      return false;
    });
  };

  // Override console.log
  console.log = (...args: any[]) => {
    if (shouldSuppress(args)) return;
    originalLog.apply(console, args);
  };

  // Override console.warn
  console.warn = (...args: any[]) => {
    if (shouldSuppress(args)) return;
    originalWarn.apply(console, args);
  };

  // Override console.error (in case warnings come through as errors)
  console.error = (...args: any[]) => {
    if (shouldSuppress(args)) return;
    originalError.apply(console, args);
  };

  // Also try to intercept any existing console methods that might be cached
  if (window.console) {
    // Force re-evaluation of console methods
    Object.defineProperty(window, 'console', {
      value: console,
      writable: false,
      configurable: false
    });
  }

  console.log("🔇 Comprehensive Wagmi warning suppression enabled");
};

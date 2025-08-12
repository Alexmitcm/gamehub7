import { toast } from "sonner";

export interface ErrorInfo {
  type: "wallet" | "network" | "auth" | "api" | "unknown";
  message: string;
  retryable: boolean;
  userFriendly: string;
}

export const classifyError = (error: unknown): ErrorInfo => {
  const message = error instanceof Error ? error.message : String(error);

  // Wallet connection errors
  if (message.includes("MetaMask extension not found")) {
    return {
      message,
      retryable: false,
      type: "wallet",
      userFriendly:
        "MetaMask extension not found. Please install MetaMask and try again."
    };
  }

  if (message.includes("User rejected") || message.includes("User denied")) {
    return {
      message,
      retryable: true,
      type: "wallet",
      userFriendly: "Connection was cancelled. Please try again."
    };
  }

  if (
    message.includes("Failed to connect") ||
    message.includes("Network error")
  ) {
    return {
      message,
      retryable: true,
      type: "network",
      userFriendly:
        "Network connection failed. Please check your internet connection."
    };
  }

  // Authentication errors
  if (message.includes("401") || message.includes("Unauthorized")) {
    return {
      message,
      retryable: false,
      type: "auth",
      userFriendly: "Authentication failed. Please sign in again."
    };
  }

  if (message.includes("expired") || message.includes("Invalid token")) {
    return {
      message,
      retryable: false,
      type: "auth",
      userFriendly: "Your session has expired. Please sign in again."
    };
  }

  // API errors
  if (message.includes("500") || message.includes("Internal Server Error")) {
    return {
      message,
      retryable: true,
      type: "api",
      userFriendly: "Server error occurred. Please try again in a moment."
    };
  }

  if (message.includes("503") || message.includes("Service Unavailable")) {
    return {
      message,
      retryable: true,
      type: "api",
      userFriendly:
        "Service is temporarily unavailable. Please try again in a moment."
    };
  }

  if (message.includes("403") || message.includes("Forbidden")) {
    return {
      message,
      retryable: false,
      type: "api",
      userFriendly: "Access denied. Please check your permissions."
    };
  }

  if (message.includes("404") || message.includes("Not Found")) {
    return {
      message,
      retryable: false,
      type: "api",
      userFriendly: "Resource not found."
    };
  }

  // Default unknown error
  return {
    message,
    retryable: true,
    type: "unknown",
    userFriendly: "Something went wrong. Please try again."
  };
};

export const handleError = (error: unknown, context?: string): void => {
  const errorInfo = classifyError(error);

  // Log the error for debugging
  console.error(`[${context || "Error"}]`, {
    message: errorInfo.message,
    retryable: errorInfo.retryable,
    type: errorInfo.type
  });

  // Show user-friendly toast
  toast.error(errorInfo.userFriendly, {
    duration: errorInfo.retryable ? 5000 : 8000,
    id: `${errorInfo.type}-${Date.now()}`
  });
};

export const handleSilentError = (error: unknown, context?: string): void => {
  const errorInfo = classifyError(error);

  // Only log, don't show toast
  console.warn(`[${context || "Silent Error"}]`, {
    message: errorInfo.message,
    retryable: errorInfo.retryable,
    type: errorInfo.type
  });
};

export const isRetryableError = (error: unknown): boolean => {
  return classifyError(error).retryable;
};

export const shouldClearAuth = (error: unknown): boolean => {
  const errorInfo = classifyError(error);
  return errorInfo.type === "auth" && !errorInfo.retryable;
};

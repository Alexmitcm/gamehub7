import { Component, type ReactNode } from "react";
import { toast } from "react-hot-toast";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Show user-friendly error message
    if (
      error.message.includes("500") ||
      error.message.includes("Service temporarily unavailable")
    ) {
      toast.error("Service temporarily unavailable. Please try again later.");
    } else if (error.message.includes("401")) {
      toast.error("Authentication required. Please log in again.");
    } else if (error.message.includes("MetaMask")) {
      toast.error("MetaMask not found. Please install MetaMask extension.");
    } else {
      toast.error("Something went wrong. Please refresh the page.");
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  aria-hidden="true"
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <h2 className="mb-2 font-semibold text-gray-900 text-xl">
                Something went wrong
              </h2>
              <p className="mb-4 text-gray-600">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => window.location.reload()}
                type="button"
              >
                Refresh Page
              </button>
              <button
                className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                onClick={() =>
                  this.setState({ error: undefined, hasError: false })
                }
                type="button"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

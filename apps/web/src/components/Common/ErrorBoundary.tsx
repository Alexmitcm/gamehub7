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
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Show user-friendly error message
    if (error.message.includes("500") || error.message.includes("Service temporarily unavailable")) {
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
        <div className="bg-gray-50 flex items-center justify-center min-h-screen">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="mb-4 text-center">
              <div className="bg-red-100 flex h-12 items-center justify-center mb-4 mx-auto rounded-full w-12">
                <svg
                  className="h-6 text-red-600 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="font-semibold mb-2 text-gray-900 text-xl">
                Something went wrong
              </h2>
              <p className="mb-4 text-gray-600">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-blue-700 px-4 py-2 rounded-md text-white"
                onClick={() => window.location.reload()}
                type="button"
              >
                Refresh Page
              </button>
              <button
                className="bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 hover:bg-gray-700 px-4 py-2 rounded-md text-white"
                onClick={() => this.setState({ hasError: false, error: undefined })}
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

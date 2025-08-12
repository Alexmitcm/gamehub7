import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface NetworkStatusProps {
  className?: string;
}

interface Status {
  walletConnect: "loading" | "connected" | "error" | "disconnected";
  api: "loading" | "connected" | "error" | "disconnected";
  lens: "loading" | "connected" | "error" | "disconnected";
}

const NetworkStatus = ({ className = "" }: NetworkStatusProps) => {
  const [status, setStatus] = useState<Status>({
    api: "loading",
    lens: "loading",
    walletConnect: "loading"
  });

  useEffect(() => {
    const checkWalletConnect = () => {
      try {
        // Check if WalletConnect is available
        if (typeof window !== "undefined" && window.ethereum) {
          setStatus((prev) => ({ ...prev, walletConnect: "connected" }));
        } else {
          setStatus((prev) => ({ ...prev, walletConnect: "disconnected" }));
        }
      } catch (error) {
        console.error("WalletConnect check failed:", error);
        setStatus((prev) => ({ ...prev, walletConnect: "error" }));
      }
    };

    const checkApi = async () => {
      try {
        const response = await fetch(
          "https://0xhub2-production.up.railway.app/ping",
          {
            headers: {
              "Content-Type": "application/json"
            },
            method: "GET"
          }
        );

        if (response.ok) {
          setStatus((prev) => ({ ...prev, api: "connected" }));
        } else {
          setStatus((prev) => ({ ...prev, api: "error" }));
          toast.error("API connection failed");
        }
      } catch (error) {
        console.error("API check failed:", error);
        setStatus((prev) => ({ ...prev, api: "error" }));
        toast.error("API connection failed");
      }
    };

    const checkLens = async () => {
      try {
        // Check Lens API status
        const response = await fetch("https://api.lens.dev", {
          headers: {
            "Content-Type": "application/json"
          },
          method: "GET"
        });

        if (response.ok) {
          setStatus((prev) => ({ ...prev, lens: "connected" }));
        } else {
          setStatus((prev) => ({ ...prev, lens: "error" }));
        }
      } catch (error) {
        console.error("Lens check failed:", error);
        setStatus((prev) => ({ ...prev, lens: "error" }));
      }
    };

    // Initial checks
    checkWalletConnect();
    checkApi();
    checkLens();

    // Set up periodic checks
    const interval = setInterval(() => {
      checkWalletConnect();
      checkApi();
      checkLens();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "loading":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return "🟢";
      case "error":
        return "🔴";
      case "loading":
        return "🟡";
      default:
        return "⚪";
    }
  };

  return (
    <div
      className={`flex flex-col space-y-2 rounded-lg bg-gray-100 p-4 ${className}`}
    >
      <h3 className="mb-2 font-semibold text-gray-700 text-sm">
        Network Status
      </h3>

      <div className="flex items-center justify-between">
        <span className="text-gray-600 text-sm">WalletConnect:</span>
        <span
          className={`${getStatusColor(status.walletConnect)} font-medium text-sm`}
        >
          {getStatusIcon(status.walletConnect)} {status.walletConnect}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-600 text-sm">API:</span>
        <span className={`${getStatusColor(status.api)} font-medium text-sm`}>
          {getStatusIcon(status.api)} {status.api}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-600 text-sm">Lens:</span>
        <span className={`${getStatusColor(status.lens)} font-medium text-sm`}>
          {getStatusIcon(status.lens)} {status.lens}
        </span>
      </div>
    </div>
  );
};

export default NetworkStatus;

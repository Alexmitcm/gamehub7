import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface ServiceStatusProps {
  className?: string;
  showDetails?: boolean;
}

interface ServiceState {
  status: "healthy" | "degraded" | "down" | "checking";
  lastCheck: Date;
  error?: string;
}

interface Services {
  api: ServiceState;
  lens: ServiceState;
  walletConnect: ServiceState;
}

const ServiceStatus = ({
  className = "",
  showDetails = false
}: ServiceStatusProps) => {
  const [services, setServices] = useState<Services>({
    api: { lastCheck: new Date(), status: "checking" },
    lens: { lastCheck: new Date(), status: "checking" },
    walletConnect: { lastCheck: new Date(), status: "checking" }
  });

  const checkApiHealth = async () => {
    try {
      const response = await fetch(
        "https://0xhub2-production.up.railway.app/ping",
        {
          headers: { "Content-Type": "application/json" },
          method: "GET"
        }
      );

      if (response.ok) {
        setServices((prev) => ({
          ...prev,
          api: { lastCheck: new Date(), status: "healthy" }
        }));
      } else {
        setServices((prev) => ({
          ...prev,
          api: {
            error: `HTTP ${response.status}`,
            lastCheck: new Date(),
            status: "down"
          }
        }));
      }
    } catch (error) {
      setServices((prev) => ({
        ...prev,
        api: {
          error: error instanceof Error ? error.message : "Connection failed",
          lastCheck: new Date(),
          status: "down"
        }
      }));
    }
  };

  const checkLensHealth = async () => {
    try {
      const response = await fetch("https://api.lens.dev", {
        headers: { "Content-Type": "application/json" },
        method: "GET"
      });

      if (response.ok) {
        setServices((prev) => ({
          ...prev,
          lens: { lastCheck: new Date(), status: "healthy" }
        }));
      } else {
        setServices((prev) => ({
          ...prev,
          lens: {
            error: `HTTP ${response.status}`,
            lastCheck: new Date(),
            status: "degraded"
          }
        }));
      }
    } catch (error) {
      setServices((prev) => ({
        ...prev,
        lens: {
          error: error instanceof Error ? error.message : "Connection failed",
          lastCheck: new Date(),
          status: "degraded"
        }
      }));
    }
  };

  const checkWalletConnect = () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        setServices((prev) => ({
          ...prev,
          walletConnect: { lastCheck: new Date(), status: "healthy" }
        }));
      } else {
        setServices((prev) => ({
          ...prev,
          walletConnect: {
            error: "MetaMask not detected",
            lastCheck: new Date(),
            status: "degraded"
          }
        }));
      }
    } catch (error) {
      setServices((prev) => ({
        ...prev,
        walletConnect: {
          error: error instanceof Error ? error.message : "Connection failed",
          lastCheck: new Date(),
          status: "down"
        }
      }));
    }
  };

  const handleRetry = async (service: keyof Services) => {
    setServices((prev) => ({
      ...prev,
      [service]: { lastCheck: new Date(), status: "checking" }
    }));

    switch (service) {
      case "api":
        await checkApiHealth();
        break;
      case "lens":
        await checkLensHealth();
        break;
      case "walletConnect":
        checkWalletConnect();
        break;
    }

    toast.success(`${service.toUpperCase()} status rechecked`);
  };

  useEffect(() => {
    const checkAllServices = async () => {
      await Promise.all([checkApiHealth(), checkLensHealth()]);
      checkWalletConnect();
    };

    checkAllServices();

    const interval = setInterval(checkAllServices, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return "🟢";
      case "degraded":
        return "🟡";
      case "down":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return "Operational";
      case "degraded":
        return "Degraded";
      case "down":
        return "Down";
      default:
        return "Checking";
    }
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Service Status</h3>
        <button
          className="rounded bg-blue-600 px-3 py-1 text-white text-xs hover:bg-blue-700"
          onClick={() => {
            setServices(() => ({
              api: { lastCheck: new Date(), status: "checking" },
              lens: { lastCheck: new Date(), status: "checking" },
              walletConnect: { lastCheck: new Date(), status: "checking" }
            }));
            handleRetry("api");
            handleRetry("lens");
            handleRetry("walletConnect");
          }}
          type="button"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(services).map(([service, state]) => (
          <div className="flex items-center justify-between" key={service}>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700 text-sm capitalize">
                {service === "walletConnect"
                  ? "WalletConnect"
                  : service.toUpperCase()}
                :
              </span>
              <span
                className={`${getStatusColor(state.status)} font-medium text-sm`}
              >
                {getStatusIcon(state.status)} {getStatusText(state.status)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {showDetails && state.error && (
                <span className="text-red-500 text-xs">{state.error}</span>
              )}
              <button
                className="rounded bg-gray-100 px-2 py-1 text-gray-600 text-xs hover:bg-gray-200"
                onClick={() => handleRetry(service as keyof Services)}
                type="button"
              >
                Retry
              </button>
            </div>
          </div>
        ))}
      </div>

      {showDetails && (
        <div className="mt-4 border-gray-200 border-t pt-4">
          <p className="text-gray-500 text-xs">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceStatus;

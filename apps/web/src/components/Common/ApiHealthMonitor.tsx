import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface ApiHealthMonitorProps {
  children: React.ReactNode;
}

interface ApiStatus {
  isHealthy: boolean;
  lastCheck: Date;
  error?: string;
  retryCount: number;
}

const ApiHealthMonitor = ({ children }: ApiHealthMonitorProps) => {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    isHealthy: true,
    lastCheck: new Date(),
    retryCount: 0
  });

  const checkApiHealth = async () => {
    try {
      const response = await fetch(
        "https://0xhub2-production.up.railway.app/ping",
        {
          headers: { "Content-Type": "application/json" },
          method: "GET",
          signal: AbortSignal.timeout(5000) // 5 second timeout
        }
      );

      if (response.ok) {
        setApiStatus({
          isHealthy: true,
          lastCheck: new Date(),
          retryCount: 0
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Connection failed";

      setApiStatus((prev) => ({
        error: errorMessage,
        isHealthy: false,
        lastCheck: new Date(),
        retryCount: prev.retryCount + 1
      }));

      // Show error toast only on first failure or after significant retries
      if (apiStatus.retryCount === 0 || apiStatus.retryCount % 5 === 0) {
        toast.error(
          "API service is currently unavailable. Some features may be limited."
        );
      }
    }
  };

  useEffect(() => {
    // Initial health check
    checkApiHealth();

    // Set up periodic health checks
    const interval = setInterval(checkApiHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return <div className="api-health-monitor">{children}</div>;
};

export default ApiHealthMonitor;

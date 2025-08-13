import { useState } from "react";
import AdminWeb3Provider from "./AdminWeb3Provider";
import AdminDashboard from "./Dashboard/AdminDashboard";
import FeatureManagement from "./FeatureManagement";
import GameHubManager from "./GameHubManager";
import SmartContractControlPanel from "./SmartContractControlPanel";
import UserManagement from "./UserManagement";

type AdminSection = "dashboard" | "users" | "features" | "games" | "contracts";

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "users":
        return <UserManagement />;
      case "features":
        return <FeatureManagement />;
      case "games":
        return <GameHubManager />;
      case "contracts":
        return <SmartContractControlPanel />;
      default:
        return <AdminDashboard />;
    }
  };

  const getNavLinkClass = (section: AdminSection) => {
    return `rounded border px-3 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
      activeSection === section
        ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300"
        : "text-gray-700 dark:text-gray-300"
    }`;
  };

  return (
    <AdminWeb3Provider>
      <div className="space-y-8">
        {/* Navigation */}
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <nav className="flex flex-wrap gap-2 text-sm">
            <button
              className={getNavLinkClass("dashboard")}
              onClick={() => setActiveSection("dashboard")}
              type="button"
            >
              Dashboard
            </button>
            <button
              className={getNavLinkClass("users")}
              onClick={() => setActiveSection("users")}
              type="button"
            >
              User Management
            </button>
            <button
              className={getNavLinkClass("features")}
              onClick={() => setActiveSection("features")}
              type="button"
            >
              Feature Management
            </button>
            <button
              className={getNavLinkClass("games")}
              onClick={() => setActiveSection("games")}
              type="button"
            >
              Game Hub
            </button>
            <button
              className={getNavLinkClass("contracts")}
              onClick={() => setActiveSection("contracts")}
              type="button"
            >
              Smart Contracts
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="min-h-screen">{renderSection()}</div>
      </div>
    </AdminWeb3Provider>
  );
};

export default AdminPanel;

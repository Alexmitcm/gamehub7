import AdminWeb3Provider from "./AdminWeb3Provider";
import SmartContractControlPanel from "./SmartContractControlPanel";
import GameHubManager from "./GameHubManager";
import AdminDashboard from "./Dashboard/AdminDashboard";
import { Link } from "react-router";

const AdminPanel = () => (
  <AdminWeb3Provider>
    <div className="space-y-8">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <nav className="flex flex-wrap gap-2 text-sm">
            <Link className="rounded border px-3 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700" to="/admin">Dashboard</Link>
            <Link className="rounded border px-3 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700" to="/admin/games">Games</Link>
            <Link className="rounded border px-3 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700" to="/admin/games/new">Add Game</Link>
          </nav>
        </div>
        <AdminDashboard />
        <SmartContractControlPanel />
        <GameHubManager />
    </div>
  </AdminWeb3Provider>
);

export default AdminPanel;

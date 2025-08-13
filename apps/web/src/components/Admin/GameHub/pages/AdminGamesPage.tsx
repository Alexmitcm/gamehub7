import { Link } from "react-router";
import GameList from "../GameList";

const AdminGamesPage = () => {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Game Management</h1>
        <Link
          to="/admin/games/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Game
        </Link>
      </div>

      <GameList />
    </div>
  );
};

export default AdminGamesPage;


import { useEffect, useMemo, useState } from "react";
import StatusBanner from "@/components/Shared/UI/StatusBanner";
import { HEY_API_URL } from "@hey/data/constants";

interface CommentRow { id: string; sender_username: string; created_date: string; comment: string }
interface ReportItem { game_id: string; type: string; comment: string }

const AdminDashboard = () => {
  const [warnings, setWarnings] = useState<string[]>([]);
  const [statsRange, setStatsRange] = useState<"week" | "month">("week");
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [topGames, setTopGames] = useState<any[]>([]);

  // Warnings: fetch from API or derive locally. Placeholder for now.
  useEffect(() => {
    setWarnings([]);
  }, []);

  useEffect(() => {
    // Latest comments: placeholder fetch to your API if available
    setComments([]);
    // Game reports: placeholder, wire when plugin/source exists
    setReports([]);
  }, []);

  useEffect(() => {
    // Top games: reuse /games sortBy=popular when implemented. Falls back to newest.
    const fetchTop = async () => {
      try {
        const res = await fetch(`${HEY_API_URL}/games?sortBy=popular&limit=10`);
        if (!res.ok) return;
        const data = await res.json();
        setTopGames(data.games || []);
      } catch {}
    };
    fetchTop();
  }, []);

  return (
    <div className="space-y-6">
      <StatusBanner />

      {!!warnings.length && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div key={i} className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900 dark:border-yellow-900/40 dark:bg-yellow-900/20 dark:text-yellow-200">
              {w}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between">
          <select
            className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={statsRange}
            onChange={(e) => setStatsRange(e.target.value as any)}
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Statistics</h3>
        </div>
        <div className="h-64 w-full rounded-md border border-gray-200 dark:border-gray-700" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Comments</h3>
          {comments.length ? (
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Sender</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.slice(0, 3).map((c, idx) => (
                    <tr key={c.id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-2">{idx + 1}</td>
                      <td className="px-3 py-2">{c.sender_username}</td>
                      <td className="px-3 py-2">{c.created_date}</td>
                      <td className="px-3 py-2">{c.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No comment</div>
          )}
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Game Reports</h3>
          {reports.length ? (
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Game</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(0, 3).map((r, idx) => (
                    <tr key={`${r.game_id}-${idx}`} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-2">{idx + 1}</td>
                      <td className="px-3 py-2">{r.game_id}</td>
                      <td className="px-3 py-2">{r.type}</td>
                      <td className="px-3 py-2">{r.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No report</div>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Top games</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Game Name</th>
                <th className="px-3 py-2 text-left">Played</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Likes</th>
              </tr>
            </thead>
            <tbody>
              {topGames.map((g, idx) => (
                <tr key={g.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2"><a className="text-blue-600 hover:underline" href={`/gamehub/${g.slug}`} target="_blank" rel="noreferrer">{g.title}</a></td>
                  <td className="px-3 py-2">{g.playCount ?? "-"}</td>
                  <td className="px-3 py-2">{g.categories?.map((c: any) => c.name).join(", ")}</td>
                  <td className="px-3 py-2">{g.likeCount ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchGames, Game } from "@/helpers/gameHub";
import { HEY_API_URL } from "@hey/data/constants";
import { MagnifyingGlassIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import StatusBanner from "@/components/Shared/UI/StatusBanner";
import EditGameModal from "./EditGameModal";
import { useSearchParams } from "react-router";

const PAGE_SIZE = 10;

const GameList = () => {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [source, setSource] = useState(params.get("source") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [page, setPage] = useState(Number(params.get("page") || 1));

  const { data: categories } = useQuery({
    queryKey: ["game-categories"],
    queryFn: fetchCategories,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-games", { q, source, category, page }],
    queryFn: () => fetchGames({ search: q, source, category, page, limit: PAGE_SIZE, sortBy: "newest" }),
  });

  const games = data?.games || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: games.length } as any;
  const [editing, setEditing] = useState<Game | null>(null);

  const handleDelete = async (game: Game) => {
    const confirmed = confirm(`Delete “${game.title}”?`);
    if (!confirmed) return;
    const res = await fetch(`${HEY_API_URL}/games/manage/${game.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Failed to delete game");
      return;
    }
    await refetch();
    const next = new URLSearchParams(params);
    next.set("status", "deleted");
    setParams(next, { replace: true });
  };

  const handleApplyFilters = () => {
    const next = new URLSearchParams(params);
    if (q) next.set("q", q); else next.delete("q");
    if (source) next.set("source", source); else next.delete("source");
    if (category) next.set("category", category); else next.delete("category");
    next.set("page", "1");
    setParams(next, { replace: true });
    setPage(1);
  };

  const handlePage = (direction: -1 | 1) => {
    const nextPage = Math.max(1, Math.min((pagination?.totalPages || 1), page + direction));
    setPage(nextPage);
    const next = new URLSearchParams(params);
    next.set("page", String(nextPage));
    setParams(next, { replace: true });
  };

  return (
    <div className="space-y-4">
      <StatusBanner />

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                aria-label="Search games"
                className="w-full rounded-md border border-gray-300 bg-white px-10 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title or description"
                value={q}
              />
            </div>
          </div>
          <div>
            <select
              aria-label="Filter by category"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories?.categories?.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              aria-label="Filter by source"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              onChange={(e) => setSource(e.target.value)}
              placeholder="Source (e.g. Self)"
              value={source}
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            onClick={() => { setQ(""); setSource(""); setCategory(""); handleApplyFilters(); }}
          >
            Clear
          </button>
          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            onClick={handleApplyFilters}
          >
            Apply
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Cover</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Categories</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Source</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">URL</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">Loading…</td>
              </tr>
            ) : (
              games.map((g, idx) => (
                <tr key={g.id}>
                  <td className="px-4 py-3 text-sm text-gray-500">{(pagination.page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-700 dark:text-gray-200">{g.slug}</td>
                  <td className="px-4 py-3">
                    <img alt={g.title} className="h-12 w-20 rounded object-cover" src={g.thumb1Url || g.thumb2Url} />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{g.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {g.categories?.map((c) => (
                        <span key={c.id} className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">{c.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{g.source || "Self"}</td>
                  <td className="px-4 py-3 text-sm">
                    <a className="text-blue-600 hover:underline" href={`/gamehub/${g.slug}`} target="_blank" rel="noreferrer">/gamehub/{g.slug}</a>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        aria-label={`Edit ${g.title}`}
                        className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => setEditing(g)}
                        onKeyDown={(e) => e.key === "Enter" && setEditing(g)}
                        tabIndex={0}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        aria-label={`Delete ${g.title}`}
                        className="rounded p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDelete(g)}
                        onKeyDown={(e) => e.key === "Enter" && handleDelete(g)}
                        tabIndex={0}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</p>
        <div className="flex gap-2">
          <button
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
            disabled={pagination.page <= 1}
            onClick={() => handlePage(-1)}
          >
            Previous
          </button>
          <button
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePage(1)}
          >
            Next
          </button>
        </div>
      </div>

      <EditGameModal
        open={Boolean(editing)}
        game={editing}
        categories={categories?.categories || []}
        onClose={() => setEditing(null)}
        onSaved={async () => {
          await refetch();
          const next = new URLSearchParams(params);
          next.set("status", "success");
          next.set("message", "Game updated successfully");
          setParams(next, { replace: true });
        }}
      />
    </div>
  );
};

export default GameList;


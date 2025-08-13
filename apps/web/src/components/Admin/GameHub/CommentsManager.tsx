import { useEffect, useState } from "react";
import { HEY_API_URL } from "@hey/data/constants";

interface CommentRow {
  id: string;
  gameId: string;
  parentId?: string | null;
  comment: string;
  senderId: string;
  senderUsername: string;
  createdAt: string;
  approved: boolean;
  game: { id: string; title: string; slug: string };
}

const CommentsManager = () => {
  const [rows, setRows] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`${HEY_API_URL}/games/manage/comments?limit=100`);
    const data = await res.json();
    setRows(data.comments || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setApproved = async (id: string, approved: boolean) => {
    await fetch(`${HEY_API_URL}/games/comments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approved }) });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    await fetch(`${HEY_API_URL}/games/comments/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="py-8 text-center">Loading comments…</div>;

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-3 py-2 text-left">Game</th>
            <th className="px-3 py-2 text-left">Sender</th>
            <th className="px-3 py-2 text-left">Comment</th>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-gray-100 dark:border-gray-700">
              <td className="px-3 py-2"><a className="text-blue-600 hover:underline" href={`/gamehub/${r.game.slug}`} target="_blank" rel="noreferrer">{r.game.title}</a></td>
              <td className="px-3 py-2">{r.senderUsername}</td>
              <td className="px-3 py-2">{r.comment}</td>
              <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString()}</td>
              <td className="px-3 py-2 text-right space-x-2">
                <button className="rounded border px-2 py-1" onClick={() => setApproved(r.id, !r.approved)}>{r.approved ? "Unapprove" : "Approve"}</button>
                <button className="rounded border px-2 py-1 text-red-600" onClick={() => remove(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommentsManager;


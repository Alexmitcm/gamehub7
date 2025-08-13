import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { HEY_API_URL } from "@hey/data/constants";

const EditGamePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [game, setGame] = useState<any>(null);
  const [pkg, setPkg] = useState<File | null>(null);
  const [icon, setIcon] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${HEY_API_URL}/games/manage`);
      const data = await res.json();
      const found = (data.games || []).find((g: any) => String(g.id) === String(id));
      setGame(found || null);
    };
    if (id) load();
  }, [id]);

  const save = async () => {
    if (!game) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("title", game.title || "");
    fd.append("slug", game.slug || "");
    fd.append("description", game.description || "");
    fd.append("instructions", game.instructions || "");
    fd.append("width", String(game.width || 1280));
    fd.append("height", String(game.height || 720));
    fd.append("categories", (game.categories || []).map((c: any) => c.name || c.category?.name).filter(Boolean).join(","));
    if (pkg) fd.append("package", pkg);
    if (icon) fd.append("icon", icon);
    if (cover) fd.append("cover", cover);

    const res = await fetch(`${HEY_API_URL}/games/manage/${id}`, { method: "PUT", body: fd });
    if (!res.ok) { setBusy(false); alert("Failed to update game"); return; }
    navigate("/admin/games?status=success&message=Game%20updated");
  };

  if (!game) return <div className="p-4 sm:p-6">Loading…</div>;

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Game</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input className="rounded border p-2" value={game.title} onChange={(e)=>setGame({ ...game, title: e.target.value })} />
        <input className="rounded border p-2" value={game.slug} onChange={(e)=>setGame({ ...game, slug: e.target.value })} />
        <textarea className="rounded border p-2 md:col-span-2" value={game.description} onChange={(e)=>setGame({ ...game, description: e.target.value })} />
        <textarea className="rounded border p-2 md:col-span-2" value={game.instructions || ""} onChange={(e)=>setGame({ ...game, instructions: e.target.value })} />
        <input className="rounded border p-2" type="number" value={game.width} onChange={(e)=>setGame({ ...game, width: Number(e.target.value) })} />
        <input className="rounded border p-2" type="number" value={game.height} onChange={(e)=>setGame({ ...game, height: Number(e.target.value) })} />
        <input className="rounded border p-2 md:col-span-2" defaultValue={(game.categories || []).map((c:any)=>c.name || c.category?.name).filter(Boolean).join(",")} onChange={(e)=>setGame({ ...game, categoriesString: e.target.value })} />
        <div className="md:col-span-2 space-y-3">
          <div><span className="block text-sm">Replace ZIP</span><input type="file" accept=".zip" onChange={(e)=>setPkg(e.target.files?.[0] ?? null)} /></div>
          <div><span className="block text-sm">Replace Icon</span><input type="file" accept="image/*" onChange={(e)=>setIcon(e.target.files?.[0] ?? null)} /></div>
          <div><span className="block text-sm">Replace Cover</span><input type="file" accept="image/*" onChange={(e)=>setCover(e.target.files?.[0] ?? null)} /></div>
        </div>
      </div>
      <button disabled={busy} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50" onClick={save}>{busy ? "Saving…" : "Save changes"}</button>
    </div>
  );
};

export default EditGamePage;


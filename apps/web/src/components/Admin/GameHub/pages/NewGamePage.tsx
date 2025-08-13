import { useState } from "react";
import { useNavigate } from "react-router";
import { HEY_API_URL } from "@hey/data/constants";

const NewGamePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [categories, setCategories] = useState("");
  const [pkg, setPkg] = useState<File | null>(null);
  const [icon, setIcon] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    if (!title || !slug || !description || !pkg) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("slug", slug);
    fd.append("description", description);
    fd.append("instructions", instructions);
    fd.append("width", String(width));
    fd.append("height", String(height));
    fd.append("categories", categories);
    fd.append("package", pkg);
    if (icon) fd.append("icon", icon);
    if (cover) fd.append("cover", cover);

    const res = await fetch(`${HEY_API_URL}/games/manage`, { method: "POST", body: fd });
    if (!res.ok) { setBusy(false); alert("Failed to create game"); return; }
    navigate("/admin/games?status=success&message=Game%20created");
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add Game</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input className="rounded border p-2" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <input className="rounded border p-2" placeholder="Slug (kebab-case)" value={slug} onChange={(e)=>setSlug(e.target.value)} />
        <textarea className="rounded border p-2 md:col-span-2" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
        <textarea className="rounded border p-2 md:col-span-2" placeholder="Instructions (optional)" value={instructions} onChange={(e)=>setInstructions(e.target.value)} />
        <input className="rounded border p-2" type="number" placeholder="Width" value={width} onChange={(e)=>setWidth(Number(e.target.value))} />
        <input className="rounded border p-2" type="number" placeholder="Height" value={height} onChange={(e)=>setHeight(Number(e.target.value))} />
        <input className="rounded border p-2 md:col-span-2" placeholder="Categories (comma separated)" value={categories} onChange={(e)=>setCategories(e.target.value)} />
        <div className="md:col-span-2 space-y-3">
          <div><span className="block text-sm">Game ZIP</span><input type="file" accept=".zip" onChange={(e)=>setPkg(e.target.files?.[0] ?? null)} /></div>
          <div><span className="block text-sm">Icon</span><input type="file" accept="image/*" onChange={(e)=>setIcon(e.target.files?.[0] ?? null)} /></div>
          <div><span className="block text-sm">Cover</span><input type="file" accept="image/*" onChange={(e)=>setCover(e.target.files?.[0] ?? null)} /></div>
        </div>
      </div>
      <button disabled={busy} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50" onClick={handleCreate}>
        {busy ? "Saving…" : "Create"}
      </button>
    </div>
  );
};

export default NewGamePage;


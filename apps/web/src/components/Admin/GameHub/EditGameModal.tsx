import { useEffect, useMemo, useState } from "react";
import { Game, GameCategory } from "@/helpers/gameHub";
import { HEY_API_URL } from "@hey/data/constants";

interface EditGameModalProps {
  open: boolean;
  game: Game | null;
  categories: GameCategory[];
  onClose: () => void;
  onSaved: () => void;
}

const EditGameModal = ({ open, game, categories, onClose, onSaved }: EditGameModalProps) => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [packageUrl, setPackageUrl] = useState("");
  const [entryFilePath, setEntryFilePath] = useState("index.html");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !game) return;
    setTitle(game.title || "");
    setSlug(game.slug || "");
    setDescription(game.description || "");
    setInstructions(game.instructions || "");
    setPackageUrl(game.gameFileUrl || "");
    setEntryFilePath(game.entryFilePath || "index.html");
    setCoverImageUrl(game.thumb1Url || "");
    setIconUrl(game.thumb2Url || "");
    setWidth(game.width || 1280);
    setHeight(game.height || 720);
    setStatus((game.status as any) || "Draft");
    setSelectedCategoryIds((game.categories || []).map((c) => c.id));
  }, [open, game]);

  const handleToggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const canSave = useMemo(() => {
    return title.trim().length > 0 && slug.trim().length >= 3 && packageUrl.trim().length > 0;
  }, [title, slug, packageUrl]);

  const handleSave = async () => {
    if (!game) return;
    if (!canSave) return;
    setSaving(true);
    try {
      const res = await fetch(`${HEY_API_URL}/games/manage/${game.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          instructions,
          packageUrl,
          entryFilePath,
          iconUrl,
          coverImageUrl,
          width: Number(width),
          height: Number(height),
          status,
          categoryIds: selectedCategoryIds,
        }),
      });
      if (!res.ok) {
        // eslint-disable-next-line no-alert
        alert("Failed to save game");
        return;
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open || !game) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-full sm:max-w-2xl rounded-lg bg-white shadow-lg dark:bg-gray-800 flex max-h-[90vh] flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit game</h3>
          <button
            aria-label="Close"
            className="rounded p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-700"
            onClick={onClose}
            onKeyDown={(e) => e.key === "Enter" && onClose()}
            tabIndex={0}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Game Title</label>
            <input className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Game Slug</label>
            <input className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Description</label>
            <textarea rows={3} className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Instructions</label>
            <textarea rows={3} className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Game URL (base)</label>
              <input className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={packageUrl} onChange={(e) => setPackageUrl(e.target.value)} placeholder="/uploads/games/abcd/stack/index.html (without file, if using base)" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Entry file</label>
              <input className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={entryFilePath} onChange={(e) => setEntryFilePath(e.target.value)} placeholder="index.html" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Card Cover URL</label>
              <input className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Icon URL</label>
              <input className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Width</label>
              <input type="number" className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Height</label>
              <input type="number" className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Status</label>
              <select className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Game category</label>
            <div className="max-h-40 overflow-auto rounded border border-gray-200 p-2 dark:border-gray-700">
              {categories.map((c) => (
                <label key={c.id} className="mb-1 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(c.id)}
                    onChange={() => handleToggleCategory(c.id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-4 py-3 dark:border-gray-700">
          <button
            className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!canSave || saving}
            onClick={handleSave}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGameModal;


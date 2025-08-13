import { useEffect, useMemo, useState } from "react";
import { HEY_API_URL } from "@hey/data/constants";

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  metaDescription?: string;
}

interface EditCategoryModalProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSaved: (prevName: string, nextName: string) => void;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

const EditCategoryModal = ({ open, category, onClose, onSaved }: EditCategoryModalProps) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !category) return;
    setName(category.name);
    setSlug(category.slug || "");
    setDescription(category.description || "");
    setMetaDescription(category.metaDescription || "");
  }, [open, category]);

  const computedSlug = useMemo(() => (slug ? slugify(slug) : slugify(name)), [slug, name]);
  const canSave = name.trim().length >= 2;

  const handleSave = async () => {
    if (!category) return;
    if (!canSave) return;
    setSaving(true);
    try {
      const res = await fetch(`${HEY_API_URL}/games/manage/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: computedSlug, description, metaDescription }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // eslint-disable-next-line no-alert
        alert(err.error || "Failed to update category");
        return;
      }
      onSaved(category.name, name);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg dark:bg-gray-800">
        <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit category</h3>
          <button
            aria-label="Close"
            className="rounded p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="px-4 py-4">
          <div className="mb-3 rounded-md border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-900 dark:border-yellow-900/40 dark:bg-yellow-900/20 dark:text-yellow-200">
            Changing category name will update how this category appears on all games.
          </div>
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Category Name</label>
          <input
            className="mb-3 w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Category Slug</label>
          <input
            className="mb-3 w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="online-games"
          />
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Description</label>
          <textarea
            className="mb-3 w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="(Optional) Category description"
          />
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Meta Description</label>
          <textarea
            className="w-full rounded border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            rows={3}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="(Optional) Category meta description"
          />
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

export default EditCategoryModal;


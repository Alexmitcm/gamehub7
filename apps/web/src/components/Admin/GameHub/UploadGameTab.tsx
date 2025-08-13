import { HEY_API_URL } from "@hey/data/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { hydrateBackendTokens } from "@/store/persisted/useAuthStore";
import Button from "../../Shared/UI/Button";

const uploadGameSchema = z.object({
  categories: z.array(z.string()).min(1, "At least one category is required"),
  description: z.string().optional(),
  height: z.number().min(240).max(1080).default(720),
  instructions: z.string().optional(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(15, "Slug must be less than 15 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  width: z.number().min(320).max(1920).default(1280)
});

const UploadGameTab = () => {
  const [formData, setFormData] = useState({
    categories: [] as string[],
    description: "",
    height: 720,
    instructions: "",
    slug: "",
    title: "",
    width: 1280
  });
  const [files, setFiles] = useState({
    gameFile: null as File | null,
    cardCover: null as File | null,
    thumb2: null as File | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      const formDataToSend = new FormData();

      // Add form data
      Object.entries(data).forEach(([key, value]) => {
        if (key === "categories") {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value as string);
        }
      });

      // Add files
      if (files.gameFile) formDataToSend.append("gameFile", files.gameFile);
      if (files.cardCover) formDataToSend.append("cardCover", files.cardCover);
      if (files.thumb2) formDataToSend.append("thumb2", files.thumb2);

      const { backendToken } = hydrateBackendTokens();

      const response = await fetch(`${HEY_API_URL}/games/upload`, {
        body: formDataToSend,
        headers: {
          "X-Access-Token": backendToken || ""
        },
        method: "POST"
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to upload game (${response.status})`
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast.success("Game uploaded successfully!");
      // Reset form
      setFormData({
        categories: [],
        description: "",
        height: 720,
        instructions: "",
        slug: "",
        title: "",
        width: 1280
      });
      setFiles({ gameFile: null, cardCover: null, thumb2: null });
      setErrors({});
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload game");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { backendToken } = hydrateBackendTokens();
    if (!backendToken) {
      toast.error("Please sign in to upload games");
      return;
    }

    try {
      const validatedData = uploadGameSchema.parse(formData);
      uploadMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <h3 className="font-medium text-blue-900 text-lg dark:text-blue-100">
          Upload Requirements
        </h3>
        <ul className="mt-2 text-blue-800 text-sm dark:text-blue-200">
          <li>• Game file must be a ZIP containing index.html in the root</li>
          <li>• Must include thumb_1.jpg (512x384px) in the root</li>
          <li>• Must include thumb_2.jpg (512x512px) in the root</li>
        </ul>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Title */}
          <div>
            <label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
              Game Title *
            </label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              onChange={(e) => handleInputChange("title", e.target.value)}
              type="text"
              value={formData.title}
            />
            {errors.title && (
              <p className="mt-1 text-red-600 text-sm dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
              Game Slug *
            </label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              onChange={(e) => handleInputChange("slug", e.target.value)}
              placeholder="game-title"
              type="text"
              value={formData.slug}
            />
            {errors.slug && (
              <p className="mt-1 text-red-600 text-sm dark:text-red-400">
                {errors.slug}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
            Description
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            value={formData.description}
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
            Instructions
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            onChange={(e) => handleInputChange("instructions", e.target.value)}
            rows={3}
            value={formData.instructions}
          />
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
              Game File (.zip) *
            </label>
            <input
              accept=".zip"
              className="mt-1 block w-full text-gray-500 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 file:text-sm hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-900/20 dark:file:text-blue-300"
              onChange={(e) =>
                handleFileChange("gameFile", e.target.files?.[0] || null)
              }
              type="file"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
                Card Cover (recommended 1280x720) *
              </label>
              <input
                accept="image/*"
                className="mt-1 block w-full text-gray-500 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 file:text-sm hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                onChange={(e) =>
                  handleFileChange("cardCover", e.target.files?.[0] || null)
                }
                type="file"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
                Optional Icon (512x512)
              </label>
              <input
                accept="image/*"
                className="mt-1 block w-full text-gray-500 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 file:text-sm hover:file:bg-blue-100 dark:text-gray-400 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                onChange={(e) =>
                  handleFileChange("thumb2", e.target.files?.[0] || null)
                }
                type="file"
              />
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
              Game Width
            </label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              max={1920}
              min={320}
              onChange={(e) =>
                handleInputChange("width", Number.parseInt(e.target.value))
              }
              type="number"
              value={formData.width}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
              Game Height
            </label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              max={1080}
              min={240}
              onChange={(e) =>
                handleInputChange("height", Number.parseInt(e.target.value))
              }
              type="number"
              value={formData.height}
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block font-medium text-gray-700 text-sm dark:text-gray-300">
            Categories *
          </label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            multiple
            onChange={(e) => {
              const selected = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
              handleInputChange("categories", selected);
            }}
            size={8}
            value={formData.categories}
          >
            <option value="Action">Action</option>
            <option value="Adventure">Adventure</option>
            <option value="Arcade">Arcade</option>
            <option value="Puzzle">Puzzle</option>
            <option value="Racing">Racing</option>
            <option value="Shooting">Shooting</option>
            <option value="Sports">Sports</option>
            <option value="Strategy">Strategy</option>
          </select>
          {errors.categories && (
            <p className="mt-1 text-red-600 text-sm dark:text-red-400">
              {errors.categories}
            </p>
          )}
        </div>

        <Button
          className="w-full"
          disabled={uploadMutation.isPending}
          loading={uploadMutation.isPending}
          type="submit"
        >
          Upload Game
        </Button>
      </form>
    </div>
  );
};

export default UploadGameTab;

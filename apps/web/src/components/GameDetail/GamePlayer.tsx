import { useEffect, useState } from "react";
import { Spinner } from "@/components/Shared/UI";

interface GamePlayerProps {
  gameFileUrl: string;
  entryFilePath?: string;
  title: string;
  width: number;
  height: number;
}

const GamePlayer = ({ gameFileUrl, entryFilePath, title, width, height }: GamePlayerProps) => {
  const [gameContent, setGameContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

    useEffect(() => {
    const loadGame = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Use the server-based game URL with detected entry file path
        const entry = entryFilePath || "index.html";
        const gameUrl = `${import.meta.env.VITE_API_URL || 'https://game5-production.up.railway.app'}${gameFileUrl}/${entry}`;
        setGameContent(gameUrl);
      } catch (err) {
        console.error("Error loading game:", err);
        setError(err instanceof Error ? err.message : "Failed to load game");
      } finally {
        setIsLoading(false);
      }
    };

    if (gameFileUrl) {
      loadGame();
    }
  }, [gameFileUrl]);

  useEffect(() => {
    // Cleanup blob URL on unmount
    return () => {
      if (gameContent && gameContent.startsWith("blob:")) {
        URL.revokeObjectURL(gameContent);
      }
    };
  }, [gameContent]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-700">
        <div className="text-center">
          <Spinner size="md" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading game...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-700">
        <div className="text-center">
          <p className="mb-2 text-red-500 dark:text-red-400">
            Failed to load game
          </p>
          <p className="mb-4 text-gray-600 text-sm dark:text-gray-400">
            {error}
          </p>
          <a
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            href={gameFileUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Download Game File
          </a>
        </div>
      </div>
    );
  }

  return (
    <iframe
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="h-full w-full border-0"
      src={gameContent}
      title={title}
    />
  );
};

export default GamePlayer;

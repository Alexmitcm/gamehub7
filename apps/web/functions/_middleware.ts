export interface Context {
  request: Request;
  next: () => Promise<Response>;
}

export const onRequest = async (context: Context) => {
  const { request } = context;
  const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";
  const url = new URL(request.url);
  const path = url.pathname;

  // Get API URL from environment or use Railway URL as fallback
  const API_BASE_URL =
    process.env.VITE_API_URL || "https://defigame-production.up.railway.app";

  const isBot =
    /bot|baidu|iframely|whatsapp|babbar|bytedance|facebook|meta/.test(
      userAgent
    );

  const createNoCacheResponse = async (targetUrl: string) => {
    const upstreamResponse = await fetch(targetUrl, {
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      headers: request.headers,
      method: request.method,
      redirect: "follow"
    });

    const newHeaders = new Headers(upstreamResponse.headers);
    newHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate");

    return new Response(upstreamResponse.body, {
      headers: newHeaders,
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText
    });
  };

  if (path === "/sitemap.xml" || path === "" || path.startsWith("/sitemap/")) {
    let targetUrl: string;

    if (!path || path === "/sitemap.xml") {
      targetUrl = `${API_BASE_URL}/sitemap/all.xml`;
    } else {
      const actualPath = path.replace("/sitemap/", "/");
      targetUrl = `${API_BASE_URL}/sitemap${actualPath}`;
    }

    return createNoCacheResponse(targetUrl);
  }

  if (
    isBot &&
    (path.startsWith("/u/") ||
      path.startsWith("/posts/") ||
      path.startsWith("/g/"))
  ) {
    const targetUrl = `${API_BASE_URL}/og${path}`;
    return createNoCacheResponse(targetUrl);
  }

  return context.next();
};

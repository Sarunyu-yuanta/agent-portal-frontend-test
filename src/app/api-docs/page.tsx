"use client";
import { useEffect } from "react";
import Script from "next/script";

export default function ApiDocsPage() {
  function init() {
    const win = window as unknown as Record<string, unknown>;
    const SwaggerUIBundle = win["SwaggerUIBundle"] as
      | ((...args: unknown[]) => void) & { presets: Record<string, unknown> }
      | undefined;
    if (!SwaggerUIBundle) return;
    SwaggerUIBundle({
      url: "/openapi.yaml",
      dom_id: "#swagger-ui",
      presets: [SwaggerUIBundle.presets["apis"]],
      layout: "BaseLayout",
      docExpansion: "list",
      defaultModelsExpandDepth: 2,
    });
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/swagger-ui.css" />
      <Script src="/swagger-ui-bundle.js" onLoad={init} strategy="afterInteractive" />
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-semibold text-gray-700">IC Dashboard API</span>
          <span className="text-xs text-gray-400 font-mono">v1.0.0</span>
        </div>
        <div id="swagger-ui" />
      </div>
    </>
  );
}

import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    // Skip API routes - they should be handled by their respective middleware
    if (req.originalUrl.startsWith("/api/")) {
      return next();
    }

    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, serve from dist/public (build output)
  // Note: serveStatic is only called when NODE_ENV !== "development"
  // When bundled with esbuild, the server runs from project root or dist/
  // Try multiple possible paths to handle different deployment scenarios
  const possiblePaths = [
    path.resolve(process.cwd(), "dist", "public"), // Primary: from project root (most reliable)
    path.resolve(process.cwd(), "public"), // Alternative: if running from dist/
    typeof import.meta.url !== "undefined" && typeof import.meta.dirname !== "undefined"
      ? path.resolve(import.meta.dirname, "public") // When bundled to dist/index.js
      : null,
  ].filter((p): p is string => p !== null);
  
  const distPath = possiblePaths.find(p => fs.existsSync(p));
  
  if (!distPath) {
    console.error(
      `[ERROR] Could not find the build directory. Tried: ${possiblePaths.join(", ")}`
    );
    console.error(
      `Current working directory: ${process.cwd()}`
    );
    console.error(
      `Make sure to run 'pnpm build' before starting the production server`
    );
    // Don't crash, but log the error clearly
    return;
  }
  
  console.log(`[INFO] Serving static files from: ${distPath}`);
  
  if (!fs.existsSync(path.resolve(distPath, "index.html"))) {
    console.error(
      `[ERROR] index.html not found in ${distPath}. Build may be incomplete.`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist (SPA routing)
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head><title>404 - Not Found</title></head>
          <body>
            <h1>404 - Not Found</h1>
            <p>The application build files are missing.</p>
            <p>Please ensure the build completed successfully by running: <code>pnpm build</code></p>
          </body>
        </html>
      `);
    }
  });
}

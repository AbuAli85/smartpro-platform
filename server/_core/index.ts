import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeSocket } from "./socket";
import { initializeCronJobs } from "./cronJobs";
import sseRouter from "../routes/sse";
import { startReminderScheduler } from "./reminderScheduler";
import { startFollowUpJob } from "../jobs/followUpJob";
import { initializeScheduledJobs } from "../jobs/scheduler";
import { startQualityMonitoringScheduler } from "./qualityMonitoringJob";
import { initializeWorkflowMonitoringJob } from "./workflowMonitoringJob";
import { apiLimiter } from "./rateLimiter";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Trust proxy for rate limiting behind reverse proxy
  app.set('trust proxy', 1);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Apply rate limiting to all API routes
  app.use("/api", apiLimiter);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // SSE notifications endpoint
  app.use("/api/sse", sseRouter);
  // tRPC API - add logging middleware before TRPC
  app.use("/api/trpc", (req, res, next) => {
    console.log(`[TRPC Request] ${req.method} ${req.originalUrl}`, {
      path: req.path,
      query: req.query,
      headers: {
        cookie: req.headers.cookie ? 'present' : 'missing',
        'content-type': req.headers['content-type'],
      },
    });
    next();
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext: async (opts) => {
        try {
          const ctx = await createContext(opts);
          console.log(`[TRPC Context] User: ${ctx.user ? `${ctx.user.id} (role: ${ctx.user.role})` : 'null'}`);
          return ctx;
        } catch (error) {
          console.error(`[TRPC Context Error]:`, error);
          throw error;
        }
      },
      onError: ({ error, path, type, ctx, input, req, res }) => {
        console.error(`[TRPC Error] ${type} ${path}:`, {
          code: error.code,
          message: error.message,
          cause: error.cause,
          stack: error.stack,
          user: ctx?.user ? `${ctx.user.id} (role: ${ctx.user.role})` : 'null',
        });
        // Ensure JSON response is sent for API routes
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'application/json');
        }
        // TRPC automatically sends JSON error responses, but we ensure content-type is set
      },
    })
  );
  
  // Explicit 404 handler for unmatched API routes to prevent HTML fallback
  app.use("/api/*", (req, res) => {
    console.warn(`[API 404] Unmatched API route: ${req.originalUrl}`);
    res.status(404).json({ error: "API endpoint not found" });
  });
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Initialize WebSocket server
  initializeSocket(server);

  // Initialize cron jobs for scheduled tasks
  initializeCronJobs();
  
  // Start booking reminder scheduler
  startReminderScheduler();
  
  // Start quality monitoring scheduler
  startQualityMonitoringScheduler();
  
  // Start workflow monitoring job (daily untranslated content scan)
  initializeWorkflowMonitoringJob();

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Start background jobs
    startFollowUpJob();
    
    // Initialize scheduled jobs
    initializeScheduledJobs();
  });
}

startServer().catch(console.error);

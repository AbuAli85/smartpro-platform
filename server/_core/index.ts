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
  
  // CRITICAL: Wrap res.end EARLY for all API routes to catch HTML responses
  // This must happen BEFORE any other API middleware to intercept ALL responses
  app.use("/api", (req, res, next) => {
    // Only wrap once per request
    if ((res as any)._htmlGuardWrapped) {
      return next();
    }
    (res as any)._htmlGuardWrapped = true;
    
    const originalEnd = res.end.bind(res);
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    
    // Wrap res.end to catch HTML being sent
    res.end = function(chunk?: any, encoding?: any, cb?: any) {
      if (chunk && typeof chunk === 'string') {
        const trimmed = chunk.trim().toLowerCase();
        if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) {
          console.error(`[API Guard] CRITICAL: HTML detected in res.end for ${req.originalUrl}`);
          console.error(`[API Guard] First 200 chars:`, chunk.substring(0, 200));
          console.error(`[API Guard] Stack trace:`, new Error().stack);
          
          // Replace with JSON error
          const errorResponse = JSON.stringify({
            error: "Internal server error: HTML response detected for API route",
            originalPath: req.originalUrl,
            detectedAt: "res.end",
          });
          res.setHeader('Content-Type', 'application/json');
          res.status(500);
          return originalEnd(errorResponse, encoding, cb);
        }
      }
      return originalEnd(chunk, encoding, cb);
    };
    
    // Wrap res.json to ensure Content-Type is set
    res.json = function(body?: any) {
      res.setHeader('Content-Type', 'application/json');
      return originalJson(body);
    };
    
    // Wrap res.send to catch HTML being sent via res.send
    res.send = function(body?: any) {
      if (typeof body === 'string') {
        const trimmed = body.trim().toLowerCase();
        if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) {
          console.error(`[API Guard] CRITICAL: HTML detected in res.send for ${req.originalUrl}`);
          console.error(`[API Guard] First 200 chars:`, body.substring(0, 200));
          console.error(`[API Guard] Stack trace:`, new Error().stack);
          
          // Replace with JSON error
          res.setHeader('Content-Type', 'application/json');
          res.status(500);
          return originalJson({
            error: "Internal server error: HTML response detected for API route",
            originalPath: req.originalUrl,
            detectedAt: "res.send",
          });
        }
      }
      return originalSend(body);
    };
    
    next();
  });
  
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
        const contentType = res.getHeader('Content-Type');
        const isJson = contentType && String(contentType).includes('application/json');
        
        console.error(`[TRPC Error] ${type} ${path}:`, {
          code: error.code,
          message: error.message,
          cause: error.cause,
          stack: error.stack,
          user: ctx?.user ? `${ctx.user.id} (role: ${ctx.user.role})` : 'null',
          headersSent: res.headersSent,
          statusCode: res.statusCode,
          contentType: contentType,
          isJson: isJson,
        });
        
        // CRITICAL: Always ensure JSON response for API errors
        // Even if headers are sent, verify and fix Content-Type if needed
        if (res.headersSent) {
          // Headers already sent - verify Content-Type is correct
          if (!isJson) {
            console.error(`[TRPC Error] CRITICAL: Headers sent but Content-Type is NOT JSON: ${contentType}`);
            console.error(`[TRPC Error] This will cause HTML to be served! Attempting to intercept...`);
            // Unfortunately, we can't change headers after they're sent, but we've already
            // wrapped res.end earlier, so that should catch it
          } else {
            console.log(`[TRPC Error] Response already sent with correct Content-Type: ${contentType}`);
          }
        } else {
          // Headers not sent - send JSON response ourselves
          console.log(`[TRPC Error] Sending JSON error response for ${path}`);
          const statusCode = error.code === 'UNAUTHORIZED' ? 401 :
                           error.code === 'FORBIDDEN' ? 403 :
                           error.code === 'NOT_FOUND' ? 404 :
                           error.code === 'BAD_REQUEST' ? 400 : 500;
          
          // Explicitly set Content-Type and status before sending
          res.status(statusCode);
          res.setHeader('Content-Type', 'application/json');
          
          // Use res.json to ensure proper JSON formatting
          res.json({
            error: {
              message: error.message,
              code: error.code,
              data: error.cause,
            },
          });
          
          console.log(`[TRPC Error] JSON error response sent for ${path} with status ${statusCode}`);
        }
      },
    })
  );
  
  // Explicit 404 handler for unmatched API routes to prevent HTML fallback
  app.use("/api/*", (req, res) => {
    console.warn(`[API 404] Unmatched API route: ${req.originalUrl}`);
    res.status(404).json({ error: "API endpoint not found" });
  });
  
  // Secondary check: If an API route reaches here without a response, something is wrong
  // (Primary HTML protection is now done earlier in the middleware chain)
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith("/api/") && !res.headersSent) {
      console.error(`[API Guard] API route reached post-TRPC middleware without response: ${req.originalUrl}`);
      return res.status(500).json({ 
        error: "Internal server error: API route was not handled properly" 
      });
    }
    next();
  });
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Global error handler - MUST be after all routes but before server starts
  // This ensures any unhandled errors return JSON for API routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`[Global Error Handler] Unhandled error for ${req.originalUrl}:`, err);
    
    // For API routes, always return JSON
    if (req.originalUrl.startsWith("/api/")) {
      if (!res.headersSent) {
        return res.status(err.status || 500).json({
          error: err.message || "Internal server error",
          code: err.code,
        });
      }
    }
    
    // For non-API routes, pass to default error handler
    next(err);
  });
  
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

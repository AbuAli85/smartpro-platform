import "dotenv/config";
import express from "express";
import cors from "cors";
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

/** Allowed CORS origins (comma-separated in CORS_ORIGIN, or default list) */
function getAllowedOrigins(): string[] {
  const env = process.env.CORS_ORIGIN;
  if (env && env.trim()) {
    return env.split(",").map((o) => o.trim()).filter(Boolean);
  }
  return [
    "https://sanad.thesmartpro.io",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ];
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Trust proxy for rate limiting behind reverse proxy
  app.set('trust proxy', 1);

  // CORS: allow frontend origin so browser permits API requests (preflight + credentials)
  const allowedOrigins = getAllowedOrigins();
  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow requests with no origin (e.g. same-origin, Postman)
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        cb(null, false);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "trpc-batch-mode", "Accept"],
    })
  );
  
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
    
    // Log API request entry for debugging
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    (req as any)._apiRequestId = requestId;
    console.log(`[API Guard] [${requestId}] Request started: ${req.method} ${req.originalUrl}`, {
      path: req.path,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      headers: {
        'content-type': req.headers['content-type'],
        'accept': req.headers['accept'],
        'user-agent': req.headers['user-agent']?.substring(0, 50),
      },
    });
    
    const originalEnd = res.end.bind(res);
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    
    // Track response method calls
    let responseMethodCalled = false;
    const trackResponse = (method: string) => {
      if (!responseMethodCalled) {
        responseMethodCalled = true;
        console.log(`[API Guard] [${requestId}] Response sent via ${method}`, {
          statusCode: res.statusCode,
          contentType: res.getHeader('Content-Type'),
          headersSent: res.headersSent,
        });
      }
    };
    
    // Wrap res.end to catch HTML being sent
    res.end = function(chunk?: any, encoding?: any, cb?: any) {
      trackResponse('res.end');
      
      if (chunk && typeof chunk === 'string') {
        const trimmed = chunk.trim().toLowerCase();
        if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) {
          console.error(`[API Guard] [${requestId}] CRITICAL: HTML detected in res.end for ${req.originalUrl}`);
          console.error(`[API Guard] [${requestId}] First 200 chars:`, chunk.substring(0, 200));
          console.error(`[API Guard] [${requestId}] Stack trace:`, new Error().stack);
          console.error(`[API Guard] [${requestId}] Response state:`, {
            statusCode: res.statusCode,
            headersSent: res.headersSent,
            contentType: res.getHeader('Content-Type'),
          });
          
          // Replace with JSON error
          const errorResponse = JSON.stringify({
            error: "Internal server error: HTML response detected for API route",
            originalPath: req.originalUrl,
            detectedAt: "res.end",
            requestId,
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
      trackResponse('res.json');
      res.setHeader('Content-Type', 'application/json');
      return originalJson(body);
    };
    
    // Wrap res.send to catch HTML being sent via res.send
    res.send = function(body?: any) {
      trackResponse('res.send');
      
      if (typeof body === 'string') {
        const trimmed = body.trim().toLowerCase();
        if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) {
          console.error(`[API Guard] [${requestId}] CRITICAL: HTML detected in res.send for ${req.originalUrl}`);
          console.error(`[API Guard] [${requestId}] First 200 chars:`, body.substring(0, 200));
          console.error(`[API Guard] [${requestId}] Stack trace:`, new Error().stack);
          console.error(`[API Guard] [${requestId}] Response state:`, {
            statusCode: res.statusCode,
            headersSent: res.headersSent,
            contentType: res.getHeader('Content-Type'),
          });
          
          // Replace with JSON error
          res.setHeader('Content-Type', 'application/json');
          res.status(500);
          return originalJson({
            error: "Internal server error: HTML response detected for API route",
            originalPath: req.originalUrl,
            detectedAt: "res.send",
            requestId,
          });
        }
      }
      return originalSend(body);
    };
    
    // Log when request completes without response (shouldn't happen)
    res.on('finish', () => {
      console.log(`[API Guard] [${requestId}] Request completed: ${req.method} ${req.originalUrl}`, {
        statusCode: res.statusCode,
        contentType: res.getHeader('Content-Type'),
        responseMethodCalled,
      });
    });
    
    next();
  });
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // SSE notifications endpoint
  app.use("/api/sse", sseRouter);
  // tRPC API - add logging middleware before TRPC
  app.use("/api/trpc", (req, res, next) => {
    const queryString = req.url.split('?')[1] || '';
    const isBatchRequest = queryString.includes('batch=1');
    const isListModels = queryString.includes('revenue-models') && queryString.includes('listModels');
    
    console.log(`[TRPC Request] ${req.method} ${req.originalUrl}`, {
      path: req.path,
      query: req.query,
      queryString: queryString.substring(0, 200), // First 200 chars
      isBatchRequest,
      isListModels,
      headers: {
        cookie: req.headers.cookie ? 'present' : 'missing',
        'content-type': req.headers['content-type'],
      },
    });
    
    // Special logging only for revenue-models listModels with null input (not auth.me)
    if (isListModels && queryString.includes('input=%7B%220%22%3A%7B%22json%22%3Anull')) {
      console.log(`[TRPC Request] DETECTED PROBLEMATIC REQUEST PATTERN - listModels with null input`);
      console.log(`[TRPC Request] Full query string:`, queryString);
    }
    
    next();
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext: async (opts) => {
        const requestId = (opts.req as any)._apiRequestId || 'unknown';
        try {
          const ctx = await createContext(opts);
          console.log(`[TRPC Context] [${requestId}] Context created:`, {
            user: ctx.user ? `${ctx.user.id} (role: ${ctx.user.role})` : 'null',
            language: ctx.language,
            hasAuth: !!ctx.user,
          });
          return ctx;
        } catch (error) {
          console.error(`[TRPC Context Error] [${requestId}]:`, error);
          throw error;
        }
      },
      onError: ({ error, path, type, ctx, input, req, res }) => {
        const requestId = (req as any)._apiRequestId || 'unknown';
        const contentType = res.getHeader('Content-Type');
        const isJson = contentType && String(contentType).includes('application/json');
        
        console.error(`[TRPC Error] [${requestId}] ${type} ${path}:`, {
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
            console.error(`[TRPC Error] [${requestId}] CRITICAL: Headers sent but Content-Type is NOT JSON: ${contentType}`);
            console.error(`[TRPC Error] [${requestId}] This will cause HTML to be served! Attempting to intercept...`);
            // Unfortunately, we can't change headers after they're sent, but we've already
            // wrapped res.end earlier, so that should catch it
          } else {
            console.log(`[TRPC Error] [${requestId}] Response already sent with correct Content-Type: ${contentType}`);
          }
        } else {
          // Headers not sent - send JSON response ourselves
          console.log(`[TRPC Error] [${requestId}] Sending JSON error response for ${path}`);
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
          
          console.log(`[TRPC Error] [${requestId}] JSON error response sent for ${path} with status ${statusCode}`);
        }
      },
    })
  );
  
  // Test endpoint to verify API responses are JSON (for debugging)
  app.get("/api/test/json-response", (req, res) => {
    res.json({
      success: true,
      message: "API endpoint is returning JSON correctly",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      middlewareVersion: "2.0",
    });
  });
  
  // Test endpoint to verify HTML interception works
  app.get("/api/test/html-interception", (req, res) => {
    // This should never actually send HTML due to our guards, but tests the interception
    console.log(`[Test Endpoint] Testing HTML interception for ${req.originalUrl}`);
    res.status(200).json({
      success: true,
      message: "HTML interception middleware is active",
      note: "If you see HTML here, the middleware failed",
      middlewareVersion: "2.0",
    });
  });
  
  // Health check endpoint that also verifies middleware is working
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      middleware: "active",
      version: "2.0",
    });
  });
  
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

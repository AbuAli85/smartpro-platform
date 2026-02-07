import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { lookupIPLocation } from "./ipGeolocation";
import { checkSuspiciousLocation, checkBruteForceAttempt } from "./securityAlertService";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    console.log("[OAuth] Callback received:", { 
      hasCode: !!code, 
      hasState: !!state,
      query: req.query 
    });

    if (!code || !state) {
      console.error("[OAuth] Missing required parameters:", { code: !!code, state: !!state });
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      console.log("[OAuth] Exchanging code for token...");
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      console.log("[OAuth] Token exchange successful");
      
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      console.log("[OAuth] User info retrieved:", { openId: userInfo.openId, email: userInfo.email });

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      // Get user ID for audit logging
      const user = await db.getUserByOpenId(userInfo.openId);

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Get IP address for session tracking and security checks
      const ipAddress = req.ip || req.socket.remoteAddress || "Unknown";
      const location = lookupIPLocation(ipAddress);
      
      // Track active session with geolocation
      if (user?.id) {
        await db.upsertActiveSession({
          sessionId: sessionToken,
          userId: user.id,
          deviceInfo: {
            browser: req.headers["user-agent"]?.split("/")[0] || "Unknown",
            os: req.headers["user-agent"]?.includes("Windows") ? "Windows" : 
                req.headers["user-agent"]?.includes("Mac") ? "macOS" : 
                req.headers["user-agent"]?.includes("Linux") ? "Linux" : "Unknown",
            isMobile: /mobile/i.test(req.headers["user-agent"] || ""),
          },
          ipAddress,
          userAgent: req.headers["user-agent"],
          location: location || undefined,
          expiresAt: new Date(Date.now() + ONE_YEAR_MS),
        });
        
        // Check for security threats
        await checkSuspiciousLocation(
          user.id,
          userInfo.openId,
          ipAddress,
          sessionToken,
          req.headers["user-agent"]
        );
      }

      // Log successful login
      await db.logAuthEvent({
        userId: user?.id,
        openId: userInfo.openId,
        eventType: "login_success",
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
        deviceInfo: {
          browser: req.headers["user-agent"]?.split("/")[0],
          isMobile: /mobile/i.test(req.headers["user-agent"] || ""),
        },
        metadata: {
          loginMethod: userInfo.loginMethod ?? userInfo.platform,
        },
        success: true,
        severity: "info",
      });

      const frontendBase = (process.env.FRONTEND_URL ?? "").replace(/\/$/, "");
      res.redirect(302, frontendBase || "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      console.error("[OAuth] Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        code,
        state,
      });
      
      // Check for brute force attempts
      const ipAddress = req.ip || req.socket.remoteAddress || "Unknown";
      try {
        await checkBruteForceAttempt(ipAddress, req.headers["user-agent"]);
      } catch (bruteForceError) {
        console.error("[OAuth] Brute force check failed:", bruteForceError);
      }
      
      // Log failed login attempt
      try {
        await db.logAuthEvent({
          openId: code, // Use code as identifier since we don't have openId yet
          eventType: "login_failure",
          ipAddress,
          userAgent: req.headers["user-agent"],
          metadata: {
            reason: error instanceof Error ? error.message : "Unknown error",
            errorStack: error instanceof Error ? error.stack : undefined,
          },
          success: false,
          severity: "warning",
        });
      } catch (logError) {
        console.error("[OAuth] Failed to log auth event:", logError);
      }
      
      // Redirect to error page with error details
      const errorType = error instanceof Error && error.message.includes("token") 
        ? "token_exchange_failed" 
        : error instanceof Error && error.message.includes("user") 
        ? "user_info_failed" 
        : error instanceof Error && error.message.includes("network") 
        ? "network_error" 
        : "oauth_failed";
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const authErrorPath = `/auth-error?type=${encodeURIComponent(errorType)}&message=${encodeURIComponent(errorMessage)}`;
      const frontendBase = (process.env.FRONTEND_URL ?? "").replace(/\/$/, "");
      const redirectUrl = frontendBase ? `${frontendBase}${authErrorPath}` : authErrorPath;
      res.redirect(302, redirectUrl);
      return;
    }
  });
}

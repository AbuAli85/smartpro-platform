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

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

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

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      
      // Check for brute force attempts
      const ipAddress = req.ip || req.socket.remoteAddress || "Unknown";
      await checkBruteForceAttempt(ipAddress, req.headers["user-agent"]);
      
      // Log failed login attempt
      await db.logAuthEvent({
        openId: code, // Use code as identifier since we don't have openId yet
        eventType: "login_failure",
        ipAddress,
        userAgent: req.headers["user-agent"],
        metadata: {
          reason: error instanceof Error ? error.message : "Unknown error",
        },
        success: false,
        severity: "warning",
      });
      
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

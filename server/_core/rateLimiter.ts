import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// General API rate limiter - 500 requests per 15 minutes (increased for development)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many requests",
      message: "You have exceeded the rate limit. Please try again later.",
      retryAfter: Math.ceil((req as any).rateLimit?.resetTime ? ((req as any).rateLimit.resetTime - Date.now()) / 1000 : 60),
    });
  },
});

// Strict rate limiter for authentication endpoints - 50 requests per 15 minutes (increased for development)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 login/register attempts per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many authentication attempts",
      message: "You have exceeded the maximum number of login attempts. Please try again in 15 minutes.",
      retryAfter: Math.ceil((req as any).rateLimit?.resetTime ? ((req as any).rateLimit.resetTime - Date.now()) / 1000 : 900),
    });
  },
});

// Password reset rate limiter - 3 requests per hour
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: "Too many password reset attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many password reset attempts",
      message: "You have exceeded the maximum number of password reset requests. Please try again in 1 hour.",
      retryAfter: Math.ceil((req as any).rateLimit?.resetTime ? ((req as any).rateLimit.resetTime - Date.now()) / 1000 : 3600),
    });
  },
});

// File upload rate limiter - 20 requests per 15 minutes
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 uploads per windowMs
  message: "Too many file uploads, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many file uploads",
      message: "You have exceeded the file upload limit. Please try again later.",
      retryAfter: Math.ceil((req as any).rateLimit?.resetTime ? ((req as any).rateLimit.resetTime - Date.now()) / 1000 : 900),
    });
  },
});

// Booking creation rate limiter - 10 bookings per hour
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 booking creations per hour
  message: "Too many booking attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many booking attempts",
      message: "You have exceeded the booking creation limit. Please try again in 1 hour.",
      retryAfter: Math.ceil((req as any).rateLimit?.resetTime ? ((req as any).rateLimit.resetTime - Date.now()) / 1000 : 3600),
    });
  },
});

// Review submission rate limiter - 5 reviews per hour
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 review submissions per hour
  message: "Too many review submissions, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many review submissions",
      message: "You have exceeded the review submission limit. Please try again in 1 hour.",
      retryAfter: Math.ceil((req as any).rateLimit?.resetTime ? ((req as any).rateLimit.resetTime - Date.now()) / 1000 : 3600),
    });
  },
});

// Message sending rate limiter - 30 messages per 15 minutes
export const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 messages per windowMs
  message: "Too many messages sent, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many messages",
      message: "You have exceeded the message sending limit. Please slow down.",
      retryAfter: Math.ceil((req as any).rateLimit?.resetTime ? ((req as any).rateLimit.resetTime - Date.now()) / 1000 : 900),
    });
  },
});

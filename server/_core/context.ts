import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getLanguageFromHeader, type Language } from "../helpers/i18n";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  language: Language;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Detect language from Accept-Language header
  const acceptLanguage = opts.req.headers["accept-language"];
  const language = getLanguageFromHeader(acceptLanguage);

  return {
    req: opts.req,
    res: opts.res,
    user,
    language,
  };
}

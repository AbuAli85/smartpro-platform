import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "@shared/superjson-config";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import "./styles/datepicker.css";
import "./lib/i18n"; // Initialize i18n
import { LanguageProvider } from "./contexts/LanguageContext";
import { initializeAnalytics } from "./utils/analytics";

const queryClient = new QueryClient();

const isAuthError = (error: unknown): boolean => {
  if (!(error instanceof TRPCClientError)) return false;
  const code = error.data?.code;
  return code === "UNAUTHORIZED" || code === "FORBIDDEN";
};

const redirectToLoginIfAuthError = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;
  if (!isAuthError(error)) return;

  const loginUrl = getLoginUrl();
  window.location.href = loginUrl ?? "/login";
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    if (isAuthError(error)) {
      redirectToLoginIfAuthError(error);
    } else {
      console.error("[API Query Error]", error);
    }
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    if (isAuthError(error)) {
      redirectToLoginIfAuthError(error);
    } else {
      console.error("[API Mutation Error]", error);
    }
  }
});

// When the frontend is served from static hosting (e.g. Vercel) without the Node API,
// set VITE_API_URL to your API origin (e.g. https://api.example.com) so TRPC requests
// go to the API instead of the same origin (which would return index.html and cause
// "Unexpected token '<'" / TRPCClientError).
const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const trpcUrl = apiBase ? `${apiBase}/api/trpc` : "/api/trpc";

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: trpcUrl,
      transformer: superjson,
      fetch(input, init) {
        // Get current language from localStorage
        const language = localStorage.getItem("smartpro-language") || "en";
        
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers: {
            ...((init as RequestInit)?.headers || {}),
            "Accept-Language": language,
          },
        });
      },
    }),
  ],
});

// Initialize analytics if configured
initializeAnalytics();

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </QueryClientProvider>
  </trpc.Provider>
);

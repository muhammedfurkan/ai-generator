import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Hata durumunda 2 kez retry yap, ardından pes et
      retry: (failureCount, error) => {
        // Unauthorized hatalarında retry yapma
        if (error instanceof TRPCClientError && error.message === UNAUTHED_ERR_MSG) {
          return false;
        }
        return failureCount < 2;
      },
      // Yeniden fetch etmeden önce 30 saniye bekle
      staleTime: 30 * 1000,
      // Sayfa focus'ta değilken refetch yapma
      refetchOnWindowFocus: false,
      // Error boundary kullanmak yerine komponentin kendisine error state döndür
      throwOnError: false,
    },
    mutations: {
      // Mutation hatalarında retry yapma (kullanıcı tekrar denemeli)
      retry: false,
      // Error boundary kullanma
      throwOnError: false,
    },
  },
});

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (typeof window === "undefined") return;

  // TRPCClientError kontrolü
  if (!(error instanceof TRPCClientError)) return;

  const errorMessage = (error.message || "").toLowerCase();

  // Unauthorized hata kontrolü - hem exact match hem de pattern matching
  const isUnauthorized =
    error.message === UNAUTHED_ERR_MSG || // Exact match (our standard error)
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("unauthenticated") ||
    errorMessage.includes("jwt") ||
    errorMessage.includes("expired") ||
    errorMessage.includes("session") ||
    errorMessage.includes("forbidden") ||
    errorMessage.includes("10001") ||
    errorMessage.includes("please login");

  if (!isUnauthorized) return;

  // Don't redirect if we're already on auth-related pages
  const currentPath = window.location.pathname;
  if (currentPath.startsWith("/login") ||
    currentPath.startsWith("/register") ||
    currentPath.startsWith("/auth/callback")) {
    return;
  }

  // Check if Clerk session exists - if so, don't redirect yet
  // The backend will use Clerk session for authentication
  const hasClerkSession = document.cookie.includes("__session");
  if (hasClerkSession) {
    console.log("[Auth] Clerk session exists, skipping redirect - backend will handle auth");
    // Invalidate auth query to refetch with Clerk session
    queryClient.invalidateQueries({ queryKey: [["auth", "me"]] });
    return;
  }

  console.log("[Auth] Unauthorized error detected, no Clerk session, redirecting to login");
  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          signal: AbortSignal.timeout(1500000), // 25 minutes timeout for long-running AI operations
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </QueryClientProvider>
  </trpc.Provider>
);

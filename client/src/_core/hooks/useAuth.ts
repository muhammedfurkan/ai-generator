import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    const loginUrl = getLoginUrl();

    // Helper function to clear all client-side state
    const clearClientState = () => {
      // Clear all local storage
      localStorage.clear();

      // Clear client-side accessible cookies (non-HTTP-only)
      document.cookie.split(";").forEach((c) => {
        const cookieName = c.split("=")[0].trim();
        // Clear for both root path and all paths
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${window.location.hostname}`;
      });

      // Clear React Query cache synchronously
      utils.auth.me.setData(undefined, null);
    };

    try {
      // Call server logout endpoint to clear HTTP-only cookies
      await logoutMutation.mutateAsync();
      console.log('[useAuth] Logout successful');
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        console.log('[useAuth] Already logged out, proceeding with cleanup');
        // Don't return - still need to clean up client state
      } else {
        console.error('[useAuth] Logout error:', error);
        // Don't throw - still need to clean up client state and redirect
      }
    }

    // Always clear client state regardless of server response
    clearClientState();

    // Invalidate auth query
    try {
      await utils.auth.me.invalidate();
    } catch {
      // Ignore invalidation errors
    }

    // Force redirect to login page - use replace to prevent back button issues
    console.log('[useAuth] Redirecting to login page:', loginUrl);
    window.location.replace(loginUrl);
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(meQuery.data)
    );
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}

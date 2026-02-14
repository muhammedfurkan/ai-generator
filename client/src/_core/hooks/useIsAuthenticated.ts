import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Simple auth check that uses backend session authentication
 * Returns true if user is authenticated via backend session
 */
export function useIsAuthenticated() {
  const { isAuthenticated, loading } = useAuth();

  return {
    isAuthenticated,
    isLoading: loading,
    backendAuth: isAuthenticated,
  };
}

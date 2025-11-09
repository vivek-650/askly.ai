// Query Client Provider with persistence
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState } from "react";

// Create a persister that uses localStorage
const createPersister = () => {
  if (typeof window !== "undefined") {
    return createSyncStoragePersister({
      storage: window.localStorage,
      key: "ASKLY_QUERY_CACHE",
    });
  }
  return null;
};

export function ReactQueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests
            retry: 1,
            // Don't refetch on window focus in dev
            refetchOnWindowFocus: process.env.NODE_ENV === "production",
            // Don't refetch on mount if data is fresh
            refetchOnMount: false,
            // Don't refetch on reconnect if data is fresh
            refetchOnReconnect: false,
          },
        },
      })
  );

  const persister = createPersister();

  if (persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          buster: "askly-v1", // Change this to invalidate all caches
        }}
      >
        {children}
      </PersistQueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

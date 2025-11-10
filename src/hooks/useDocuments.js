// Custom React Query hooks for document operations
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const documentKeys = {
  all: ["documents"],
  list: () => [...documentKeys.all, "list"],
  detail: (id) => [...documentKeys.all, "detail", id],
};

/**
 * Fetch all user documents
 */
export function useDocuments(options = {}) {
  return useQuery({
    queryKey: documentKeys.list(),
    queryFn: async () => {
      const response = await fetch("/api/documents", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();

      // Transform documents to match UI expectations
      const documents = (data.documents || []).map((doc) => ({
        id: doc.documentId,
        documentId: doc.documentId,
        name: doc.name,
        type: doc.type,
        date: new Date(doc.uploadedAt).toLocaleDateString(),
        uploadedAt: doc.uploadedAt,
        chunks: doc.chunks,
        url: doc.url,
      }));

      console.log("Fetched and transformed documents:", documents);
      return documents;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // Keep showing previous list during refetch to avoid UI flicker/vanish
    placeholderData: (prev) => prev,
    // Allow caller to control enabling (e.g., only when signed in) — default true
    enabled: options.enabled !== undefined ? options.enabled : true,
  });
}

/**
 * Upload PDF file mutation
 */
export function useUploadPDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/file", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log("Upload success, data:", data);

      // Optimistically update cache with new document
      queryClient.setQueryData(documentKeys.list(), (old = []) => {
        console.log("Current documents in cache:", old);
        const newDoc = {
          id: data.data.documentId,
          documentId: data.data.documentId,
          name: data.data.fileName,
          type: "pdf",
          date: new Date(data.data.uploadedAt).toLocaleDateString(),
          uploadedAt: data.data.uploadedAt,
          chunks: data.data.chunks,
        };
        console.log("Adding new document:", newDoc);
        const filtered = old.filter((d) => d.documentId !== newDoc.documentId);
        const updated = [...filtered, newDoc];
        console.log("Updated documents list:", updated);
        return updated;
      });

      // Delay refetch slightly to let indexing commit, preventing an immediate empty fetch
      setTimeout(() => {
        queryClient.refetchQueries({
          queryKey: documentKeys.list(),
          type: "active",
        });
      }, 1500);
      console.log("Scheduled documents refetch after indexing...");
    },
  });
}

/**
 * Upload website URL mutation
 */
export function useUploadWebsite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, urlName }) => {
      const response = await fetch("/api/upload/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url, urlName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Website indexing failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Optimistically update cache
      queryClient.setQueryData(documentKeys.list(), (old = []) => {
        const newDoc = {
          id: data.data.documentId,
          documentId: data.data.documentId,
          name: new URL(data.data.url).hostname,
          type: "website",
          date: new Date(data.data.indexedAt).toLocaleDateString(),
          uploadedAt: data.data.indexedAt,
          url: data.data.url,
          chunks: data.data.chunks,
        };
        const filtered = old.filter((d) => d.documentId !== newDoc.documentId);
        return [...filtered, newDoc];
      });

      // Delay refetch to avoid replacing optimistic data with an empty immediate response
      setTimeout(() => {
        queryClient.refetchQueries({
          queryKey: documentKeys.list(),
          type: "active",
        });
      }, 1500);
    },
  });
}

/**
 * Upload text mutation
 */
export function useUploadText() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ text, textName }) => {
      const response = await fetch("/api/upload/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text, textName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Text indexing failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Optimistically update cache
      queryClient.setQueryData(documentKeys.list(), (old = []) => {
        const newDoc = {
          id: data.data.documentId,
          documentId: data.data.documentId,
          name: data.data.textName,
          type: "text",
          uploadedAt: data.data.indexedAt,
          chunks: data.data.chunks,
        };
        const filtered = old.filter((d) => d.documentId !== newDoc.documentId);
        return [...filtered, newDoc];
      });

      // Delay refetch to avoid transient empty lists
      setTimeout(() => {
        queryClient.refetchQueries({
          queryKey: documentKeys.list(),
          type: "active",
        });
      }, 1500);
    },
  });
}

/**
 * Upload YouTube video mutation
 */
export function useUploadYouTube() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (url) => {
      const response = await fetch("/api/upload/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.details || error.error || "YouTube indexing failed"
        );
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log("YouTube upload success:", data);

      // Optimistically update cache
      queryClient.setQueryData(documentKeys.list(), (old = []) => {
        const newDoc = {
          id: data.data.documentId,
          documentId: data.data.documentId,
          name: data.data.videoTitle || `YouTube Video ${data.data.videoId}`,
          type: "youtube",
          date: new Date(data.data.indexedAt).toLocaleDateString(),
          uploadedAt: data.data.indexedAt,
          url: data.data.url,
          chunks: data.data.chunks,
          videoId: data.data.videoId,
        };
        const filtered = old.filter((d) => d.documentId !== newDoc.documentId);
        const updated = [...filtered, newDoc];
        console.log("Updated documents with YouTube video:", updated);
        return updated;
      });

      // Delay refetch to let indexing commit
      setTimeout(() => {
        queryClient.refetchQueries({
          queryKey: documentKeys.list(),
          type: "active",
        });
      }, 1500);
      console.log("Scheduled documents refetch after YouTube indexing...");
    },
  });
}

/**
 * Delete document mutation
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      return response.json();
    },
    onMutate: async (documentId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: documentKeys.list() });

      // Snapshot previous value
      const previousDocuments = queryClient.getQueryData(documentKeys.list());

      // Optimistically remove from cache
      queryClient.setQueryData(documentKeys.list(), (old = []) =>
        old.filter((doc) => doc.documentId !== documentId)
      );

      // Return context with previous value
      return { previousDocuments };
    },
    onError: (err, documentId, context) => {
      // Rollback on error
      if (context?.previousDocuments) {
        queryClient.setQueryData(
          documentKeys.list(),
          context.previousDocuments
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: documentKeys.list() });
    },
  });
}

/**
 * Send chat message mutation
 */
export function useChatMessage() {
  return useMutation({
    mutationFn: async ({ message, documentId, conversationHistory }) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message,
          documentId,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Chat request failed");
      }

      return response.json();
    },
  });
}

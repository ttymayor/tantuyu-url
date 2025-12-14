import useSWR, { useSWRConfig } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UseUrlsOptions {
  page: number;
  limit: number;
}

export function useUrls({ page, limit }: UseUrlsOptions) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/urls?page=${page}&limit=${limit}`,
    fetcher,
  );

  return {
    urls: data?.urls || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUrlRefresher() {
  const { mutate } = useSWRConfig();

  return () => {
    // Invalidate all keys starting with /api/urls to refresh the list regardless of pagination
    mutate((key) => typeof key === "string" && key.startsWith("/api/urls"));
  };
}
